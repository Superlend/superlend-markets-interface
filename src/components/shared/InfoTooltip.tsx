import {
  Box,
  ClickAwayListener,
  Divider,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ReactNode, useRef, useState } from 'react';
import { FormattedNumber } from '../primitives/FormattedNumber';

interface InfoTooltipProps {
  title: string;
  children: ReactNode;
  tooltipContent: {
    title: string;
    items: Array<{
      label: string;
      value: number;
      icon?: ReactNode;
      showPlus?: boolean;
      showItem?: boolean;
    }>;
  };
  hasSeparatorBeforeLastItem?: boolean;
}

export const InfoTooltip = ({
  children,
  tooltipContent,
  hasSeparatorBeforeLastItem = true,
}: InfoTooltipProps) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const iconRef = useRef<HTMLDivElement>(null);

  const handleTooltipToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setTooltipOpen(!tooltipOpen);
  };

  const handleTooltipClose = (event: Event | React.SyntheticEvent) => {
    if (iconRef.current && iconRef.current.contains(event.target as Node)) {
      return;
    }
    setTooltipOpen(false);
  };

  const handleTooltipOpen = () => {
    setTooltipOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setTooltipOpen(false);
    }
  };

  const filteredTooltipContentItems = tooltipContent.items.filter((item) => item.showItem ?? true);

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Tooltip
          title={
            <Box
              sx={(theme) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                gap: 2,
                minWidth: 200,
                backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : 'inherit',
                p: 2,
                borderRadius: 1,
              })}
            >
              <Typography
                sx={(theme) => ({
                  fontWeight: 600,
                  color: theme.palette.mode === 'light' ? '#166534' : 'text.primary',
                  mb: 1,
                })}
              >
                {tooltipContent.title}
              </Typography>
              {filteredTooltipContentItems.map((item, index) => {
                const isLastItem = index === filteredTooltipContentItems.length - 1;
                return (
                  <>
                    {isLastItem && hasSeparatorBeforeLastItem && (
                      <Divider
                        sx={(theme) => ({
                          borderColor:
                            theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.8)' : '#e5e7eb',
                          width: '100%',
                          height: '0.1px',
                          borderWidth: '0.1px',
                        })}
                      />
                    )}
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        width: '100%',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {item.icon}
                        <Typography
                          sx={(theme) => ({
                            color:
                              theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'text.primary',
                          })}
                        >
                          {item.label}
                        </Typography>
                      </Box>
                      <Typography
                        sx={(theme) => ({
                          color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'text.primary',
                        })}
                      >
                        {item.showPlus && '+'}
                        <FormattedNumber
                          compact
                          value={item.value}
                          visibleDecimals={2}
                          symbolsColor="text.white"
                        />
                        %
                      </Typography>
                    </Box>
                  </>
                );
              })}
            </Box>
          }
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
                    border:
                      theme.palette.mode === 'light' ? '1px solid rgba(0, 0, 0, 0.15)' : 'none',
                  },
                },
                boxShadow:
                  theme.palette.mode === 'light'
                    ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                    : 'none',
                border: theme.palette.mode === 'light' ? '1px solid rgba(0, 0, 0, 0.15)' : 'none',
                p: 0,
              }),
            },
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
              padding: '8px',
              margin: '-8px',
            }}
            onClick={handleTooltipToggle}
            onMouseEnter={isMobile ? undefined : handleTooltipOpen}
            onMouseLeave={isMobile ? undefined : handleMouseLeave}
          >
            {children}
          </Box>
        </Tooltip>
      </Box>
    </ClickAwayListener>
  );
};
