import { RotationProvider, RotationProviderConfig } from './rotationProvider';

/**
 * Enhanced version of RotationProvider that dynamically prioritizes providers based on
 * both response time and block heights to ensure we're using the most up-to-date and performant node.
 */
export class EnhancedRotationProvider extends RotationProvider {
  // Time interval (ms) to check block heights
  private readonly BLOCK_HEIGHT_CHECK_INTERVAL = 30000; // 30 seconds
  // Maximum acceptable block difference
  private readonly MAX_BLOCK_HEIGHT_DIFFERENCE = 10;
  // Store latest block heights to avoid redundant requests
  private blockHeights: number[] = [];
  private blockHeightCheckTimer: NodeJS.Timeout | null = null;

  constructor(urls: string[], chainId: number, config?: RotationProviderConfig) {
    super(urls, chainId, config);
    // Initialize the block height check mechanism
    this.startBlockHeightChecking();
  }

  private async startBlockHeightChecking() {
    // Check block heights immediately
    await this.checkBlockHeights();
    
    // Schedule periodic checks
    this.blockHeightCheckTimer = setInterval(
      () => this.checkBlockHeights(),
      this.BLOCK_HEIGHT_CHECK_INTERVAL
    );
  }

  private async checkBlockHeights() {
    try {
      // Get all providers' latest block numbers
      const blockPromises = this.providers.map(provider => 
        provider.getBlockNumber().catch(err => {
          console.error(`Failed to get block height from ${provider.connection.url}:`, err);
          return -1; // Indicate failure
        })
      );
      
      const blockHeights = await Promise.all(blockPromises);
      this.blockHeights = blockHeights;
      
      // Find the public node (index 0 in our case) and Plend node (index 1)
      const publicNodeHeight = blockHeights[0];
      const plendNodeHeight = blockHeights[1];
      
      // Log the block heights for debugging
      console.log('Block heights:', {
        publicNode: publicNodeHeight,
        plendNode: plendNodeHeight,
        diff: publicNodeHeight - plendNodeHeight
      });
      
      // If both nodes returned valid heights
      if (publicNodeHeight > 0 && plendNodeHeight > 0) {
        // Calculate block difference
        const blockDiff = publicNodeHeight - plendNodeHeight;
        
        // If Plend node is too far behind, prioritize public node
        if (blockDiff > this.MAX_BLOCK_HEIGHT_DIFFERENCE) {
          // Force the current provider to be the public node
          if (this.currentProviderIndex !== 0) {
            console.log(`Plend node is ${blockDiff} blocks behind. Switching to public node.`);
            this.currentProviderIndex = 0;
          }
        } 
        // Otherwise, choose the provider with better response time
        else {
          this.prioritizeFasterProvider();
        }
      }
    } catch (error) {
      console.error('Error checking block heights:', error);
    }
  }
  
  private prioritizeFasterProvider() {
    // Get response times from RPC status
    const responseTimes = this.rpcStatus.map(status => ({
      url: status.url,
      index: this.rpcStatus.indexOf(status),
      responseTime: status.averageResponseTime,
      blacklisted: status.blacklistedUntil > Date.now()
    }));
    
    // Filter out blacklisted providers
    const availableProviders = responseTimes.filter(provider => !provider.blacklisted);
    
    if (availableProviders.length > 0) {
      // Sort by response time (fastest first)
      availableProviders.sort((a, b) => a.responseTime - b.responseTime);
      
      // Update current provider to the fastest one
      const fastestProvider = availableProviders[0];
      if (this.currentProviderIndex !== fastestProvider.index) {
        console.log(`Switching to faster provider: ${fastestProvider.url} (${fastestProvider.responseTime}ms)`);
        this.currentProviderIndex = fastestProvider.index;
      }
    }
  }
  
  // Override destroy method to clear interval
  public destroy(): void {
    if (this.blockHeightCheckTimer) {
      clearInterval(this.blockHeightCheckTimer);
      this.blockHeightCheckTimer = null;
    }
    super.destroy();
  }
  
  // Override findBestProvider to incorporate block height logic
  protected findBestProvider(): number {
    // First check if Plend node is lagging
    if (this.blockHeights.length >= 2) {
      const publicNodeHeight = this.blockHeights[0];
      const plendNodeHeight = this.blockHeights[1];
      
      if (publicNodeHeight > 0 && plendNodeHeight > 0) {
        const blockDiff = publicNodeHeight - plendNodeHeight;
        
        // If Plend node is too far behind, always use public node
        if (blockDiff > this.MAX_BLOCK_HEIGHT_DIFFERENCE) {
          return 0; // Public node index
        }
      }
    }
    
    // Otherwise use the regular algorithm
    return super.findBestProvider();
  }
} 