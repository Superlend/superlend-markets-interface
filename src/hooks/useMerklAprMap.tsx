import { useEffect } from 'react';
import { useRootStore, useMerklRewardsSubscription } from '../store/root';
import { SUPPORTED_MERKL_TOKENS } from '../store/merklRewardsSlice';

export { SUPPORTED_MERKL_TOKENS } from '../store/merklRewardsSlice';

export const hasMerklRewards = (symbol: string) => {
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