// Next.js API route for proxying intrinsic APY data from external APIs

/**
 * In-memory cache with TTL (Time To Live)
 */
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const RATE_LIMIT_CACHE_TTL = 15 * 60 * 1000; // 15 minutes for rate limited data
const ERROR_CACHE_TTL = 2 * 60 * 1000; // 2 minutes for error responses

/**
 * Cache helper functions
 */
const getCachedData = (key, customTTL = CACHE_TTL) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < customTTL) {
    return cached.data;
  }
  if (cached) {
    cache.delete(key); // Remove expired cache
  }
  return null;
};

const setCachedData = (key, data, customTTL = CACHE_TTL) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: customTTL,
  });
};

/**
 * Get cached data with longer TTL for rate-limited responses
 */
const getCachedDataWithFallback = (key) => {
  // First try normal cache
  let cached = getCachedData(key, CACHE_TTL);
  if (cached) return cached;
  
  // Then try extended cache for rate-limited responses
  cached = getCachedData(key, RATE_LIMIT_CACHE_TTL);
  if (cached) {
    console.log(`Using extended cache for ${key} due to rate limiting`);
    return cached;
  }
  
  return null;
};

/**
 * Fetch data from Midas API with error handling
 */
const fetchMidasData = async () => {
  const cacheKey = 'midas-apy';
  
  // Try to get cached data with fallback for rate limiting
  const cached = getCachedDataWithFallback(cacheKey);
  if (cached) {
    console.log('Returning cached Midas data');
    return cached;
  }

  try {
    console.log('Fetching fresh data from Midas API');
    const response = await fetch('https://api-prod.midas.app/api/data/kpi', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SuperLend-Markets/1.0',
        'Cache-Control': 'no-cache',
      },
      // Add timeout
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    if (!response.ok) {
      // Handle rate limiting specifically
      if (response.status === 429) {
        console.log('Midas API rate limited, using fallback data');
        const fallbackData = {
          mBasisAPY: '0',
          mTbillAPY: '0',
          mMevAPY: '0',
          _error: `Midas API error: ${response.status} ${response.statusText}`,
          _rateLimited: true,
        };
        
        // Cache the fallback data for longer period during rate limiting
        setCachedData(cacheKey, fallbackData, RATE_LIMIT_CACHE_TTL);
        return fallbackData;
      }
      
      throw new Error(`Midas API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate the response structure
    const midasData = {
      mBasisAPY: data.mBasisAPY || '0',
      mTbillAPY: data.mTbillAPY || data.mTBillAPY || '0', // Handle potential case differences
      mMevAPY: data.mMevAPY || data.mMEVAPY || '0',
    };

    // Cache successful response with normal TTL
    setCachedData(cacheKey, midasData, CACHE_TTL);
    return midasData;

  } catch (error) {
    console.error('Error fetching Midas data:', error);
    
    // Return fallback data on error
    const fallbackData = {
      mBasisAPY: '0',
      mTbillAPY: '0',
      mMevAPY: '0',
      _error: error.message,
    };
    
    // Cache error responses for shorter period
    setCachedData(cacheKey, fallbackData, ERROR_CACHE_TTL);
    return fallbackData;
  }
};

/**
 * Fetch data from Stacy API with error handling
 */
const fetchStacyData = async () => {
  const cacheKey = 'stacy-apr';
  
  // Try to get cached data with fallback for errors
  const cached = getCachedDataWithFallback(cacheKey);
  if (cached) {
    console.log('Returning cached Stacy data');
    return cached;
  }

  try {
    console.log('Fetching fresh data from Stacy API');
    const response = await fetch('https://supply.stacy.fi/apr/stxtz', {
      method: 'GET',
      headers: {
        'Accept': 'text/plain, application/json',
        'User-Agent': 'SuperLend-Markets/1.0',
        'Cache-Control': 'no-cache',
      },
      // Shorter timeout for Stacy API since it's been timing out
      signal: AbortSignal.timeout(8000), // 8 second timeout
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.log('Stacy API rate limited, using fallback data');
        const fallbackData = {
          stXTZ: '0',
          _error: `Stacy API error: ${response.status} ${response.statusText}`,
          _rateLimited: true,
        };
        
        // Cache the fallback data for longer period during rate limiting
        setCachedData(cacheKey, fallbackData, RATE_LIMIT_CACHE_TTL);
        return fallbackData;
      }
      
      throw new Error(`Stacy API error: ${response.status} ${response.statusText}`);
    }

    const rawData = await response.text();
    
    // Validate and parse the response
    const numericValue = parseFloat(rawData);
    if (isNaN(numericValue) || !isFinite(numericValue)) {
      throw new Error(`Invalid numeric response from Stacy API: ${rawData}`);
    }

    const stacyData = {
      stXTZ: rawData.trim(),
      _rawValue: numericValue,
    };

    // Cache successful response with normal TTL
    setCachedData(cacheKey, stacyData, CACHE_TTL);
    return stacyData;

  } catch (error) {
    console.error('Error fetching Stacy data:', error);
    
    // Return fallback data on error
    const fallbackData = {
      stXTZ: '0',
      _error: error.message,
    };
    
    // Cache error responses for shorter period, but still cache to avoid repeated failures
    setCachedData(cacheKey, fallbackData, ERROR_CACHE_TTL);
    return fallbackData;
  }
};

/**
 * Fetch data from Lombard Finance API with error handling
 */
const fetchLombardData = async () => {
  const cacheKey = 'lombard-apy';
  
  // Try to get cached data with fallback for errors
  const cached = getCachedDataWithFallback(cacheKey);
  if (cached) {
    console.log('Returning cached Lombard data');
    return cached;
  }

  try {
    console.log('Fetching fresh data from Lombard Finance API');
    const response = await fetch('https://mainnet.prod.lombard.finance/api/v1/analytics/estimated-apy', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SuperLend-Markets/1.0',
        'Cache-Control': 'no-cache',
      },
      // 10 second timeout
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.log('Lombard API rate limited, using fallback data');
        const fallbackData = {
          LBTC: '0',
          _error: `Lombard API error: ${response.status} ${response.statusText}`,
          _rateLimited: true,
        };
        
        // Cache the fallback data for longer period during rate limiting
        setCachedData(cacheKey, fallbackData, RATE_LIMIT_CACHE_TTL);
        return fallbackData;
      }
      
      throw new Error(`Lombard API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate and parse the response
    const lbtcApy = data.lbtc_estimated_apy || 0;
    if (typeof lbtcApy !== 'number' || isNaN(lbtcApy)) {
      throw new Error(`Invalid numeric response from Lombard API: ${lbtcApy}`);
    }

    const lombardData = {
      LBTC: lbtcApy.toString(),
      _rawValue: lbtcApy,
    };

    // Cache successful response with normal TTL
    setCachedData(cacheKey, lombardData, CACHE_TTL);
    return lombardData;

  } catch (error) {
    console.error('Error fetching Lombard data:', error);
    
    // Return fallback data on error
    const fallbackData = {
      LBTC: '0',
      _error: error.message,
    };
    
    // Cache error responses for shorter period, but still cache to avoid repeated failures
    setCachedData(cacheKey, fallbackData, ERROR_CACHE_TTL);
    return fallbackData;
  }
};

/**
 * API handler for intrinsic APY data
 */
export default async function handler(req, res) {
  // Log the request for debugging
  console.log('API Route called: /api/intrinsic-apy', {
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Setup CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600'); // 5min cache, 10min stale

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'Only GET requests are supported',
    });
  }

  try {
    const startTime = Date.now();

    // Fetch data from all APIs concurrently
    const [midasData, stacyData, lombardData] = await Promise.all([
      fetchMidasData(),
      fetchStacyData(),
      fetchLombardData(),
    ]);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Combine the data in the expected format
    const combinedData = {
      success: true,
      data: {
        mBasisAPY: midasData.mBasisAPY,
        mTbillAPY: midasData.mTbillAPY,
        stXTZ: stacyData.stXTZ,
        mMEV: midasData.mMevAPY,
        LBTC: lombardData.LBTC,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        responseTimeMs: responseTime,
        cached: {
          midas: !!getCachedDataWithFallback('midas-apy'),
          stacy: !!getCachedDataWithFallback('stacy-apr'),
          lombard: !!getCachedDataWithFallback('lombard-apy'),
        },
        rateLimited: {
          midas: !!midasData._rateLimited,
          stacy: !!stacyData._rateLimited,
          lombard: !!lombardData._rateLimited,
        },
        errors: {
          midas: midasData._error || null,
          stacy: stacyData._error || null,
          lombard: lombardData._error || null,
        },
        cacheInfo: {
          midasCacheTTL: midasData._rateLimited ? '15 minutes' : '5 minutes',
          stacyCacheTTL: stacyData._rateLimited ? '15 minutes' : '5 minutes',
          lombardCacheTTL: lombardData._rateLimited ? '15 minutes' : '5 minutes',
        },
      },
    };

    // Log performance metrics
    console.log(`Intrinsic APY API response time: ${responseTime}ms`, {
      cached: combinedData.metadata.cached,
      hasErrors: !!(midasData._error || stacyData._error || lombardData._error),
    });

    // Return success response
    return res.status(200).json(combinedData);

  } catch (error) {
    console.error('Error in intrinsic-apy API:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: {
        // Fallback data to prevent frontend breaks
        mBasisAPY: '0',
        mTbillAPY: '0',
        stXTZ: '0',
        mMEV: '0',
        LBTC: '0',
      },
      metadata: {
        timestamp: new Date().toISOString(),
        responseTimeMs: 0,
        cached: { midas: false, stacy: false, lombard: false },
        errors: { api: error.message },
      },
    });
  }
}

// Export config for API route
export const config = {
  api: {
    responseLimit: '1mb',
  },
};
