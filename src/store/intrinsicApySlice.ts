import { StateCreator } from 'zustand';

// Define supported tokens for intrinsic APY
export const SUPPORTED_INTRINSIC_TOKENS = ['mBASIS', 'mTBILL'];

export const hasIntrinsicApy = (symbol: string) => {
  return SUPPORTED_INTRINSIC_TOKENS.includes(symbol);
};

export interface IntrinsicApyResponse {
  mBasisAPY?: string;
  mTbillAPY?: string;
  [key: string]: string | undefined;
}

export interface IntrinsicApySlice {
  intrinsicApyMap: Record<string, number>;
  intrinsicApyLoading: boolean;
  intrinsicApyError: Error | null;
  intrinsicApyLastUpdated: number;
  fetchIntrinsicApy: () => Promise<void>;
}

export const createIntrinsicApySlice: StateCreator<
  IntrinsicApySlice,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]]
> = (set, get) => ({
  intrinsicApyMap: {},
  intrinsicApyLoading: true,
  intrinsicApyError: null,
  intrinsicApyLastUpdated: 0,

  fetchIntrinsicApy: async () => {
    // Check if we already loaded data and it's less than 5 minutes old
    const now = Date.now();
    const lastUpdated = get().intrinsicApyLastUpdated;
    if (
      lastUpdated > 0 &&
      now - lastUpdated < 5 * 60 * 1000 &&
      Object.keys(get().intrinsicApyMap).length
    ) {
      return; // Skip fetch if recently updated
    }

    try {
      set({ intrinsicApyLoading: true });

      // Fetch from the Midas API
      const response = await fetch('https://api-prod.midas.app/api/data/kpi')
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .catch((err) => {
          console.error('Error fetching intrinsic APY:', err);
          // Return default values for development
          return {
            mBasisAPY: '0',
            mTbillAPY: '0',
          };
        });

      // Extract APY values from response and convert to percentage
      const intrinsicApyMap: Record<string, number> = {
        mBASIS: parseFloat(response.mBasisAPY || '0') * 100, // Convert decimal to percentage
        mTBILL: parseFloat(response.mTbillAPY || '0') * 100, // Convert decimal to percentage
      };

      set({
        intrinsicApyMap,
        intrinsicApyLoading: false,
        intrinsicApyError: null,
        intrinsicApyLastUpdated: now,
      });
    } catch (error) {
      console.error('Error in fetchIntrinsicApy:', error);
      set({
        intrinsicApyError: error instanceof Error ? error : new Error('Unknown error'),
        intrinsicApyLoading: false,
      });
    }
  },
});
