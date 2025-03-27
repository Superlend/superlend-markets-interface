import { useEffect, useState } from 'react';
import { getMerklCampaignUrl } from '../ui-config/merklConfig';

interface MerklRewardsResponse {
  campaigns: {
    id: string;
    chainId: number;
    rewards: {
      amount: string;
      token: string;
    }[];
    opportunity?: {
      apr: number;
    };
  }[];
}

export const useMerklRewards = (campaignId: string): any => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [merklData, setMerklData] = useState<MerklRewardsResponse | null>(null);

  useEffect(() => {
    const fetchMerklRewards = async () => {
      try {
        const response = await fetch(getMerklCampaignUrl(campaignId));
        if (!response.ok) {
          throw new Error('Failed to fetch Merkl rewards');
        }

        const data: MerklRewardsResponse = await response.json();
        setMerklData(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Error fetching Merkl rewards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMerklRewards();
  }, [campaignId]); // Re-fetch when campaignId changes

  return {
    merklData,
    loading,
    error,
  };
}; 