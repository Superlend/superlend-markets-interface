const { runMiddleware } = require('../../lib/middleware');
const { corsMiddleware } = require('../../lib/cors-middleware');
const { supabaseServer, getErrorMessage } = require('../../lib/supabase-client');

// Import the validation function
const validateTelegramUsername = (telegramUsername) => {
  const trimmedUsername = telegramUsername.trim();
  if (!trimmedUsername) {
    return 'Telegram username is required';
  }

  // Remove @ symbol if present
  const usernameWithoutAt = trimmedUsername.startsWith('@') 
    ? trimmedUsername.substring(1) 
    : trimmedUsername;

  // Check length requirements (5-32 characters)
  if (usernameWithoutAt.length < 5) {
    return 'Telegram username must be at least 5 characters';
  }

  if (usernameWithoutAt.length > 32) {
    return 'Telegram username cannot exceed 32 characters';
  }

  // Check for valid characters (letters, numbers, and underscores)
  if (!/^[a-zA-Z0-9_]+$/.test(usernameWithoutAt)) {
    return 'Telegram username can only contain letters, numbers, and underscores';
  }

  return '';
};

/**
 * API route for submitting a Telegram username
 */
module.exports = async function handler(req, res) {
  // Log the route being accessed and method
  console.log('======= TELEGRAM CONNECT API =======');
  console.log('API Route accessed: /api/telegram-connect');
  console.log('Request method:', req.method);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request body:', req.body);
  console.log('Request query:', req.query);
  console.log('=====================================');
  
  try {
    // Create the CORS middleware
    const corsOptions = {
      methods: ['POST', 'OPTIONS'],
      origin: '*',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    };
    
    // Log CORS configuration
    console.log('TELEGRAM CONNECT API: CORS middleware configuration:', corsOptions);
    
    // Run the CORS middleware
    console.log('TELEGRAM CONNECT API: Running CORS middleware');
    await runMiddleware(req, res, corsMiddleware(corsOptions));
    console.log('TELEGRAM CONNECT API: CORS middleware completed successfully');
    
    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method);
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
      // Get request body
      const { telegramUsername, walletAddress, portfolioValue, website = 'MARKETS' } = req.body;

      // Validate Telegram username format
      const validationError = validateTelegramUsername(telegramUsername);
      if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
      }

      // Format username (remove @ if present)
      const formattedUsername = telegramUsername.startsWith('@') 
        ? telegramUsername.substring(1) 
        : telegramUsername;

      console.log('Saving telegram username:', { formattedUsername, walletAddress, portfolioValue, website });

      // Add to Supabase
      const { error } = await supabaseServer
        .from('telegram_users')
        .insert({
          telegram_username: formattedUsername,
          wallet_address: walletAddress || null,
          portfolio_value: portfolioValue,
          website,
        });

      if (error) {
        console.error('Supabase error:', error);
        const errorMessage = getErrorMessage(error);
        return res.status(400).json({ success: false, message: errorMessage });
      }

      // Log for debugging
      console.log('Telegram username submission saved:', {
        telegramUsername: formattedUsername,
        walletAddress,
        portfolioValue,
        website,
        timestamp: new Date().toISOString()
      });

      // Send success response
      return res.status(200).json({
        success: true,
        message: 'Successfully saved Telegram username'
      });
    } catch (error) {
      console.error('Error in telegram-connect API:', error);
      let message = 'Failed to save Telegram username';
      
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'object' && error !== null) {
        message = getErrorMessage(error);
      }
      
      return res.status(500).json({ success: false, message });
    }
  } catch (corsError) {
    console.error('CORS middleware error:', corsError);
    return res.status(500).json({
      success: false,
      message: 'Error in CORS middleware'
    });
  }
} 