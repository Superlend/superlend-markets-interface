import { StateCreator } from 'zustand';

// Define supported tokens for intrinsic APY
export const SUPPORTED_INTRINSIC_TOKENS = ['mBASIS', 'mTBILL', 'stXTZ'];

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

      // Fetch from multiple APIs concurrently
      const [midasResponse, stacyResponse] = await Promise.allSettled([
        // Fetch from the Midas API for mBASIS and mTBILL
        fetch('https://api-prod.midas.app/api/data/kpi')
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .catch((err) => {
            console.error('Error fetching Midas API:', err);
            // Return default values for development
            return {
              mBasisAPY: '0',
              mTbillAPY: '0',
            };
          }),
        
        // Fetch from the Stacy.fi API for stXTZ
        fetch('https://supply.stacy.fi/apr/stxtz')
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.text(); // API returns plain text percentage
          })
          .catch((err) => {
            console.error('Error fetching stXTZ APR:', err);
            // Return default value for development
            return '0%';
          }),
      ]);

      // Process Midas API response
      let intrinsicApyMap: Record<string, number> = {};
      
      if (midasResponse.status === 'fulfilled') {
        const midasData = midasResponse.value;
        intrinsicApyMap.mBASIS = parseFloat(midasData.mBasisAPY || '0') * 100; // Convert decimal to percentage
        intrinsicApyMap.mTBILL = parseFloat(midasData.mTbillAPY || '0') * 100; // Convert decimal to percentage
      } else {
        console.error('Midas API failed:', midasResponse.reason);
        intrinsicApyMap.mBASIS = 0;
        intrinsicApyMap.mTBILL = 0;
      }

      // Process Stacy.fi API response
      if (stacyResponse.status === 'fulfilled') {
        const stacyData = stacyResponse.value;
        // Remove the '%' symbol and parse the percentage value
        const aprValue = parseFloat(stacyData.replace('%', '').trim());
        intrinsicApyMap.stXTZ = isNaN(aprValue) ? 0 : aprValue;
      } else {
        console.error('Stacy.fi API failed:', stacyResponse.reason);
        intrinsicApyMap.stXTZ = 0;
      }

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
