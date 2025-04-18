import { StateCreator } from 'zustand';
import { getMerklCampaignUrl } from '../ui-config/merklConfig';

export const CAMPAIGN_IDS = {
  CAMPAIGN_MTBILL: '0xd8d0ad6579284bcb4dbc3fb1e40f4596c788e4508daf9cfd010459ce86832850',
  CAMPAIGN_BASIS: '0xb3509a79b1715bc7666666fc9c27eb77762436648de827a5c5817371593aefd0',
  CAMPAIGN_XTZ: '0x898a135c2bceffdae7618b1e2266108d154dfeab75a373b3eb3641ca31647e6a',
  CAMPAIGN_WBTC: '0xc85b1c610c3ae5058cc69e04d87239c2af3cefb0c2fbdfcccffa5fb23d9f1cd7',
  CAMPAIGN_USDC: '0x1bd8c05ef0d7b581826288a6b28a33eee2d95caa68c7f4b23dc7c5f32704b8ad',
  CAMPAIGN_USDT: '0x691135dbaf8ce8bcc7aace2468be9b499834308362e1194a4246014ff74163a1',
};

export const SUPPORTED_MERKL_TOKENS = ['mTBILL', 'mBASIS', 'XTZ', 'WBTC', 'USDC', 'USDT'];

export interface MerklRewardsResponse {
  campaigns: {
    id: string;
    chainId: number;
    rewards: {
      amount: string;
      token: string;
    }[];
    opportunity?: {
      apr: number;
    };
  }[];
}

export interface MerklRewardsSlice {
  merklAprMap: Record<string, number>;
  merklRewardsLoading: boolean;
  merklRewardsError: Error | null;
  merklLastUpdated: number;
  fetchMerklRewards: () => Promise<void>;
}

export const createMerklRewardsSlice: StateCreator<
  MerklRewardsSlice, 
  [["zustand/subscribeWithSelector", never], ["zustand/devtools", never]]
> = (set, get) => ({
  merklAprMap: {},
  merklRewardsLoading: true,
  merklRewardsError: null,
  merklLastUpdated: 0,
  
  fetchMerklRewards: async () => {
    // Check if we already loaded data and it's less than 5 minutes old
    const now = Date.now();
    const lastUpdated = get().merklLastUpdated;
    if (lastUpdated > 0 && now - lastUpdated < 5 * 60 * 1000 && Object.keys(get().merklAprMap).length) {
      return; // Skip fetch if recently updated
    }
    
    try {
      set({ merklRewardsLoading: true });
      
      // Fetch all campaigns in parallel
      const campaignIds = Object.values(CAMPAIGN_IDS);
      const responses = await Promise.all(
        campaignIds.map(campaignId => 
          fetch(getMerklCampaignUrl(campaignId))
            .then(res => res.json())
            .catch(err => {
              console.error(`Error fetching Merkl campaign ${campaignId}:`, err);
              return null;
            })
        )
      );
      
      // Extract APR values from responses
      const extractApr = (data: any) => {
        if (!data) return 0;
        // Handle the specific response structure from Merkl API
        return data[0]?.Opportunity?.apr || 0;
      };
      
      // Map tokens to their APRs
      const aprMap: Record<string, number> = {
        'mBASIS': extractApr(responses[1]),
        'mTBILL': extractApr(responses[0]),
        'XTZ': extractApr(responses[2]),
        'WBTC': extractApr(responses[3]),
        'USDC': extractApr(responses[4]),
        'USDT': extractApr(responses[5]),
      };
      
      set({ 
        merklAprMap: aprMap,
        merklRewardsLoading: false,
        merklRewardsError: null,
        merklLastUpdated: now,
      });
    } catch (error) {
      console.error('Error fetching Merkl rewards:', error);
      set({
        merklRewardsLoading: false,
        merklRewardsError: error instanceof Error ? error : new Error('Unknown error'),
      });
    }
  },
}); 