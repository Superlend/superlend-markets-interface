import { StateCreator } from 'zustand';

// Define supported tokens for intrinsic APY
export const SUPPORTED_INTRINSIC_TOKENS = ['mBASIS', 'mTBILL', 'stXTZ', 'mMEV', 'LBTC'];

export const hasIntrinsicApy = (symbol: string) => {
  return SUPPORTED_INTRINSIC_TOKENS.includes(symbol);
};

export interface IntrinsicApyResponse {
  mBasisAPY?: string;
  mTbillAPY?: string;
  stXTZ?: string;
  mMEV?: string;
  LBTC?: string;
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

      // Try to fetch from our proxy API first, with fallback to direct APIs
      let apiResponse;

      try {
        // Use our proxy API for better performance and error handling
        const proxyResponse = await fetch('/api/intrinsic-apy/', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!proxyResponse.ok) {
          throw new Error(`Proxy API error: ${proxyResponse.status}`);
        }

        const proxyData = await proxyResponse.json();

        if (proxyData.success) {
          console.log('Using proxy API data', {
            cached: proxyData.metadata?.cached,
            responseTime: proxyData.metadata?.responseTimeMs,
          });
          apiResponse = proxyData.data;
        } else {
          throw new Error(`Proxy API returned error: ${proxyData.error}`);
        }
      } catch (proxyError) {
        console.warn('Proxy API failed, falling back to direct API calls:', proxyError);

        // Fallback to direct API calls if proxy fails
        const [midasApiResponse, stxtzAprRaw, lbtcApiResponse] = await Promise.all([
          fetch('https://api-prod.midas.app/api/data/kpi')
            .then((res) => {
              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }
              return res.json();
            })
            .catch((err) => {
              console.error('Error fetching intrinsic APY:', err);
              return {
                mBasisAPY: '0',
                mTbillAPY: '0',
                mMevAPY: '0',
              };
            }),

          fetch('https://supply.stacy.fi/apr/stxtz')
            .then((res) => {
              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }
              return res.text();
            })
            .catch((err) => {
              console.error('Error fetching stXTZ APR:', err);
              return '0';
            }),

          fetch('https://mainnet.prod.lombard.finance/api/v1/analytics/estimated-apy')
            .then((res) => {
              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }
              return res.json();
            })
            .catch((err) => {
              console.error('Error fetching LBTC APY:', err);
              return {
                lbtc_estimated_apy: 0,
              };
            }),
        ]);

        apiResponse = {
          mBasisAPY: midasApiResponse.mBasisAPY || '0',
          mTbillAPY: midasApiResponse.mTbillAPY || '0',
          stXTZ: stxtzAprRaw,
          mMEV: midasApiResponse.mMevAPY || '0',
          LBTC: (lbtcApiResponse.lbtc_estimated_apy || 0).toString(),
        };
      }

      // Parse Stacy APR: if value <= 1 assume decimal, otherwise percent
      const parsedStxtzApr = (() => {
        const n = parseFloat(apiResponse.stXTZ || '0');
        if (!isFinite(n) || isNaN(n)) return 0;
        return n <= 1 ? n * 100 : n;
      })();

      // Extract APY values and convert to percentage
      const intrinsicApyMap: Record<string, number> = {
        mBASIS: parseFloat(apiResponse.mBasisAPY || '0') * 100, // Convert decimal to percentage
        mTBILL: parseFloat(apiResponse.mTbillAPY || '0') * 100, // Convert decimal to percentage
        stXTZ: parsedStxtzApr, // Stacy APR already in percent (or converted above)
        mMEV: parseFloat(apiResponse.mMEV || '0') * 100, // Convert decimal to percentage
        LBTC: parseFloat(apiResponse.LBTC || '0') * 100, // Convert decimal to percentage
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
