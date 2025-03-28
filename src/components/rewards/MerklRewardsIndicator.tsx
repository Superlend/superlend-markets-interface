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
  apr,
}: {
  apr: number,
}) {
  return (
    <Box sx={(theme) => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'start',
      gap: 1,
      minWidth: 200,
      backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : 'inherit',
      p: 2,
      borderRadius: 1,
    })}>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Typography>Score:</Typography>
        <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {apr.toFixed(2)}
          <img src={`/logos/apple-green.png`} alt={"Green Apple"} width={16} height={16} />
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        The Score factor indicates the proportion of daily Apples you receive relative to your contribution.{' '}
        <Typography
          component="a"
          href="https://app.applefarm.xyz/"
          target="_blank"
          rel="noopener noreferrer"
          variant="caption"
          sx={{ 
            color: 'primary.main', 
            cursor: 'pointer', 
            display: 'inline-flex', 
            alignItems: 'center',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          Know more <span style={{ marginLeft: '4px' }}>↗</span>
        </Typography>
      </Typography>
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
                apr: merklApr,
              })}
              arrow
              placement="top"
              componentsProps={{
                tooltip: {
                  sx: (theme) => ({
                    backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : '#1e293b',
                    '& .MuiTooltip-arrow': {
                      color: theme.palette.mode === 'light' ? '#ffffff' : '#1e293b',
                    },
                    boxShadow: theme.palette.mode === 'light'
                      ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                      : 'none',
                    p: 0,
                  })
                }
              }}
            >
              <img src={`/logos/apple-green.png`} alt={"Green Apple"} width={18} height={18} />
            </Tooltip>
          )}
        </>
      )}
    </Box>
  );
};
