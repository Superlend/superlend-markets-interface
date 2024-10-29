import { BaseProvider, Network, StaticJsonRpcProvider } from '@ethersproject/providers';
import { logger } from 'ethers';

const DEFAULT_FALL_FORWARD_DELAY = 60000;
const MAX_RETRIES = 1;
const RPC_TIMEOUT = 5000; // 5 seconds timeout

interface RotationProviderConfig {
  maxRetries?: number;
  fallFowardDelay?: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Add new interface for RPC status tracking
interface RPCStatus {
  url: string;
  failureCount: number;
  lastFailure: number;
}

/**
 * Returns the network as long as all agree. Throws an error if any two networks do not match
 * @param networks the list of networks to verify
 * @returns Network
 */
export function checkNetworks(networks: Network[]): Network {
  if (networks.length === 0) {
    logger.throwArgumentError('no networks provided', 'networks', networks);
  }

  let result: Network | undefined;

  for (let i = 0; i < networks.length; i++) {
    const network = networks[i];

    if (!network) {
      logger.throwArgumentError('network not defined', 'networks', networks);
    }

    if (!result) {
      result = network;
      continue;
    }

    // Make sure the network matches the previous networks
    if (
      !(
        result.name.toLowerCase() === network.name.toLowerCase() &&
        result.chainId === network.chainId &&
        (result.ensAddress?.toLowerCase() === network.ensAddress?.toLowerCase() ||
          (result.ensAddress == null && network.ensAddress == null))
      )
    ) {
      logger.throwArgumentError('provider mismatch', 'networks', networks);
    }
  }

  if (!result) {
    logger.throwArgumentError('no networks defined', 'networks', networks);
  }

  return result;
}

/**
 * The provider will rotate rpcs on error.
 * If provider rotates away from the first RPC, rotate back after a set interval to prioritize using most reliable RPC.
 * If provider rotates through all rpcs, delay to avoid spamming rpcs with requests.
 */
export class RotationProvider extends BaseProvider {
  readonly providers: StaticJsonRpcProvider[];
  private currentProviderIndex = 0;
  private firstRotationTimestamp = 0;
  // number of full loops through provider array before throwing an error
  private maxRetries = 0;
  private retries = 0;
  // if we rotate away from first rpc, return back after this delay
  private fallForwardDelay: number;

  private lastError = '';
  
  // Add RPC status tracking
  private rpcStatus: RPCStatus[] = [];

  constructor(urls: string[], chainId: number, config?: RotationProviderConfig) {
    super(chainId);
    this.providers = urls.map((url) => new StaticJsonRpcProvider(url, chainId));
    
    // Initialize RPC status tracking
    this.rpcStatus = urls.map(url => ({
      url,
      failureCount: 0,
      lastFailure: 0
    }));

    this.maxRetries = config?.maxRetries || MAX_RETRIES;
    this.fallForwardDelay = config?.fallFowardDelay || DEFAULT_FALL_FORWARD_DELAY;
  }

  private updateRPCStatus(index: number, failed: boolean) {
    const status = this.rpcStatus[index];
    if (failed) {
      status.failureCount++;
      status.lastFailure = Date.now();
    } else {
      // Reset failure count on successful call
      status.failureCount = 0;
    }
  }

  private shouldTryRPC(index: number): boolean {
    const status = this.rpcStatus[index];
    const now = Date.now();
    
    // If RPC has failed multiple times, implement exponential backoff
    if (status.failureCount > 0) {
      const backoffTime = Math.min(1000 * Math.pow(2, status.failureCount - 1), 30000);
      return (now - status.lastFailure) >= backoffTime;
    }
    
    return true;
  }

  /**
   * If we rotate away from the first RPC, rotate back after a set interval to prioritize using most reliable RPC
   */
  async fallForwardRotation() {
    const now = new Date().getTime();
    const diff = now - this.firstRotationTimestamp;
    if (diff < this.fallForwardDelay) {
      await sleep(this.fallForwardDelay - diff);
      this.currentProviderIndex = 0;
    }
  }

  /**
   * If rpc fails, rotate to next available and trigger rotation or fall forward delay where applicable
   * @param prevIndex last updated index, checked to avoid having multiple active rotations
   */
  private async rotateUrl(prevIndex: number) {
    // don't rotate when another rotation was already triggered
    if (prevIndex !== this.currentProviderIndex) return;
    // if we rotate away from the first url, switch back after FALL_FORWARD_DELAY
    if (this.currentProviderIndex === 0) {
      this.currentProviderIndex += 1;
      this.firstRotationTimestamp = new Date().getTime();
      this.fallForwardRotation();
    } else if (this.currentProviderIndex === this.providers.length - 1) {
      this.retries += 1;
      if (this.retries > this.maxRetries) {
        this.retries = 0;
        throw new Error(
          `RotationProvider exceeded max number of retries. Last error: ${this.lastError}`
        );
      }
      this.currentProviderIndex = 0;
    } else {
      this.currentProviderIndex += 1;
    }
  }

  async detectNetwork(): Promise<Network> {
    const networks = await Promise.all(this.providers.map((c) => c.getNetwork()));
    return checkNetworks(networks);
  }

  async perform(method: string, params: any): Promise<any> {
    const startTime = Date.now();

    while (true) {
      if (!this.shouldTryRPC(this.currentProviderIndex)) {
        await this.rotateUrl(this.currentProviderIndex);
        continue;
      }

      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`RPC Timeout after ${RPC_TIMEOUT}ms`)), RPC_TIMEOUT)
        );

        const rpcPromise = this.providers[this.currentProviderIndex].perform(method, params);
        const result = await Promise.race([rpcPromise, timeoutPromise]);
        
        // Success - update status and return result
        this.updateRPCStatus(this.currentProviderIndex, false);
        return result;

      } catch (e) {
        this.updateRPCStatus(this.currentProviderIndex, true);
        this.lastError = e.message;
        
        console.error(
          `RPC Error (${this.providers[this.currentProviderIndex].connection.url}):`,
          e.message,
          `Attempt ${this.retries + 1}/${this.maxRetries + 1}`
        );

        // If we've tried all RPCs and exceeded retries, throw error
        if (this.retries >= this.maxRetries && 
            this.currentProviderIndex === this.providers.length - 1) {
          throw new Error(
            `All RPCs failed after ${Date.now() - startTime}ms. Last error: ${this.lastError}`
          );
        }

        await this.rotateUrl(this.currentProviderIndex);
      }
    }
  }
}
