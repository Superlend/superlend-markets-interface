import { Box, Tooltip, Typography, Divider, CircularProgress } from '@mui/material';
import { ReactNode } from 'react';
import { hasMerklRewards, useMerklAprMap } from '../../hooks/useMerklAprMap';

interface MerklRewardsIndicatorProps {
  symbol: string;
  baseValue: number;
  isSupplyTab?: boolean;
  children: ReactNode;
}

function formatLowestValue(value: number) {
  return (value > 0) && (value < 0.01) ? "<0.01" : value.toFixed(2);
}

function getTooltipContentUI({
  baseRate,
  apr,
  netApy,
}: {
  baseRate: number,
  apr: number,
  netApy: number,
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 1, minWidth: 200 }}>
      <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
        Rate & Rewards
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 1, width: '100%' }}>
        <Typography color="text.primary">Base Rate</Typography>
        <Typography color="text.primary">{formatLowestValue(baseRate)}%</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 1, width: '100%' }}>
        <Typography color="text.primary">APR</Typography>
        <Typography color="text.primary">+ {formatLowestValue(apr)}%</Typography>
      </Box>
      <Divider sx={{ width: '100%', my: 1, borderColor: 'text.primary', opacity: 0.3 }} />
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 1, width: '100%' }}>
        <Typography color="text.primary">Net APY</Typography>
        <Typography color="text.primary">{formatLowestValue(netApy)}%</Typography>
      </Box>
    </Box>
  );
}

export const MerklRewardsIndicator = ({ symbol, baseValue, isSupplyTab = false, children }: MerklRewardsIndicatorProps) => {
  const { aprMap, isLoading } = useMerklAprMap();
  const showRewards = hasMerklRewards(symbol) && isSupplyTab;
  const merklApr = showRewards ? (aprMap[symbol as keyof typeof aprMap] || 0) : 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {children}
      {showRewards && (
        <>
          {isLoading ? (
            <CircularProgress size={18} />
          ) : (
            <Tooltip
              title={getTooltipContentUI({
                baseRate: baseValue,
                apr: merklApr,
                netApy: merklApr + baseValue,
              })}
              arrow
              placement="top"
            >
              <img src={`/logos/apple-green.png`} alt={"Green Apple"} width={18} height={18} />
            </Tooltip>
          )}
        </>
      )}
    </Box>
  );
};
