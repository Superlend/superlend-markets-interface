import { Box, CircularProgress } from '@mui/material';
import { ReactNode } from 'react';
import PercentIcon from '@mui/icons-material/Percent';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DiamondIcon from '@mui/icons-material/Diamond';
import { hasMerklRewards, useMerklAprMap } from '../../hooks/useMerklAprMap';
import { hasIntrinsicApy, useIntrinsicApy } from '../../hooks/useIntrinsicApy';
import { InfoTooltip } from '../shared/InfoTooltip';

interface MerklRewardsIndicatorProps {
  symbol: string;
  baseValue: number;
  isSupplyTab?: boolean;
  children: ReactNode;
}

export const MerklRewardsIndicator = ({
  symbol,
  baseValue,
  isSupplyTab = false,
  children,
}: MerklRewardsIndicatorProps) => {
  const { aprMap, isLoading: isLoadingAppleApr } = useMerklAprMap();
  const { apyMap: intrinsicApyMap, isLoading: isLoadingIntrinsicApy } = useIntrinsicApy();
  const showRewards = hasMerklRewards(symbol) && isSupplyTab;
  const merklApr = showRewards ? aprMap[symbol as keyof typeof aprMap] || 0 : 0;
  const showIntrinsicApy = hasIntrinsicApy(symbol) && isSupplyTab;
  const intrinsicApyValue = showIntrinsicApy
    ? intrinsicApyMap[symbol as keyof typeof intrinsicApyMap] || 0
    : 0;
  const shouldIncludeIntrinsicApy = Boolean(
    (symbol === 'mBASIS' || symbol === 'mTBILL') && intrinsicApyValue && intrinsicApyValue > 0
  );

  const tooltipItems = [
    {
      label: 'Base Rate',
      value: baseValue * 100,
      icon: (
        <PercentIcon
          sx={{
            fontSize: 16,
            color: (theme) => (theme.palette.mode === 'light' ? '#166534' : 'primary.main'),
          }}
        />
      ),
    },
    {
      label: 'APR',
      value: merklApr,
      icon: <img src="/logos/apple-green.png" alt="APR" width={16} height={16} />,
      showPlus: true,
      showItem: merklApr > 0,
    },
  ];

  if (shouldIncludeIntrinsicApy) {
    tooltipItems.push({
      label: 'Intrinsic APY',
      value: intrinsicApyValue,
      icon: (
        <DiamondIcon
          sx={{
            fontSize: 16,
            color: (theme) => (theme.palette.mode === 'light' ? '#8B5CF6' : '#A78BFA'),
          }}
        />
      ),
    });
  }

  tooltipItems.push({
    label: 'Net APY',
    value: merklApr + baseValue * 100 + (shouldIncludeIntrinsicApy ? intrinsicApyValue : 0),
    icon: (
      <TrendingUpIcon
        sx={{
          fontSize: 16,
          color: (theme) => (theme.palette.mode === 'light' ? '#166534' : 'primary.main'),
        }}
      />
    ),
  });

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {children}
      {(showIntrinsicApy || showRewards) && (
        <>
          {(isLoadingAppleApr || isLoadingIntrinsicApy) ? (
            <CircularProgress size={18} />
          ) : (
            <InfoTooltip
              title="Rate & Rewards"
              tooltipContent={{
                title: 'Rate & Rewards',
                items: tooltipItems,
              }}
            >
              {merklApr > 0 &&
                <img src="/logos/apple-green.png" alt="Green Apple" width={18} height={18} />
              }
              {(!merklApr && showIntrinsicApy) &&
                <DiamondIcon
                  sx={{
                    fontSize: 16,
                    color: (theme) => (theme.palette.mode === 'light' ? '#8B5CF6' : '#A78BFA'),
                  }}
                />}
            </InfoTooltip>
          )}
        </>
      )}
      {/* {(showRewards && !showIntrinsicApy) && (
        <>
          {isLoading || intrinsicApyLoading ? (
            <CircularProgress size={18} />
          ) : (
            <InfoTooltip
              title="Rate & Rewards"
              tooltipContentNode={
                <Box component="p" sx={{ fontSize: 14, fontWeight: 400, color: 'text.primary' }}>
                  Earn retroactive rewards by supplying XTZ (WXTZ)
                  <Link
                    href='https://x.com/etherlink/status/1945151432224862441?t=h3ADH9AyuHivPaQeSwbMvA&s=19'
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: 'text.primary',
                      textDecoration: 'underline',
                      ml: 1,
                    }}
                  >
                    Learn more
                  </Link>
                </Box>
              }
            >
              <img src="/logos/apple-green.png" alt="Green Apple" width={18} height={18} />
            </InfoTooltip>
          )}
        </>
      )} */}
    </Box>
  );
};