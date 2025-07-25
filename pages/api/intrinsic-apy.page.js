/**
 * API handler for fetching intrinsic APY values from multiple sources
 * Acts as a proxy to avoid CORS issues
 */
export default async function handler(req, res) {
  // Log the request for debugging
  console.log('API Route called: /api/intrinsic-apy', {
    method: req.method,
    query: req.query,
  });

  // Setup CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET requests are allowed',
    });
  }

  try {
    // Fetch from multiple APIs concurrently
    const [midasResponse, stacyResponse] = await Promise.allSettled([
      // Fetch from the Midas API for mBASIS and mTBILL
      fetch('https://api-prod.midas.app/api/data/kpi')
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Midas API error! status: ${response.status}`);
          }
          return response.json();
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
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Stacy.fi API error! status: ${response.status}`);
          }
          return response.text(); // API returns plain text percentage
        })
        .catch((err) => {
          console.error('Error fetching stXTZ APR:', err);
          // Return default value for development
          return '0%';
        }),
    ]);

    // Process responses and build the result object
    let result = {
      mBasisAPY: '0',
      mTbillAPY: '0',
      stXTZ_APR: '0%',
      timestamp: new Date().toISOString(),
      sources: {
        midas: midasResponse.status,
        stacy: stacyResponse.status,
      }
    };

    // Process Midas API response
    if (midasResponse.status === 'fulfilled') {
      const midasData = midasResponse.value;
      result.mBasisAPY = midasData.mBasisAPY || '0';
      result.mTbillAPY = midasData.mTbillAPY || '0';
    } else {
      console.error('Midas API failed:', midasResponse.reason);
    }

    // Process Stacy.fi API response
    if (stacyResponse.status === 'fulfilled') {
      result.stXTZ_APR = stacyResponse.value;
    } else {
      console.error('Stacy.fi API failed:', stacyResponse.reason);
    }

    // Return the combined result
    res.status(200).json(result);

  } catch (error) {
    console.error('Error in intrinsic APY API:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch intrinsic APY data',
      timestamp: new Date().toISOString(),
    });
  }
} 