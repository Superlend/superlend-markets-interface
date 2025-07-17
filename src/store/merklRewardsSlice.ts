import { StateCreator } from 'zustand';

import { getMerklCampaignUrl } from '../ui-config/merklConfig';
// import { convertAPRtoAPY } from '@/utils/utils';

export const CAMPAIGN_IDS = {
  CAMPAIGN_MTBILL: '0xb89cfe220406f4cb039241b8070350794eb6c445f61ceb85e5f045277c0db18f',
  CAMPAIGN_MBASIS: '0xf21ca0bbc6dee4da47f35f1f8e3d88a9779e0e2ae8990392585fac6383671582',
  CAMPAIGN_WXTZ: '0xe272b94ede07948f5e11de40f588f9607b1d25f72a0a68ff21ce95e911ab3046',
  CAMPAIGN_WBTC: '0x15334bcb7b6a7d518f1ed2f57d23d0614ef540074e500600a31a72b36cd7fb67',
  CAMPAIGN_USDC: '0x22b1631a0811fe1a14ca2554bf05eab15df5a2b8adbc607cb7c5330f804a9e8d',
  CAMPAIGN_USDT: '0x3fa208effe1df2d25b546c9094e172df02a861d95136524306e18eb36d97ae28',
  CAMPAIGN_WETH: '0xd1cc7c4f0734f461cd74b65d163d65960760e57631016bc6bf0269f13212c40f',
};

export const SUPPORTED_MERKL_TOKENS = [
  // 'mTBILL',
  // 'mBASIS',
  'WXTZ',
  // 'WBTC',
  // 'USDC',
  // 'USDT',
  // 'WETH',
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
        return data[0]?.Opportunity?.apr || 0;
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
