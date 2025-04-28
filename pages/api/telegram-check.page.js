const { runMiddleware } = require('../../lib/middleware');
const { corsMiddleware } = require('../../lib/cors-middleware');

/**
 * API handler for checking if a Telegram username has been submitted for a wallet
 */
module.exports = async function handler(req, res) {
  console.log('TELEGRAM CHECK API: Handler function started');
  console.log('TELEGRAM CHECK API: Request method:', req.method);
  console.log('TELEGRAM CHECK API: Request URL:', req.url);
  console.log('TELEGRAM CHECK API: Request query:', req.query);
  console.log('TELEGRAM CHECK API: Request headers:', JSON.stringify(req.headers, null, 2));

  try {
    // Create the CORS middleware
    const corsOptions = {
      methods: ['GET', 'OPTIONS'],
      origin: '*',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    };

    // Log CORS configuration
    console.log('TELEGRAM CHECK API: CORS middleware configuration:', corsOptions);

    // Run the CORS middleware
    console.log('TELEGRAM CHECK API: Running CORS middleware');
    await runMiddleware(req, res, corsMiddleware(corsOptions));
    console.log('TELEGRAM CHECK API: CORS middleware completed successfully');

    // Only allow GET method
    if (req.method !== 'GET') {
      console.log('TELEGRAM CHECK API: Method not allowed:', req.method);
      return res.status(405).json({
        exists: false,
        message: 'Method not allowed',
      });
    }

    // Get wallet address from query parameters
    const { wallet } = req.query;
    console.log('TELEGRAM CHECK API: Extracted wallet from query:', wallet);

    // Validate required fields
    if (!wallet || typeof wallet !== 'string') {
      console.log('TELEGRAM CHECK API: Missing wallet parameter');
      return res.status(400).json({
        exists: false,
        message: 'Wallet address is required',
      });
    }

    // For now, just return a mock response - in production you would check your database
    // This is just for debugging the API endpoint functionality
    console.log('TELEGRAM CHECK API: Returning mock response');

    // Return success response
    const response = {
      exists: false, // Mock response - always false for testing
      message: 'Telegram username not found for this wallet',
    };

    console.log('TELEGRAM CHECK API: Sending response:', response);
    return res.status(200).json(response);
  } catch (error) {
    console.error('TELEGRAM CHECK API: Error in handler:', error);
    console.error('TELEGRAM CHECK API: Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Return an error response
    return res.status(500).json({
      exists: false,
      message: 'An error occurred while processing your request',
    });
  }
};
