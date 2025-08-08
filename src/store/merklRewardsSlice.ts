import { StateCreator } from 'zustand';

import { getMerklCampaignUrl } from '../ui-config/merklConfig';
// import { convertAPRtoAPY } from '@/utils/utils';

export const CAMPAIGN_IDS = {
  CAMPAIGN_MTBILL: '0x1ca455114be0e0264504f91192dbd86c2d94d509cb9d0ba5331b618952eec508',
  CAMPAIGN_MBASIS: '0x33dbc542d62fef31c95a8278f415b47b087186d40bb364451cbb399ec3514de0',
  CAMPAIGN_WXTZ: '0xaeec3936c28d13cac746ab3d97997f838905d6e1d789b871a5f31187e3745c22',
  CAMPAIGN_WBTC: '0x46cd8f91631692117fe8a1a993b5693940da473f48086415bfb8efb669dcdd4f',
  CAMPAIGN_USDC: '0x1ca28225817aef341933e9ea1e09228d5b5ca3e1c1bb8c3281a5b2c225849238',
  CAMPAIGN_USDT: '0x1e0aa166b500dff865fa3d9f468a5c00e5771566215ea53fe41b857f6c7b760d',
  // CAMPAIGN_WETH: '0xd1cc7c4f0734f461cd74b65d163d65960760e57631016bc6bf0269f13212c40f',
  CAMPAIGN_LBTC: '0x317e5fa441f69dbc830f7f4aa9bebdd5db2119e138d3efd0b77925c88e375303',
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