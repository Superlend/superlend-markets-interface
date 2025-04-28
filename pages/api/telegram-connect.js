// Import supabase client for database operations
import { getErrorMessage, supabaseServer } from '../../lib/supabase-client';

// Telegram username validation function
function validateTelegramUsername(telegramUsername) {
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
}

/**
 * API handler for Telegram username connection
 */
export default async function handler(req, res) {
  // Log the request for debugging
  console.log('API Route called: /api/telegram-connect', {
    method: req.method,
    body: req.body,
    query: req.query,
  });

  // Setup CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    // Get request body
    const { telegramUsername, walletAddress, portfolioValue, website = 'MARKETS' } = req.body;

    // Validate required fields
    if (!telegramUsername) {
      return res.status(400).json({
        success: false,
        message: 'Telegram username is required',
      });
    }

    // Validate Telegram username format
    const validationError = validateTelegramUsername(telegramUsername);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // Format username (remove @ if present)
    const formattedUsername = telegramUsername.startsWith('@')
      ? telegramUsername.substring(1)
      : telegramUsername;

    console.log('Saving telegram username:', {
      telegramUsername: formattedUsername,
      walletAddress,
      portfolioValue,
      website,
    });

    // Re-enable database operations
    try {
      // Try to save to Supabase
      const { error } = await supabaseServer.from('telegram_users').insert({
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

      // Send success response
      return res.status(200).json({
        success: true,
        message: 'Successfully connected Telegram username',
      });
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error occurred',
        error: dbError.message,
      });
    }
  } catch (error) {
    console.error('Error in telegram-connect API:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
}
