/**
 * Service for handling Telegram-related functionality
 */

interface SubmitTelegramUsernameParams {
  telegramUsername: string;
  walletAddress?: string;
  portfolioValue: number;
  website?: 'AGGREGATOR' | 'MARKETS';
}

interface SubmitTelegramUsernameResponse {
  success: boolean;
  message: string;
}

/**
 * Checks if a user has already submitted their Telegram username
 * @param walletAddress The wallet address to check
 * @returns Promise<boolean> True if the user has already submitted their Telegram username
 */
export async function checkTelegramUsernameSubmitted(walletAddress: string): Promise<boolean> {
  if (!walletAddress) return false;

  try {
    console.log('TELEGRAM CHECK: Starting check for wallet:', walletAddress);

    // Use standard Next.js API route with trailing slash to match trailingSlash: true config
    const apiUrl = `/api/telegram-check/?wallet=${walletAddress}`;
    console.log('TELEGRAM CHECK: Using API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    console.log('TELEGRAM CHECK: Response status:', response.status);

    if (!response.ok) {
      console.error(
        `TELEGRAM CHECK: Error checking Telegram username: ${response.statusText} (${response.status})`
      );
      return false;
    }

    const data = await response.json();
    console.log('TELEGRAM CHECK: API response:', data);
    return data.exists;
  } catch (error) {
    console.error('TELEGRAM CHECK: Error checking Telegram username submission:', error);
    return false; // Default to false on error
  }
}

/**
 * Submit a user's Telegram username to the backend
 * @param params Object containing Telegram username and additional user context
 * @returns Promise resolving to the API response
 */
export async function submitTelegramUsername({
  telegramUsername,
  walletAddress,
  portfolioValue,
  website = 'MARKETS', // Default to MARKETS for this implementation
}: SubmitTelegramUsernameParams): Promise<SubmitTelegramUsernameResponse> {
  try {
    console.log('SUBMIT TELEGRAM: Starting submission process for:', telegramUsername);
    console.log('SUBMIT TELEGRAM: Full payload:', {
      telegramUsername,
      walletAddress,
      portfolioValue,
      website,
    });

    // Standard Next.js API route with trailing slash to match trailingSlash: true config
    const apiUrl = '/api/telegram-connect/';
    console.log('SUBMIT TELEGRAM: Using API URL:', apiUrl);

    // Prepare the request payload
    const payload = {
      telegramUsername,
      walletAddress,
      portfolioValue,
      website,
    };

    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('SUBMIT TELEGRAM: Response status:', response.status);

    if (!response.ok) {
      console.error(
        'SUBMIT TELEGRAM: Request failed with status:',
        response.status,
        response.statusText
      );

      try {
        const errorData = await response.json();
        console.error('SUBMIT TELEGRAM: Error response data:', errorData);
        throw new Error(errorData.message || `Server responded with status: ${response.status}`);
      } catch (jsonError) {
        console.error('SUBMIT TELEGRAM: Failed to parse error response:', jsonError);
        throw new Error(
          `Server responded with status: ${response.status} (${response.statusText})`
        );
      }
    }

    // Parse the successful response
    const data = await response.json();
    console.log('SUBMIT TELEGRAM: Success response data:', data);

    return {
      success: data.success,
      message: data.message || 'Successfully connected Telegram username',
    };
  } catch (error) {
    console.error('SUBMIT TELEGRAM: Error caught in service:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Validate a Telegram username format
 *
 * @param telegramUsername The Telegram username to validate
 * @returns String containing error message if invalid, empty string if valid
 */
export function validateTelegramUsername(telegramUsername: string): string {
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
