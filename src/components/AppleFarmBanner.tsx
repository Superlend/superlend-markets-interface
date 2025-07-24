import { BigNumber } from '@ethersproject/bignumber';
import { Box, Card as MuiCard, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowRightIcon } from 'lucide-react';
import React from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import ImageWithDefault from '@/components/ImageWithDefault';
import { useMerklUserRewards } from '@/hooks/useMerklUserRewards';
import { FormattedNumber } from './primitives/FormattedNumber';

const StyledCard = styled(MuiCard)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  background:
    theme.palette.mode === 'light'
      ? 'linear-gradient(to right, rgba(240, 253, 244, 1), rgba(187, 247, 208, 0.3))'
      : 'linear-gradient(to right, rgba(22, 163, 74, 0.1), rgba(22, 163, 74, 0.05))',
  // cursor: 'pointer',
  borderRadius: '1.125rem',
  transition: 'all 0.3s ease',
  border:
    theme.palette.mode === 'light'
      ? '1px solid rgba(22, 163, 74, 0.15)'
      : '1px solid rgba(22, 163, 74, 0.2)',
  boxShadow:
    theme.palette.mode === 'light'
      ? '0 0 10px rgba(22, 163, 74, 0.05)'
      : '0 0 10px rgba(22, 163, 74, 0.1)',
  '&:hover': {
    boxShadow:
      theme.palette.mode === 'light'
        ? '0 0 20px rgba(22, 163, 74, 0.1)'
        : '0 0 20px rgba(22, 163, 74, 0.2)',
    border:
      theme.palette.mode === 'light'
        ? '1px solid rgba(22, 163, 74, 0.25)'
        : '1px solid rgba(22, 163, 74, 0.4)',
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

// const RewardsText = styled(Box)(({ theme }) => ({
//   display: 'flex',
//   alignItems: 'center',
//   gap: '8px',
//   color: theme.palette.mode === 'light' ? '#15803d' : '#4ade80',
//   fontWeight: 600,
//   '& svg': {
//     transition: 'transform 0.2s ease',
//   },
//   '&:hover svg': {
//     transform: 'translateX(4px)',
//   },
// }));

const RewardsInfoBox = styled(Box)({
  display: 'flex',
  // flexDirection: 'column',
  // alignItems: 'flex-end',
  gap: '8px',
  // marginTop: '12px',
  textTransform: 'capitalize',
});

const RewardItem = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontWeight: 600,
  textTransform: 'capitalize',
}));

const StyledButton = styled('button')(({ theme }) => ({
  background: theme.palette.mode === 'light' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(22, 163, 74, 0.1)',
  border:
    theme.palette.mode === 'light'
      ? '1px solid rgba(22, 163, 74, 0.2)'
      : '1px solid rgba(22, 163, 74, 0.3)',
  borderRadius: '0.75rem',
  padding: '10px 20px',
  color: theme.palette.mode === 'light' ? '#15803d' : '#4ade80',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  textTransform: 'capitalize',
  '&:hover': {
    background:
      theme.palette.mode === 'light' ? 'rgba(22, 163, 74, 0.15)' : 'rgba(22, 163, 74, 0.2)',
    border:
      theme.palette.mode === 'light'
        ? '1px solid rgba(22, 163, 74, 0.3)'
        : '1px solid rgba(22, 163, 74, 0.5)',
    transform: 'translateY(-2px)',
  },
}));

export default function AppleFarmBanner() {
  const theme = useTheme();
  const { currentAccount: address } = useWeb3Context();
  const { userRewards, loading } = useMerklUserRewards(address || '', 42793);

  const totalRewards = BigNumber.from(userRewards?.[0]?.rewards?.[0]?.amount ?? '0').div(
    BigNumber.from(10).pow(18)
  );
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
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'start',
                  gap: '5px',
                }}
              >
                <Typography
                  component="h2"
                  sx={{
                    fontSize: '1.125rem',
                    lineHeight: 1.75,
                    fontWeight: 600,
                    color: theme.palette.mode === 'light' ? '#166534' : '#ffffff',
                  }}
                >
                  Apple Farm is live on Etherlink!
                </Typography>
                {/* <a
                  href="https://app.applefarm.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: '#4ade80' }}
                >
                  <RewardsText>
                    Season Two Rewards: ********
                    <ArrowRightIcon size={16} />
                  </RewardsText>
                </a> */}
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
            {loading && <RewardItem>Loading rewards...</RewardItem>}
            {!loading && address && totalRewardsNumber > 0 && (
              <RewardsInfoBox>
                <RewardItem
                  sx={{
                    color: theme.palette.mode === 'light' ? '#15803d' : '#4ade80',
                    fontWeight: 600,
                  }}
                >
                  Your Available Rewards:
                </RewardItem>
                <RewardItem>
                  <FormattedNumber value={totalRewardsNumber} visibleDecimals={2} />
                </RewardItem>
              </RewardsInfoBox>
            )}
            {!loading && address && totalRewardsNumber === 0 && (
              <RewardsInfoBox>
                <RewardItem sx={{ fontWeight: 600 }}>No rewards found</RewardItem>
              </RewardsInfoBox>
            )}
            <a
              // href={
              //   (totalRewardsNumber > 0 || !address)
              //     ? 'https://app.applefarm.xyz'
              //     : 'https://app.applefarm.xyz'
              // }
              href="https://app.applefarm.xyz"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: '#4ade80' }}
            >
              <StyledButton>
                {/* {totalRewardsNumber > 0 || !address ? 'Claim Rewards' : 'Supply to gain rewards'}{' '} */}
                Learn More
                <ArrowRightIcon size={16} />
              </StyledButton>
            </a>
          </Box>
        </ContentWrapper>
      </StyledCard>
    </div>
  );
}
