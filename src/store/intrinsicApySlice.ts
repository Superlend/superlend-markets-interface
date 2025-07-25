import { StateCreator } from 'zustand';

// Define supported tokens for intrinsic APY
export const SUPPORTED_INTRINSIC_TOKENS = ['mBASIS', 'mTBILL', 'stXTZ'];

export const hasIntrinsicApy = (symbol: string) => {
  return SUPPORTED_INTRINSIC_TOKENS.includes(symbol);
};

export interface IntrinsicApyResponse {
  mBasisAPY?: string;
  mTbillAPY?: string;
  stXTZ_APR?: string;
  timestamp?: string;
  sources?: {
    midas: string;
    stacy: string;
  };
  [key: string]: string | object | undefined;
}

export interface IntrinsicApySlice {
  intrinsicApyMap: Record<string, number>;
  intrinsicApyLoading: boolean;
  intrinsicApyError: Error | null;
  intrinsicApyLastUpdated: number;
  fetchIntrinsicApy: () => Promise<void>;
}

// Helper function to get the correct API URL
const getApiUrl = () => {
  // Check if we're in the browser or server environment
  if (typeof window !== 'undefined') {
    // Client-side: use relative URL with trailing slash (Next.js redirects to this)
    return '/api/intrinsic-apy/';
  } else {
    // Server-side: use absolute URL with trailing slash
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXTAUTH_URL 
      ? process.env.NEXTAUTH_URL 
      : 'http://localhost:3000';
    return `${baseUrl}/api/intrinsic-apy/`;
  }
};

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

      // Fetch from our Next.js API route (acts as proxy to avoid CORS)
      const apiUrl = getApiUrl();
      const response = await fetch(apiUrl)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`API error! status: ${res.status}`);
          }
          return res.json();
        });

      // Process the response and build intrinsicApyMap
      const intrinsicApyMap: Record<string, number> = {};

      // Process mBASIS and mTBILL from Midas API data
      intrinsicApyMap.mBASIS = parseFloat(response.mBasisAPY || '0') * 100; // Convert decimal to percentage
      intrinsicApyMap.mTBILL = parseFloat(response.mTbillAPY || '0') * 100; // Convert decimal to percentage

      // Process stXTZ from Stacy.fi API data
      if (response.stXTZ_APR) {
        // Remove the '%' symbol and parse the percentage value
        const aprValue = parseFloat(response.stXTZ_APR.replace('%', '').trim());
        intrinsicApyMap.stXTZ = isNaN(aprValue) ? 0 : aprValue;
      } else {
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
