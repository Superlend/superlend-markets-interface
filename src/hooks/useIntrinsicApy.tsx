import { useEffect } from 'react';

import { SUPPORTED_INTRINSIC_TOKENS, hasIntrinsicApy } from '../store/intrinsicApySlice';
import { useIntrinsicApySubscription, useRootStore } from '../store/root';

export { SUPPORTED_INTRINSIC_TOKENS, hasIntrinsicApy } from '../store/intrinsicApySlice';

/**
 * Hook to get intrinsic APY data for supported tokens from the Zustand store
 * @returns Object containing intrinsicApyMap and loading state
 */
export const useIntrinsicApy = () => {
  // Start the subscription automatically
  useIntrinsicApySubscription();

  // Get state from Zustand store
  const { intrinsicApyMap, intrinsicApyLoading, fetchIntrinsicApy } = useRootStore((state) => ({
    intrinsicApyMap: state.intrinsicApyMap,
    intrinsicApyLoading: state.intrinsicApyLoading,
    fetchIntrinsicApy: state.fetchIntrinsicApy,
  }));

  // Trigger a fetch if the map is empty (first load)
  useEffect(() => {
    if (Object.keys(intrinsicApyMap).length === 0) {
      fetchIntrinsicApy();
    }
  }, [intrinsicApyMap, fetchIntrinsicApy]);

  return {
    apyMap: intrinsicApyMap,
    isLoading: intrinsicApyLoading,
  };
}; 