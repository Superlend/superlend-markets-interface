# Telegram Integration for Superlend

This feature allows users to connect their Telegram accounts to receive updates and alerts about their Superlend portfolio when it exceeds a certain threshold value.

## Setup Instructions

### 1. Supabase Setup

1. Create a [Supabase](https://supabase.com/) account and project
2. Set up a table named `telegram_users` with the following columns:
   - `id`: bigint (primary key, auto-increment)
   - `telegram_username`: text (not null)
   - `wallet_address`: text
   - `portfolio_value`: numeric (not null)
   - `created_at`: timestamp with timezone (default: now())

### 2. Environment Variables

Add the following environment variables to your `.env.local` file:

```
# Supabase Configuration for Telegram Integration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Replace the placeholder values with your actual Supabase credentials from the Supabase dashboard.

### 3. Integration Usage

The Telegram dialog will automatically appear for users whose portfolio value exceeds the threshold defined in `hooks/useTelegramDialog.ts` (default: $1000 USD).
To change the threshold, modify the `PORTFOLIO_VALUE_THRESHOLD` constant in `hooks/useTelegramDialog.ts`.

### 4. Components Overview

- `lib/supabase-client.ts`: Supabase client configuration
- `lib/telegram-service.ts`: Service for Telegram-related functionality
- `pages/api/telegram-check.ts`: API route to check if user has already submitted a username
- `pages/api/telegram-connect.ts`: API route to submit Telegram username
- `components/dialogs/TelegramConnectionDialog.tsx`: Dialog component for connecting Telegram
- `hooks/useTelegramDialog.ts`: Hook for managing the dialog state and logic
- `components/TelegramIntegration.tsx`: Component to integrate the dialog into your app

### 5. Customize Integration

You can customize the appearance and behavior of the dialog by modifying `TelegramConnectionDialog.tsx`.

For production deployments, update the portfolio value calculation in `TelegramIntegration.tsx` to use your actual portfolio data. 