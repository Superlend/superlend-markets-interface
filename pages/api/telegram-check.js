// Import supabase client for database operations
import { supabaseServer } from '../../lib/supabase-client';

/**
 * API handler for checking if a wallet address has a Telegram username
 */
export default async function handler(req, res) {
  // Log the request for debugging
  console.log('API Route called: /api/telegram-check', {
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
      exists: false,
      message: 'Method not allowed',
    });
  }

  try {
    // Get wallet address from query string
    const walletAddress = req.query.wallet;

    // Validate required fields
    if (!walletAddress) {
      return res.status(400).json({
        exists: false,
        message: 'Wallet address is required',
      });
    }

    console.log('Checking Telegram username for wallet:', walletAddress);

    // Re-enable the database query with proper async/await handling
    try {
      // Query Supabase to check if the wallet address exists
      const { data, error } = await supabaseServer
        .from('telegram_users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Failed to query database');
      }

      // Return whether a record exists
      return res.status(200).json({
        exists: !!data,
        message: data ? 'Telegram username found' : 'No Telegram username found',
      });
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      // During testing/development, return a mock response
      return res.status(200).json({
        exists: false,
        message: 'Database error, defaulting to no username found',
        error: dbError.message,
      });
    }
  } catch (error) {
    console.error('Error in telegram-check API:', error);
    return res.status(500).json({
      exists: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
}
