import { StateCreator } from 'zustand';

import { getMerklCampaignUrl } from '../ui-config/merklConfig';
// import { convertAPRtoAPY } from '@/utils/utils';

export const CAMPAIGN_IDS = {
  CAMPAIGN_MTBILL: '0xd8d0ad6579284bcb4dbc3fb1e40f4596c788e4508daf9cfd010459ce86832850',
  CAMPAIGN_BASIS: '0xb3509a79b1715bc7666666fc9c27eb77762436648de827a5c5817371593aefd0',
  CAMPAIGN_WXTZ: '0x2bd98414a5af5dae4a8370a2d59869ce4c1b204a9bd4236d3007617f93625303',
  CAMPAIGN_WBTC: '0x3e262731bc9ef328fd1222b1164ff27f4fa46c02dde254257e0ae1164ebe1acd',
  CAMPAIGN_USDC: '0xb41a8ffef4c790d0f25c55a15f29b81b2c9fff9c07fd4999854ccb7fb3301d6b',
  CAMPAIGN_USDT: '0x4dd6b7595b1612465e25a8a5ec8ce7c9750f5211f0ebe120ffad71ada8a9b3e9',
  CAMPAIGN_WETH: '0x5571b243f36c4320559aaf8c61e116d8271060b8db28cb90871c5ec8ed665ab0',
};

export const SUPPORTED_MERKL_TOKENS = [
  'mTBILL',
  'mBASIS',
  'WXTZ',
  'WBTC',
  'USDC',
  'USDT',
  'WETH',
  'XTZ',
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
        return (data[0]?.Opportunity?.apr || 0);
      };

      // const getApyFromApr = (apr: number) => {
      //   return convertAPRtoAPY(extractApr(apr));
      // };

      // Map tokens to their APRs
      const aprMap: Record<string, number> = {
        mBASIS: extractApr(responses[1]),
        mTBILL: extractApr(responses[0]),
        WXTZ: extractApr(responses[2]),
        XTZ: extractApr(responses[2]),
        WBTC: extractApr(responses[3]),
        USDC: extractApr(responses[4]),
        USDT: extractApr(responses[5]),
        WETH: extractApr(responses[6]),
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
