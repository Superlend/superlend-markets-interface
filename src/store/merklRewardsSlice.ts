import { StateCreator } from 'zustand';

import { getMerklCampaignUrl } from '../ui-config/merklConfig';
// import { convertAPRtoAPY } from '@/utils/utils';

export const CAMPAIGN_IDS = {
  CAMPAIGN_MTBILL: '0x0c1fe667229297f48bb64b0d3c55c635cdb11219d1b13c3c86008fe533beca32',
  CAMPAIGN_MBASIS: '0x6cf5b800dcc169a204dbe9c57473451e7932492ef33f669c6f625a8c66a7c113',
  CAMPAIGN_WXTZ: '0xaf113e08f8637ec1bc6a02e56313997122ceae1ef748e51a07fc9e5a433f8078',
  CAMPAIGN_WBTC: '0x95ccc4921e1144fedb0e375e1b626992808fad4e311f835ddbc8b2b74f731317',
  CAMPAIGN_USDC: '0x277f8148036e308edf2509097b684304adeee739c143cc5b0ecf39349c73014b',
  CAMPAIGN_USDT: '0x63dbd3b41b8bed5a4adea2667a676e8573acb404820476326f2c865102741d7c',
  CAMPAIGN_WETH: '0x6d56c14a8d440c2b77b706726514cd3d939066c416394d2bb61a0b1412159418',
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
