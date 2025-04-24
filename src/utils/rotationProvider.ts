import { BaseProvider, Network, StaticJsonRpcProvider } from '@ethersproject/providers';
import { logger } from 'ethers';

const DEFAULT_FALL_FORWARD_DELAY = 60000;
const MAX_RETRIES = 1;
const RPC_TIMEOUT = 10000; // 10 seconds timeout
const GLOBAL_TIMEOUT = 30000; // 30 seconds global timeout
const MAX_CONSECUTIVE_ERRORS = 3; // Maximum consecutive errors before temporary blacklisting
const BLACKLIST_DURATION = 60000; // 1 minute blacklist duration
const MAX_QUEUE_SIZE = 100; // Maximum pending requests in queue

export interface RotationProviderConfig {
  maxRetries?: number;
  fallFowardDelay?: number;
  rpcTimeout?: number;
  globalTimeout?: number;
  maxConsecutiveErrors?: number;
  blacklistDuration?: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Enhanced RPC status tracking
interface RPCStatus {
  url: string;
  failureCount: number;
  consecutiveFailures: number;
  lastFailure: number;
  blacklistedUntil: number;
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  lastResponseTime: number;
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
  protected currentProviderIndex = 0;
  private firstRotationTimestamp = 0;
  // number of full loops through provider array before throwing an error
  private maxRetries = 0;
  private retries = 0;
  // if we rotate away from first rpc, return back after this delay
  private fallForwardDelay: number;
  private rpcTimeout: number;
  private globalTimeout: number;
  private maxConsecutiveErrors: number;
  private blacklistDuration: number;

  private lastError = '';
  
  // RPC status tracking
  protected rpcStatus: RPCStatus[] = [];
  
  // Request queue for concurrent handling
  private requestQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    method: string;
    params: any;
    startTime: number;
  }> = [];
  
  private processingQueue = false;
  
  // Event names for monitoring
  private static readonly EVENTS = {
    RPC_SUCCESS: 'rpc_success',
    RPC_ERROR: 'rpc_error',
    PROVIDER_ROTATION: 'provider_rotation',
    PROVIDER_BLACKLISTED: 'provider_blacklisted',
    PROVIDER_RECOVERED: 'provider_recovered',
    QUEUE_OVERFLOW: 'queue_overflow',
    GLOBAL_TIMEOUT: 'global_timeout'
  };

  constructor(urls: string[], chainId: number, config?: RotationProviderConfig) {
    super(chainId);
    
    if (!urls || urls.length === 0) {
      throw new Error('RotationProvider requires at least one RPC URL');
    }
    
    this.providers = urls.map((url) => new StaticJsonRpcProvider(url, chainId));
    
    // Initialize RPC status tracking
    this.rpcStatus = urls.map(url => ({
      url,
      failureCount: 0,
      consecutiveFailures: 0,
      lastFailure: 0,
      blacklistedUntil: 0,
      totalRequests: 0,
      successRate: 0,
      averageResponseTime: 0,
      lastResponseTime: 0
    }));

    this.maxRetries = config?.maxRetries || MAX_RETRIES;
    this.fallForwardDelay = config?.fallFowardDelay || DEFAULT_FALL_FORWARD_DELAY;
    this.rpcTimeout = config?.rpcTimeout || RPC_TIMEOUT;
    this.globalTimeout = config?.globalTimeout || GLOBAL_TIMEOUT;
    this.maxConsecutiveErrors = config?.maxConsecutiveErrors || MAX_CONSECUTIVE_ERRORS;
    this.blacklistDuration = config?.blacklistDuration || BLACKLIST_DURATION;
  }

  private updateRPCStatus(index: number, failed: boolean, responseTime?: number) {
    const status = this.rpcStatus[index];
    const wasBlacklisted = status.blacklistedUntil > Date.now();
    status.totalRequests++;
    
    if (failed) {
      status.failureCount++;
      status.consecutiveFailures++;
      status.lastFailure = Date.now();
      
      // Calculate new success rate
      status.successRate = (status.totalRequests - status.failureCount) / status.totalRequests;
      
      // Blacklist endpoint if too many consecutive failures
      if (!wasBlacklisted && status.consecutiveFailures >= this.maxConsecutiveErrors) {
        status.blacklistedUntil = Date.now() + this.blacklistDuration;
        console.warn(`RPC endpoint ${status.url} blacklisted until ${new Date(status.blacklistedUntil).toISOString()}`);
        
        // Emit blacklist event
        this.emit(RotationProvider.EVENTS.PROVIDER_BLACKLISTED, {
          provider: this.providers[index],
          url: status.url,
          consecutiveFailures: status.consecutiveFailures,
          blacklistedUntil: status.blacklistedUntil
        });
      }
    } else {
      // Check if provider has recovered from blacklist
      if (wasBlacklisted && status.blacklistedUntil <= Date.now()) {
        this.emit(RotationProvider.EVENTS.PROVIDER_RECOVERED, {
          provider: this.providers[index],
          url: status.url
        });
      }
      
      // Update metrics for successful call
      status.consecutiveFailures = 0;
      
      if (responseTime) {
        status.lastResponseTime = responseTime;
        // Update average using a weighted approach
        status.averageResponseTime = status.averageResponseTime === 0 
          ? responseTime 
          : status.averageResponseTime * 0.7 + responseTime * 0.3; // 70% old value, 30% new value
      }
      
      // Update success rate
      status.successRate = (status.totalRequests - status.failureCount) / status.totalRequests;
    }
  }

  private shouldTryRPC(index: number): boolean {
    const status = this.rpcStatus[index];
    const now = Date.now();
    
    // Check if endpoint is blacklisted
    if (status.blacklistedUntil > now) {
      return false;
    }
    
    // If RPC has failed multiple times, implement exponential backoff
    if (status.consecutiveFailures > 0) {
      const backoffTime = Math.min(1000 * Math.pow(2, status.consecutiveFailures - 1), 30000);
      return (now - status.lastFailure) >= backoffTime;
    }
    
    return true;
  }

  /**
   * If we rotate away from the first RPC, rotate back after a set interval to prioritize using most reliable RPC
   */
  async fallForwardRotation() {
    const now = Date.now();
    const diff = now - this.firstRotationTimestamp;
    if (diff < this.fallForwardDelay) {
      await sleep(this.fallForwardDelay - diff);
      
      // Only reset if the first provider is healthy
      if (this.shouldTryRPC(0)) {
        this.currentProviderIndex = 0;
        console.log('Falling forward to primary RPC endpoint');
      }
    }
  }

  /**
   * Find the best available provider based on health metrics
   */
  protected findBestProvider(): number {
    const now = Date.now();
    
    // First try to find non-blacklisted providers with no recent failures
    const healthyProviders = this.rpcStatus
      .map((status, index) => ({ status, index }))
      .filter(item => item.status.blacklistedUntil < now && item.status.consecutiveFailures === 0);
    
    if (healthyProviders.length > 0) {
      // Sort by success rate and response time
      healthyProviders.sort((a, b) => {
        // Prioritize success rate first
        if (Math.abs(a.status.successRate - b.status.successRate) > 0.1) {
          return b.status.successRate - a.status.successRate;
        }
        // If success rates are similar, prioritize response time
        return a.status.averageResponseTime - b.status.averageResponseTime;
      });
      
      return healthyProviders[0].index;
    }
    
    // If no healthy providers, find the least unhealthy one (not blacklisted)
    const availableProviders = this.rpcStatus
      .map((status, index) => ({ status, index }))
      .filter(item => item.status.blacklistedUntil < now);
    
    if (availableProviders.length > 0) {
      // Sort by consecutive failures (ascending) and time since last failure (descending)
      availableProviders.sort((a, b) => {
        if (a.status.consecutiveFailures !== b.status.consecutiveFailures) {
          return a.status.consecutiveFailures - b.status.consecutiveFailures;
        }
        return b.status.lastFailure - a.status.lastFailure;
      });
      
      return availableProviders[0].index;
    }
    
    // If all are blacklisted, use the one that will be unblacklisted first
    const allProviders = this.rpcStatus
      .map((status, index) => ({ status, index }))
      .sort((a, b) => a.status.blacklistedUntil - b.status.blacklistedUntil);
    
    return allProviders[0].index;
  }

  /**
   * If rpc fails, rotate to next available and trigger rotation or fall forward delay where applicable
   * @param prevIndex last updated index, checked to avoid having multiple active rotations
   */
  private async rotateUrl(prevIndex: number) {
    // don't rotate when another rotation was already triggered
    if (prevIndex !== this.currentProviderIndex) return;
    
    const oldIndex = this.currentProviderIndex;
    
    // Try to find the best provider based on health metrics
    const bestProviderIndex = this.findBestProvider();
    this.currentProviderIndex = bestProviderIndex;
    
    // Emit rotation event
    this.emit(RotationProvider.EVENTS.PROVIDER_ROTATION, {
      oldProvider: this.providers[oldIndex].connection.url,
      newProvider: this.providers[bestProviderIndex].connection.url,
      reason: this.lastError || 'Provider rotation'
    });
    
    // If we rotated away from the first url, schedule fallforward logic
    if (oldIndex === 0 && bestProviderIndex !== 0) {
      this.firstRotationTimestamp = Date.now();
      this.fallForwardRotation().catch(err => {
        console.error('Error in fallForwardRotation:', err);
      });
    }
    
    // If we've done a full cycle through providers, increment retry counter
    if (bestProviderIndex === 0 && oldIndex === this.providers.length - 1) {
      this.retries += 1;
      if (this.retries > this.maxRetries) {
        this.retries = 0;
        throw new Error(
          `RotationProvider exceeded max number of retries. Last error: ${this.lastError}`
        );
      }
    }
    
    console.log(`Rotated from RPC ${oldIndex} to ${bestProviderIndex}`);
  }

  async detectNetwork(): Promise<Network> {
    const networks = await Promise.all(this.providers.map((c) => c.getNetwork()));
    return checkNetworks(networks);
  }

  /**
   * Process the request queue in FIFO order
   */
  private async processQueue() {
    if (this.processingQueue) return;
    
    try {
      this.processingQueue = true;
      let consecutiveErrors = 0;
      
      while (this.requestQueue.length > 0) {
        const request = this.requestQueue[0];
        
        // Safety check for request object
        if (!request) {
          this.requestQueue.shift();
          continue;
        }
        
        // Check global timeout
        if (Date.now() - request.startTime > this.globalTimeout) {
          this.requestQueue.shift(); // Remove current request
          request.reject(new Error(`Request exceeded global timeout of ${this.globalTimeout}ms`));
          continue;
        }
        
        try {
          const result = await this.executeRequest(request.method, request.params);
          this.requestQueue.shift(); // Remove current request
          request.resolve(result);
          consecutiveErrors = 0; // Reset consecutive errors counter
        } catch (error) {
          // If we've exceeded max retries, fail this request
          if (error.message.includes('exceeded max number of retries')) {
            this.requestQueue.shift(); // Remove current request
            request.reject(error);
            consecutiveErrors = 0; // Reset consecutive errors counter
          } else {
            consecutiveErrors++;
            
            // Circuit breaker - if too many consecutive errors in the queue processing,
            // add a delay to prevent CPU spinning and retry storm
            if (consecutiveErrors > 3) {
              await sleep(Math.min(100 * Math.pow(2, consecutiveErrors - 3), 5000));
              
              // If queue processing has excessive failures, fail oldest request to make progress
              if (consecutiveErrors > 10) {
                this.requestQueue.shift();
                request.reject(new Error('Queue processing failed repeatedly. Request aborted to prevent starvation.'));
                consecutiveErrors = 5; // Reduce but don't reset completely
              }
            } else {
              // Otherwise, leave it in the queue for retry with the next provider
              await sleep(100); // Small delay to prevent CPU spinning
            }
          }
        }
      }
    } catch (error) {
      console.error('Fatal error in queue processing:', error);
      
      // In case of fatal error, fail all queued requests
      while (this.requestQueue.length > 0) {
        const request = this.requestQueue.shift();
        if (request) {
          request.reject(new Error(`Fatal error in provider queue processing: ${error.message}`));
        }
      }
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * Refresh a provider's connection
   */
  private refreshProvider(index: number): void {
    const url = this.rpcStatus[index].url;
    try {
      // Get the chainId from the network object
      const chainId = this.network?.chainId;
      
      if (!chainId) {
        console.warn(`Cannot refresh provider without chainId. Using existing provider.`);
        return;
      }
      
      // Replace the provider with a fresh instance
      this.providers[index] = new StaticJsonRpcProvider(url, chainId);
      console.log(`Refreshed provider connection for ${url}`);
    } catch (error) {
      console.error(`Failed to refresh provider ${url}:`, error);
    }
  }

  /**
   * Clean up resources and cancel pending requests
   */
  public destroy(): void {
    // Fail all pending requests
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        request.reject(new Error('Provider is being destroyed. Request cancelled.'));
      }
    }
    
    // Clear provider instances
    this.providers.forEach((provider, index) => {
      try {
        // Attempt to clean up any resources
        // Note: StaticJsonRpcProvider doesn't have a standard destroy method
        // but we're still trying to clean up as much as possible by removing references
        if (provider.removeAllListeners) {
          provider.removeAllListeners();
        }
      } catch (e) {
        console.error(`Error cleaning up provider ${this.rpcStatus[index].url}:`, e);
      }
    });
    
    // Remove all listeners
    this.removeAllListeners();
  }
  
  /**
   * Execute a request with the current provider and handle rotation if needed
   */
  private async executeRequest(method: string, params: any): Promise<any> {
    const startTime = Date.now();
    let lastProviderIndex = this.currentProviderIndex;
    let attemptCount = 0;

    while (true) {
      attemptCount++;
      // Circuit breaker for extreme cases
      if (attemptCount > this.providers.length * 3) {
        throw new Error(`Request failed after ${attemptCount} attempts across all providers`);
      }
      
      // Check if current provider should be used
      if (!this.shouldTryRPC(this.currentProviderIndex)) {
        await this.rotateUrl(lastProviderIndex);
        lastProviderIndex = this.currentProviderIndex;
        continue;
      }

      try {
        // Refresh provider connection if it's been failing consistently
        if (this.rpcStatus[this.currentProviderIndex].consecutiveFailures > 5) {
          this.refreshProvider(this.currentProviderIndex);
        }
        
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`RPC Timeout after ${this.rpcTimeout}ms`)), this.rpcTimeout)
        );

        const rpcPromise = this.providers[this.currentProviderIndex].perform(method, params);
        const result = await Promise.race([rpcPromise, timeoutPromise]);
        
        // Success - update status and return result
        const responseTime = Date.now() - startTime;
        this.updateRPCStatus(this.currentProviderIndex, false, responseTime);
        
        // Emit success event
        this.emit(RotationProvider.EVENTS.RPC_SUCCESS, {
          provider: this.providers[this.currentProviderIndex].connection.url,
          method,
          responseTime,
          attemptCount
        });
        
        return result;

      } catch (e) {
        this.updateRPCStatus(this.currentProviderIndex, true);
        this.lastError = e.message;
        
        // Emit error event
        this.emit(RotationProvider.EVENTS.RPC_ERROR, {
          provider: this.providers[this.currentProviderIndex].connection.url,
          method,
          error: e.message,
          attempt: this.retries + 1,
          maxRetries: this.maxRetries + 1,
          totalAttempts: attemptCount
        });
        
        console.error(
          `RPC Error (${this.providers[this.currentProviderIndex].connection.url}):`,
          e.message,
          `Attempt ${this.retries + 1}/${this.maxRetries + 1}, Total attempts: ${attemptCount}`
        );

        // Check global timeout
        if (Date.now() - startTime > this.globalTimeout) {
          const timeoutError = new Error(`Request exceeded global timeout of ${this.globalTimeout}ms. Last error: ${this.lastError}`);
          
          // Emit global timeout event
          this.emit(RotationProvider.EVENTS.GLOBAL_TIMEOUT, {
            method,
            elapsedTime: Date.now() - startTime,
            globalTimeout: this.globalTimeout,
            lastError: this.lastError,
            totalAttempts: attemptCount
          });
          
          throw timeoutError;
        }

        // If we've tried all RPCs and exceeded retries, throw error
        if (this.retries >= this.maxRetries && 
            this.currentProviderIndex === this.providers.length - 1) {
          throw new Error(
            `All RPCs failed after ${Date.now() - startTime}ms and ${attemptCount} attempts. Last error: ${this.lastError}`
          );
        }

        lastProviderIndex = this.currentProviderIndex;
        await this.rotateUrl(lastProviderIndex);
        
        // If rotation failed or didn't change the provider, add additional delay
        if (lastProviderIndex === this.currentProviderIndex) {
          await sleep(1000);
        }
      }
    }
  }

  /**
   * Queue a request and ensure it gets processed
   */
  async perform(method: string, params: any): Promise<any> {
    // Check if queue is too large
    if (this.requestQueue.length >= MAX_QUEUE_SIZE) {
      const queueError = new Error(`Request queue is full (${MAX_QUEUE_SIZE} items)`);
      
      // Emit queue overflow event
      this.emit(RotationProvider.EVENTS.QUEUE_OVERFLOW, {
        queueSize: this.requestQueue.length,
        maxQueueSize: MAX_QUEUE_SIZE,
        method
      });
      
      throw queueError;
    }
    
    return new Promise((resolve, reject) => {
      // Add to queue
      this.requestQueue.push({
        resolve,
        reject,
        method,
        params,
        startTime: Date.now()
      });
      
      // Start processing if not already
      if (!this.processingQueue) {
        this.processQueue().catch(err => {
          console.error('Error in queue processing:', err);
        });
      }
    });
  }
  
  /**
   * Get health metrics for all providers 
   */
  getProviderHealthMetrics(): Array<RPCStatus & { isCurrentProvider: boolean }> {
    return this.rpcStatus.map((status, index) => ({
      ...status,
      isCurrentProvider: index === this.currentProviderIndex
    }));
  }
}
