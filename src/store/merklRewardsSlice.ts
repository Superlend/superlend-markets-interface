import { StateCreator } from 'zustand';

import { getMerklCampaignUrl } from '../ui-config/merklConfig';

export const CAMPAIGN_IDS = {
  CAMPAIGN_MTBILL: '0x1ca455114be0e0264504f91192dbd86c2d94d509cb9d0ba5331b618952eec508',
  CAMPAIGN_MBASIS: '0x33dbc542d62fef31c95a8278f415b47b087186d40bb364451cbb399ec3514de0',
  CAMPAIGN_WXTZ: '0x9ff64e9c2101667cb808bf9a179662c6174859bb4c6a7842e58b0e06617a482b',
  CAMPAIGN_WBTC: '0x6948b7f6c9bf96c9ce1ece370059b032587e10c1feabc71a3b5f04bf1b5ee691',
  CAMPAIGN_USDC: '0x0c5c25453fbfba679d472140ad0c21531b5dcd1dbe98067c0058076d98d36990',
  CAMPAIGN_USDT: '0x134d2ae337e986c8acec6828777b027b44c400ad4322882628e48a1dd3679def',
  CAMPAIGN_LBTC: '0x0a913953bba88c4877169d8599ec9c14892e6a67b60d37800c7dca42f077a465',
};

export const SUPPORTED_MERKL_TOKENS = [
  'mTBILL',
  'mBASIS',
  'WXTZ',
  'WBTC',
  'USDC',
  'USDT',
  // 'WETH',
  'XTZ',
  'LBTC',
];

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
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]]
> = (set, get) => ({
  merklAprMap: {},
  merklRewardsLoading: true,
  merklRewardsError: null,
  merklLastUpdated: 0,

  fetchMerklRewards: async () => {
    // Check if we already loaded data and it's less than 5 minutes old
    const now = Date.now();
    const lastUpdated = get().merklLastUpdated;
    if (
      lastUpdated > 0 &&
      now - lastUpdated < 5 * 60 * 1000 &&
      Object.keys(get().merklAprMap).length
    ) {
      return; // Skip fetch if recently updated
    }

    try {
      set({ merklRewardsLoading: true });

      // Fetch all campaigns in parallel
      const campaignIds = Object.values(CAMPAIGN_IDS);
      const responses = await Promise.all(
        campaignIds.map((campaignId) =>
          fetch(getMerklCampaignUrl(campaignId))
            .then((res) => res.json())
            .catch((err) => {
              console.error(`Error fetching Merkl campaign ${campaignId}:`, err);
              return null;
            })
        )
      );

      // Extract APR values from responses
      const extractApr = (data: any) => {
        if (!data) return 0;
        return data[0]?.Opportunity?.apr || 0;
      };

      // const getApyFromApr = (apr: number) => {
      //   return convertAPRtoAPY(extractApr(apr));
      // };

      // Map tokens to their APRs
      const aprMap: Record<string, number> = {
        mTBILL: extractApr(responses[0]),
        mBASIS: extractApr(responses[1]),
        WXTZ: extractApr(responses[2]),
        XTZ: extractApr(responses[2]),
        WBTC: extractApr(responses[3]),
        USDC: extractApr(responses[4]),
        USDT: extractApr(responses[5]),
        // WETH: extractApr(responses[6]),
        LBTC: extractApr(responses[6]),
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
