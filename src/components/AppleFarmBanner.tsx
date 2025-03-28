import React from 'react';
import { Typography, Box, Card as MuiCard } from '@mui/material';
import { BigNumber } from '@ethersproject/bignumber';
import ImageWithDefault from '@/components/ImageWithDefault';
import { ArrowRightIcon } from 'lucide-react';
import { styled } from '@mui/material/styles';
import { useMerklUserRewards } from '@/hooks/useMerklUserRewards';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

const StyledCard = styled(MuiCard)(() => ({
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(to right, rgba(22, 163, 74, 0.1), rgba(22, 163, 74, 0.05))',
  // cursor: 'pointer',
  borderRadius: '1.125rem',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(22, 163, 74, 0.2)',
  boxShadow: '0 0 10px rgba(22, 163, 74, 0.1)',
  '&:hover': {
    boxShadow: '0 0 20px rgba(22, 163, 74, 0.2)',
    border: '1px solid rgba(22, 163, 74, 0.4)',
  },
}));

const ContentWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 24px',
  gap: '24px',
});

const TextContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  zIndex: 1,
});

const TitleWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const RewardsText = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#4ade80',
  fontWeight: 600,
  '& svg': {
    transition: 'transform 0.2s ease',
  },
  '&:hover svg': {
    transform: 'translateX(4px)',
  },
});

const RewardsInfoBox = styled(Box)({
  display: 'flex',
  // flexDirection: 'column',
  // alignItems: 'flex-end',
  gap: '8px',
  // marginTop: '12px',
  textTransform: 'capitalize',
});

const RewardItem = styled(Typography)({
  fontSize: '0.875rem',
  color: 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontWeight: 600,
  textTransform: 'capitalize',
});

const StyledButton = styled('button')(() => ({
  background: 'rgba(22, 163, 74, 0.1)',
  border: '1px solid rgba(22, 163, 74, 0.3)',
  borderRadius: '0.75rem',
  padding: '10px 20px',
  color: '#4ade80',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  textTransform: 'capitalize',
  '&:hover': {
    background: 'rgba(22, 163, 74, 0.2)',
    border: '1px solid rgba(22, 163, 74, 0.5)',
    transform: 'translateY(-2px)',
  },
}));

export default function AppleFarmBanner() {
  const { currentAccount: address } = useWeb3Context();
  const { userRewards, loading } = useMerklUserRewards(address || '', 42793);

  const totalRewards = BigNumber.from(userRewards?.[0]?.rewards?.[0]?.amount ?? '0').div(BigNumber.from(10).pow(18));
  const totalRewardsNumber = parseFloat(totalRewards.toString());

  return (
    <div style={{ textDecoration: 'none', marginBottom: '-60px' }}>
      <StyledCard>
        <ContentWrapper>
          <TextContent>
            <TitleWrapper>
              <ImageWithDefault
                src="/logos/apple-green.png"
                alt="Apple Farm"
                width={36}
                height={36}
                style={{ objectFit: 'contain' }}
              />
              <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: '5px' }}>
                <Typography
                  component="h2"
                  sx={{
                    fontSize: '1.125rem',
                    lineHeight: 1.75,
                    fontWeight: 600,
                    color: '#ffffff',
                  }}
                >
                  Apple Farm is Live on Etherlink!
                </Typography>
                <a href="https://www.applefarm.xyz" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#4ade80' }}>
                  <RewardsText>
                    Season One Rewards: $3,000,000
                    <ArrowRightIcon size={16} />
                  </RewardsText>
                </a>
              </Box>
            </TitleWrapper>
          </TextContent>

          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              alignItems: 'end',
              gap: '12px',
              position: 'relative',
              right: 24,
            }}
          >
            {loading && (
              <RewardItem>Loading rewards...</RewardItem>
            )}
            {!loading && address && totalRewardsNumber > 0 && (
              <RewardsInfoBox>
                <RewardItem sx={{ color: '#4ade80', fontWeight: 600 }}>
                  Your Available Rewards:
                </RewardItem>
                <RewardItem>
                  {formatRewards(totalRewardsNumber)}
                </RewardItem>
              </RewardsInfoBox>
            )}
            {!loading && address && totalRewardsNumber === 0 && (
              <RewardsInfoBox>
                <RewardItem sx={{ fontWeight: 600 }}>
                  No rewards found
                </RewardItem>
              </RewardsInfoBox>
            )}
            <a href={(totalRewardsNumber > 0 || !address) ? "https://app.applefarm.xyz/users" : "https://app.applefarm.xyz/opportunities"} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#4ade80' }}>
              <StyledButton>
                {(totalRewardsNumber > 0 || !address) ? "Claim Rewards" : "Supply to gain rewards"} <ArrowRightIcon size={16} />
              </StyledButton>
            </a>
          </Box>
        </ContentWrapper>
      </StyledCard>
    </div>
  );
}

function formatRewards(rewards: number) {
  if (rewards > 1000000) {
    return `${(rewards / 1000000).toFixed(2)}M`
  } else if (rewards > 1000) {
    return `${(rewards / 1000).toFixed(2)}K`
  } else if (rewards > 0 && rewards < 0.01) {
    return `<0.01`
  } else {
    return rewards.toFixed(2)
  }
}
