import { useMerklRewards } from './useMerklRewards';

const CAMPAIGN_IDS = {
  CAMPAIGN_1: '0x39b5121a483f8dc07e5f43c6a33e6d2f5ed98ae474f640aa8d98c5239d4c00a2',
  CAMPAIGN_2: '0xd0aea857cb16a8a83d7c3b5cc99d7a826f8ce4b19e685f0582b3598fe6887818',
  CAMPAIGN_3: '0x6645ea6142d6532339c87a5bde9d589bc9556ade3dc0598b6582bf8a6dc2c628',
};

export const SUPPORTED_MERKL_TOKENS = ['mTBILL', 'mBASIS', 'XTZ'];

export const hasMerklRewards = (symbol: string) => {
  return SUPPORTED_MERKL_TOKENS.includes(symbol);
};

/**
 * Hook to fetch APR data for all Merkl campaigns
 * @returns Object containing aprMap, loading state, and campaign IDs
 */
export const useMerklAprMap = () => {
  // Fetch data for all three campaigns
  const { merklData: merklData1, loading: loading1 } = useMerklRewards(CAMPAIGN_IDS.CAMPAIGN_1);
  const { merklData: merklData2, loading: loading2 } = useMerklRewards(CAMPAIGN_IDS.CAMPAIGN_2);
  const { merklData: merklData3, loading: loading3 } = useMerklRewards(CAMPAIGN_IDS.CAMPAIGN_3);

  // Extract APR values using the specified signature
  const apr1 = merklData1?.[0]?.Opportunity?.apr || 0;
  const apr2 = merklData2?.[0]?.Opportunity?.apr || 0;
  const apr3 = merklData3?.[0]?.Opportunity?.apr || 0;

  const aprMap = {
    'mBASIS': apr1,
    'mTBILL': apr2,
    'XTZ': apr3,
  };

  return {
    aprMap,
    isLoading: loading1 || loading2 || loading3,
    campaignIds: CAMPAIGN_IDS,
  };
}; 