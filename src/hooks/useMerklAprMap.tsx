import { useEffect } from 'react';

import { SUPPORTED_MERKL_TOKENS } from '../store/merklRewardsSlice';
import { useMerklRewardsSubscription, useRootStore } from '../store/root';
import { CustomMarket } from '../utils/marketsAndNetworksConfig';
import { useProtocolDataContext } from './useProtocolDataContext';

export { SUPPORTED_MERKL_TOKENS } from '../store/merklRewardsSlice';

export const hasMerklRewards = (symbol: string) => {
  return SUPPORTED_MERKL_TOKENS.includes(symbol);
};

/**
 * Market-aware hook to check if a token has Merkl rewards
 * Considers the current market context to disable rewards for specific markets
 */
export const useHasMerklRewards = (symbol: string) => {
  const { currentMarket } = useProtocolDataContext();

  // Disable Apple rewards for RWA market
  if (currentMarket === CustomMarket.horizon_rwa_market) {
    return false;
  }

  return SUPPORTED_MERKL_TOKENS.includes(symbol);
};

/**
 * Hook to get APR data for all Merkl campaigns from the Zustand store
 * @returns Object containing aprMap and loading state
 */
export const useMerklAprMap = () => {
  // Start the subscription automatically
  useMerklRewardsSubscription();

  // Get state from Zustand store
  const { merklAprMap, merklRewardsLoading, fetchMerklRewards } = useRootStore((state) => ({
    merklAprMap: state.merklAprMap,
    merklRewardsLoading: state.merklRewardsLoading,
    fetchMerklRewards: state.fetchMerklRewards,
  }));

  // Trigger a fetch if the map is empty (first load)
  useEffect(() => {
    if (Object.keys(merklAprMap).length === 0) {
      fetchMerklRewards();
    }
  }, [merklAprMap, fetchMerklRewards]);

  return {
    aprMap: merklAprMap,
    isLoading: merklRewardsLoading,
  };
};
