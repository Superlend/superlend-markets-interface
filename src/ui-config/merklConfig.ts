export const MERKL_CONFIG = {
  API_BASE_URL: 'https://api.merkl.xyz/v4',
  CHAIN_ID: 42793,
} as const;

export const getMerklCampaignUrl = (campaignId: string) => {
  const params = new URLSearchParams({
    chainId: MERKL_CONFIG.CHAIN_ID.toString(),
    campaignId,
    point: 'true',
    withOpportunity: 'true',
  });

  return `${MERKL_CONFIG.API_BASE_URL}/campaigns/?${params.toString()}`;
}; 