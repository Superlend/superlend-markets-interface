import { Box, Tooltip, Typography, CircularProgress, Divider, ClickAwayListener, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode, useState, useRef } from 'react';
import { hasMerklRewards, useMerklAprMap } from '../../hooks/useMerklAprMap';
import { FormattedNumber } from '../primitives/FormattedNumber';

interface MerklRewardsIndicatorProps {
  symbol: string;
  baseValue: number;
  isSupplyTab?: boolean;
  children: ReactNode;
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
      <Typography sx={(theme) => ({
        fontWeight: 600,
        color: theme.palette.mode === 'light' ? '#166534' : 'text.primary',
        mb: 1
      })}>
        Rate & Rewards
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 1, width: '100%' }}>
        <Typography sx={(theme) => ({
          color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'text.primary'
        })}>Base Rate</Typography>
        <Typography sx={(theme) => ({
          color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'text.primary'
        })}>
          <FormattedNumber compact value={baseRate} visibleDecimals={2} symbolsColor='text.white' />%
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 1, width: '100%' }}>
        <Typography sx={(theme) => ({
          color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'text.primary'
        })}>APR</Typography>
        <Typography sx={(theme) => ({
          color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'text.primary'
        })}>
          + <FormattedNumber compact value={apr} visibleDecimals={2} symbolsColor='text.white' />%
        </Typography>
      </Box>
      <Divider sx={(theme) => ({
        width: '100%',
        my: 1,
        borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'text.primary',
        opacity: 0.3
      })} />
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 1, width: '100%' }}>
        <Typography sx={(theme) => ({
          color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'text.primary'
        })}>
          Net APY
        </Typography>
        <Typography sx={(theme) => ({
          color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'text.primary'
        })}>
          <FormattedNumber compact value={netApy} visibleDecimals={2} symbolsColor='text.white' />%
        </Typography>
      </Box>
    </Box>
  );
}

export const MerklRewardsIndicator = ({ symbol, baseValue, isSupplyTab = false, children }: MerklRewardsIndicatorProps) => {
  const { aprMap, isLoading } = useMerklAprMap();
  const showRewards = hasMerklRewards(symbol) && isSupplyTab;
  const merklApr = showRewards ? (aprMap[symbol as keyof typeof aprMap] || 0) : 0;
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const iconRef = useRef<HTMLDivElement>(null);

  const handleTooltipToggle = (event: React.MouseEvent) => {
    // Stop propagation to prevent immediate clickaway
    event.stopPropagation();
    event.preventDefault();
    
    // Toggle tooltip visibility - always toggle regardless of device type
    setTooltipOpen(!tooltipOpen);
  };

  const handleTooltipClose = (event: Event | React.SyntheticEvent) => {
    // Check if the click was on the icon itself
    if (iconRef.current && iconRef.current.contains(event.target as Node)) {
      return; // Don't close if clicked on the icon itself
    }
    
    setTooltipOpen(false);
  };

  // For desktop hover
  const handleTooltipOpen = () => {
    setTooltipOpen(true);
  };

  // For desktop hover
  const handleMouseLeave = () => {
    if (!isMobile) {
      setTooltipOpen(false);
    }
  };

  // Use a simpler implementation that works on both desktop and mobile
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {children}
      {showRewards && (
        <>
          {isLoading ? (
            <CircularProgress size={18} />
          ) : (
            <ClickAwayListener onClickAway={handleTooltipClose}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Tooltip
                  title={getTooltipContentUI({
                    apr: merklApr,
                    baseRate: baseValue * 100,
                    netApy: (merklApr + (baseValue * 100)),
                  })}
                  arrow
                  placement="top"
                  open={tooltipOpen}
                  disableFocusListener
                  disableTouchListener
                  disableHoverListener
                  componentsProps={{
                    tooltip: {
                      sx: (theme) => ({
                        backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : '#1e293b',
                        '& .MuiTooltip-arrow': {
                          color: theme.palette.mode === 'light' ? '#ffffff' : '#1e293b',
                          '&::before': {
                            border: theme.palette.mode === 'light'
                              ? '1px solid rgba(0, 0, 0, 0.15)'
                              : 'none',
                          }
                        },
                        boxShadow: theme.palette.mode === 'light'
                          ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                          : 'none',
                        border: theme.palette.mode === 'light'
                          ? '1px solid rgba(0, 0, 0, 0.15)'
                          : 'none',
                        p: 0,
                      })
                    }
                  }}
                  PopperProps={{
                    disablePortal: false,
                    modifiers: [
                      {
                        name: 'preventOverflow',
                        enabled: true,
                        options: {
                          boundary: 'window',
                        },
                      },
                    ],
                  }}
                >
                  <Box 
                    component="span" 
                    ref={iconRef}
                    sx={{ 
                      display: 'inline-block',
                      cursor: 'pointer',
                      position: 'relative',
                      zIndex: 1,
                      padding: '8px', // Increased tap target for better mobile experience
                      margin: '-8px', // Offset padding to maintain visual spacing
                    }}
                    onClick={handleTooltipToggle}
                    onMouseEnter={isMobile ? undefined : handleTooltipOpen}
                    onMouseLeave={isMobile ? undefined : handleMouseLeave}
                  >
                    <img src={`/logos/apple-green.png`} alt={"Green Apple"} width={18} height={18} />
                  </Box>
                </Tooltip>
              </Box>
            </ClickAwayListener>
          )}
        </>
      )}
    </Box>
  );
};
