import { useEffect } from 'react';

import { SUPPORTED_MERKL_TOKENS } from '../store/merklRewardsSlice';
import { useMerklRewardsSubscription, useRootStore } from '../store/root';

export { SUPPORTED_MERKL_TOKENS } from '../store/merklRewardsSlice';

export const hasMerklRewards = (symbol: string) => {
  return SUPPORTED_MERKL_TOKENS.includes(symbol);
};

/**
 * Hook to get APR data for all Merkl campaigns from the Zustand store
 * @returns Object containing apyMap and loading state
 */
export const useMerklApyMap = () => {
  // Start the subscription automatically
  useMerklRewardsSubscription();

  // Get state from Zustand store
  const { merklApyMap, merklRewardsLoading, fetchMerklRewards } = useRootStore((state) => ({
    merklApyMap: state.merklApyMap,
    merklRewardsLoading: state.merklRewardsLoading,
    fetchMerklRewards: state.fetchMerklRewards,
  }));

  // Trigger a fetch if the map is empty (first load)
  useEffect(() => {
    if (Object.keys(merklApyMap).length === 0) {
      fetchMerklRewards();
    }
  }, [merklApyMap, fetchMerklRewards]);

  return {
    apyMap: merklApyMap,
    isLoading: merklRewardsLoading,
  };
};
