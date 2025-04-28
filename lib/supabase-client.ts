import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// For server-side operations (used in API routes)
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Type for Telegram users table
export interface TelegramUser {
  id?: number;
  telegram_username: string;
  wallet_address: string | null;
  portfolio_value: number;
  website: 'AGGREGATOR' | 'MARKETS';
  created_at?: string;
}

// Helper function for error messages
export function getErrorMessage(error: any): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Unknown error occurred';
}
