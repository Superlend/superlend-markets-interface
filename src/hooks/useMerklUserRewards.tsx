import { useEffect, useState } from 'react';

interface MerklUserReward {
  chain: {
    id: number;
    name: string;
    icon: string;
    Explorer: Array<{
      id: string;
      type: string;
      url: string;
      chainId: number;
    }>;
  };
  rewards: Array<{
    root: string;
    recipient: string;
    amount: string;
    claimed: string;
    pending: string;
    proofs: string[];
    token: {
      address: string;
      chainId: number;
      symbol: string;
      decimals: number;
    };
    breakdowns: Array<{
      reason: string;
      amount: string;
      claimed: string;
      pending: string;
      campaignId: string;
    }>;
  }>;
}

export const useMerklUserRewards = (
  walletAddress: string,
  chainId = 42793
): {
  userRewards: MerklUserReward[];
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userRewards, setUserRewards] = useState<MerklUserReward[]>([]);

  useEffect(() => {
    const fetchUserRewards = async () => {
      if (!walletAddress) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.merkl.xyz/v4/users/${walletAddress}/rewards?chainId=${chainId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch user Merkl rewards');
        }

        const data: MerklUserReward[] = await response.json();
        setUserRewards(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Error fetching user Merkl rewards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRewards();
  }, [walletAddress, chainId]); // Re-fetch when walletAddress or chainId changes

  return {
    userRewards,
    loading,
    error,
  };
};
