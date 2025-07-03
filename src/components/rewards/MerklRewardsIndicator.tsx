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
  const { aprMap, isLoading } = useMerklAprMap();
  const { apyMap: intrinsicApyMap, isLoading: intrinsicApyLoading } = useIntrinsicApy();
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
      showPlus: true,
      showItem: true,
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
      {(showRewards || showIntrinsicApy) && (
        <>
          {isLoading || intrinsicApyLoading ? (
            <CircularProgress size={18} />
          ) : (
            <InfoTooltip
              title="Rate & Rewards"
              tooltipContent={{
                title: 'Rate & Rewards',
                items: tooltipItems,
              }}
            >
              <img src="/logos/apple-green.png" alt="Green Apple" width={18} height={18} />
            </InfoTooltip>
          )}
        </>
      )}
    </Box>
  );
};