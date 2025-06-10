import { normalize, UserIncentiveData, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  useMediaQuery,
  useTheme,
  Tooltip,
  Typography,
  ClickAwayListener,
} from '@mui/material';
import * as React from 'react';
import { useState, useRef } from 'react';
import { PageTitle } from 'src/components/TopInfoPanel/PageTitle';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { usePoolDataV2Subscription } from 'src/store/root';
import { ChainId } from 'src/ui-config/networksConfig';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import ClaimGiftIcon from '../../../public/icons/markets/claim-gift-icon.svg';
import EmptyHeartIcon from '../../../public/icons/markets/empty-heart-icon.svg';
import NetAPYIcon from '../../../public/icons/markets/net-apy-icon.svg';
import WalletIcon from '../../../public/icons/markets/wallet-icon.svg';
// TODO: need change icon
// import HfEmpty from '/public/icons/healthFactor/hfEmpty.svg';
// import HfFull from '/public/icons/healthFactor/hfFull.svg';
// import HfLow from '/public/icons/healthFactor/hfLow.svg';
// import HfMiddle from '/public/icons/healthFactor/hfMiddle.svg';
import HALLink from '../../components/HALLink';
import { HealthFactorNumber } from '../../components/HealthFactorNumber';
import { FormattedNumber } from '../../components/primitives/FormattedNumber';
import { NoData } from '../../components/primitives/NoData';
import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import { useAppDataContext } from '../../hooks/app-data-provider/useAppDataProvider';
import { LiquidationRiskParametresInfoModal } from './LiquidationRiskParametresModal/LiquidationRiskParametresModal';

function getNetAPYTooltipContentUI({
  netAPY,
  netAPYWithRewards,
}: {
  netAPY: number;
  netAPYWithRewards: number;
}) {
  const rewardAPY = netAPYWithRewards - netAPY;
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        gap: 1,
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
        Net APY Details
      </Typography>
      <Box
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
          <TrendingUpIcon
            sx={{
              fontSize: 16,
              color: (theme) => (theme.palette.mode === 'light' ? '#166534' : 'primary.main'),
            }}
          />
          <Typography
            sx={(theme) => ({
              color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'text.primary',
            })}
          >
            Base APY
          </Typography>
        </Box>
        <Typography
          sx={(theme) => ({
            color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'text.primary',
          })}
        >
          <FormattedNumber compact value={netAPY} visibleDecimals={2} symbolsColor="text.white" />%
        </Typography>
      </Box>
      <Box
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
          <img src="/logos/apple-green.png" alt="APR" width={16} height={16} />
          <Typography
            sx={(theme) => ({
              color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'text.primary',
            })}
          >
            Rewards APY
          </Typography>
        </Box>
        <Typography
          sx={(theme) => ({
            color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'text.primary',
          })}
        >
          <FormattedNumber
            compact
            value={rewardAPY}
            visibleDecimals={2}
            symbolsColor="text.white"
          />
          %
        </Typography>
      </Box>
    </Box>
  );
}

export const DashboardTopPanel = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const { openClaimRewards } = useModalContext();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  usePoolDataV2Subscription();
  const { currentNetworkConfig, currentMarketData } = useProtocolDataContext();
  const { user, reserves, loading } = useAppDataContext();
  const { currentAccount } = useWeb3Context();
  const isRewardsPresent = user ? user?.netAPYWithRewards > user?.netAPY : false;

  const { claimableRewardsUsd } = Object.keys(user.calculatedUserIncentives).reduce(
    (acc, rewardTokenAddress) => {
      const incentive: UserIncentiveData = user.calculatedUserIncentives[rewardTokenAddress];
      const rewardBalance = normalize(incentive.claimableRewards, incentive.rewardTokenDecimals);

      let tokenPrice = 0;
      // getting price from reserves for the native rewards for v2 markets
      if (!currentMarketData.v3 && Number(rewardBalance) > 0) {
        if (currentMarketData.chainId === ChainId.mainnet) {
          const aave = reserves.find((reserve) => reserve.symbol === 'AAVE');
          tokenPrice = aave ? Number(aave.priceInUSD) : 0;
        } else {
          reserves.forEach((reserve) => {
            if (reserve.symbol === currentNetworkConfig.wrappedBaseAssetSymbol) {
              tokenPrice = Number(reserve.priceInUSD);
            }
          });
        }
      } else {
        tokenPrice = Number(incentive.rewardPriceFeed);
      }

      const rewardBalanceUsd = Number(rewardBalance) * tokenPrice;

      if (rewardBalanceUsd > 0) {
        if (acc.assets.indexOf(incentive.rewardTokenSymbol) === -1) {
          acc.assets.push(incentive.rewardTokenSymbol);
        }

        acc.claimableRewardsUsd += Number(rewardBalanceUsd);
      }

      return acc;
    },
    { claimableRewardsUsd: 0, assets: [] } as { claimableRewardsUsd: number; assets: string[] }
  );

  const loanToValue =
    user?.totalCollateralMarketReferenceCurrency === '0'
      ? '0'
      : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || '0')
          .dividedBy(user?.totalCollateralMarketReferenceCurrency || '1')
          .toFixed();

  const valueTypographyVariant = isMobile ? 'main16' : 'main21';
  const noDataTypographyVariant = isMobile ? 'secondary16' : 'secondary21';

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

  return (
    <>
      <TopInfoPanel
        titleComponent={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PageTitle
              pageTitle={<Trans>Dashboard</Trans>}
              withMarketSwitcher={true}
              bridge={currentNetworkConfig.bridge}
            />
          </Box>
        }
      >
        <TopInfoPanelItem icon={<WalletIcon />} title={<Trans>Net worth</Trans>} loading={loading}>
          {currentAccount ? (
            <FormattedNumber
              value={Number(user?.netWorthUSD || 0)}
              symbol="USD"
              variant={valueTypographyVariant}
              visibleDecimals={2}
              compact
              symbolsColor="#A5A8B6"
              symbolsVariant={noDataTypographyVariant}
            />
          ) : (
            <NoData variant={noDataTypographyVariant} sx={{ opacity: '0.7' }} />
          )}
        </TopInfoPanelItem>

        <TopInfoPanelItem
          icon={<NetAPYIcon />}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trans>Net APY</Trans>
              {isRewardsPresent && (
                <ClickAwayListener onClickAway={handleTooltipClose}>
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Tooltip
                      title={getNetAPYTooltipContentUI({
                        netAPY: user.netAPY * 100,
                        netAPYWithRewards: user.netAPYWithRewards * 100,
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
                                border:
                                  theme.palette.mode === 'light'
                                    ? '1px solid rgba(0, 0, 0, 0.15)'
                                    : 'none',
                              },
                            },
                            boxShadow:
                              theme.palette.mode === 'light'
                                ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                : 'none',
                            border:
                              theme.palette.mode === 'light'
                                ? '1px solid rgba(0, 0, 0, 0.15)'
                                : 'none',
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
                        <img
                          src="/logos/apple-green.png"
                          alt="Green Apple"
                          width={18}
                          height={18}
                        />
                      </Box>
                    </Tooltip>
                  </Box>
                </ClickAwayListener>
              )}
            </div>
          }
          loading={loading}
        >
          {currentAccount && Number(user?.netWorthUSD) > 0 ? (
            <FormattedNumber
              value={user.netAPYWithRewards}
              variant={valueTypographyVariant}
              visibleDecimals={2}
              percent
              symbolsColor="#A5A8B6"
              symbolsVariant={noDataTypographyVariant}
            />
          ) : (
            <NoData variant={noDataTypographyVariant} sx={{ opacity: '0.7' }} />
          )}
        </TopInfoPanelItem>

        {currentAccount && user?.healthFactor !== '-1' && (
          <TopInfoPanelItem
            icon={<EmptyHeartIcon />}
            title={
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Trans>Health factor</Trans>
              </Box>
            }
            // TODO: need change icon
            // icon={
            //   <SvgIcon sx={{ fontSize: '24px' }}>
            //     {+user.healthFactor >= 10 && <HfFull />}
            //     {+user.healthFactor < 10 && +user.healthFactor >= 3 && <HfMiddle />}
            //     {+user.healthFactor < 3 && +user.healthFactor >= 1 && <HfLow />}
            //     {+user.healthFactor < 1 && <HfEmpty />}
            //   </SvgIcon>
            // }
            loading={loading}
          >
            <HealthFactorNumber
              value={user?.healthFactor || '-1'}
              variant={valueTypographyVariant}
              onInfoClick={() => setOpen(true)}
              HALIntegrationComponent={
                currentMarketData.halIntegration && (
                  <HALLink
                    healthFactor={user?.healthFactor || '-1'}
                    marketName={currentMarketData.halIntegration.marketName}
                    integrationURL={currentMarketData.halIntegration.URL}
                  />
                )
              }
            />
          </TopInfoPanelItem>
        )}

        {currentAccount && claimableRewardsUsd > 0 && (
          <TopInfoPanelItem
            title={<Trans>Available rewards</Trans>}
            icon={<ClaimGiftIcon />}
            loading={loading}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', xsm: 'center' },
                flexDirection: { xs: 'column', xsm: 'row' },
              }}
            >
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }} data-cy={'Claim_Box'}>
                <FormattedNumber
                  value={claimableRewardsUsd}
                  variant={valueTypographyVariant}
                  visibleDecimals={2}
                  compact
                  symbol="USD"
                  symbolsColor="#A5A8B6"
                  symbolsVariant={noDataTypographyVariant}
                  data-cy={'Claim_Value'}
                />
              </Box>

              <Button
                variant="gradient"
                size="small"
                onClick={() => openClaimRewards()}
                sx={{ minWidth: 'unset', ml: { xs: 0, xsm: 2 } }}
                data-cy={'Dashboard_Claim_Button'}
              >
                <Trans>Claim</Trans>
              </Button>
            </Box>
          </TopInfoPanelItem>
        )}
      </TopInfoPanel>

      <LiquidationRiskParametresInfoModal
        open={open}
        setOpen={setOpen}
        healthFactor={user?.healthFactor || '-1'}
        loanToValue={loanToValue}
        currentLoanToValue={user?.currentLoanToValue || '0'}
        currentLiquidationThreshold={user?.currentLiquidationThreshold || '0'}
      />
    </>
  );
};
