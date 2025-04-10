import { useMerklRewards } from './useMerklRewards';

const CAMPAIGN_IDS = {
  CAMPAIGN_MTBILL: '0xd8d0ad6579284bcb4dbc3fb1e40f4596c788e4508daf9cfd010459ce86832850',
  CAMPAIGN_BASIS: '0xb3509a79b1715bc7666666fc9c27eb77762436648de827a5c5817371593aefd0',
  CAMPAIGN_XTZ: '0x898a135c2bceffdae7618b1e2266108d154dfeab75a373b3eb3641ca31647e6a',
  CAMPAIGN_WBTC: '0xc85b1c610c3ae5058cc69e04d87239c2af3cefb0c2fbdfcccffa5fb23d9f1cd7',
  CAMPAIGN_USDC: '0x1bd8c05ef0d7b581826288a6b28a33eee2d95caa68c7f4b23dc7c5f32704b8ad',
  CAMPAIGN_USDT: '0x691135dbaf8ce8bcc7aace2468be9b499834308362e1194a4246014ff74163a1',
};

export const SUPPORTED_MERKL_TOKENS = ['mTBILL', 'mBASIS', 'XTZ', 'WBTC', 'USDC', 'USDT'];

export const hasMerklRewards = (symbol: string) => {
  return SUPPORTED_MERKL_TOKENS.includes(symbol);
};

/**
 * Hook to fetch APR data for all Merkl campaigns
 * @returns Object containing aprMap, loading state, and campaign IDs
 */
export const useMerklAprMap = () => {
  // Fetch data for all three campaigns
  const { merklData: merklData1, loading: loading1 } = useMerklRewards(CAMPAIGN_IDS.CAMPAIGN_MTBILL);
  const { merklData: merklData2, loading: loading2 } = useMerklRewards(CAMPAIGN_IDS.CAMPAIGN_BASIS);
  const { merklData: merklData3, loading: loading3 } = useMerklRewards(CAMPAIGN_IDS.CAMPAIGN_XTZ);
  const { merklData: merklData4, loading: loading4 } = useMerklRewards(CAMPAIGN_IDS.CAMPAIGN_WBTC);
  const { merklData: merklData5, loading: loading5 } = useMerklRewards(CAMPAIGN_IDS.CAMPAIGN_USDC);
  const { merklData: merklData6, loading: loading6 } = useMerklRewards(CAMPAIGN_IDS.CAMPAIGN_USDT);

  // Extract APR values using the specified signature
  const apr1 = merklData1?.[0]?.Opportunity?.apr || 0;
  const apr2 = merklData2?.[0]?.Opportunity?.apr || 0;
  const apr3 = merklData3?.[0]?.Opportunity?.apr || 0;
  const apr4 = merklData4?.[0]?.Opportunity?.apr || 0;
  const apr5 = merklData5?.[0]?.Opportunity?.apr || 0;
  const apr6 = merklData6?.[0]?.Opportunity?.apr || 0;

  const aprMap = {
    'mBASIS': apr1,
    'mTBILL': apr2,
    'XTZ': apr3,
    'WBTC': apr4,
    'USDC': apr5,
    'USDT': apr6,
  };

  return {
    aprMap,
    isLoading: loading1 || loading2 || loading3 || loading4 || loading5 || loading6,
    campaignIds: CAMPAIGN_IDS,
  };
}; 