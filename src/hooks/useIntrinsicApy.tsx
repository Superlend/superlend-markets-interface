import { useIntrinsicApySubscription, useRootStore } from '../store/root';

export { SUPPORTED_INTRINSIC_TOKENS, hasIntrinsicApy } from '../store/intrinsicApySlice';

/**
 * Hook to get intrinsic APY data for supported tokens from the Zustand store
 * @returns Object containing intrinsicApyMap and loading state
 */
export const useIntrinsicApy = () => {
  // Start the subscription automatically - this handles the initial call and periodic updates
  useIntrinsicApySubscription();

  // Get state from Zustand store
  const { intrinsicApyMap, intrinsicApyLoading } = useRootStore((state) => ({
    intrinsicApyMap: state.intrinsicApyMap,
    intrinsicApyLoading: state.intrinsicApyLoading,
  }));

  return {
    apyMap: intrinsicApyMap,
    isLoading: intrinsicApyLoading,
  };
};
