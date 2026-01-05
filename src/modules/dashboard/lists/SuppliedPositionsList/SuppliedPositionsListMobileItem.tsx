import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';

import { MerklRewardsIndicator } from '@/components/rewards/MerklRewardsIndicator';
import { useHasMerklRewards, useMerklAprMap } from '@/hooks/useMerklAprMap';

import { IncentivesCard } from '../../../../components/incentives/IncentivesCard';
import { Row } from '../../../../components/primitives/Row';
import { useModalContext } from '../../../../hooks/useModal';
import { useProtocolDataContext } from '../../../../hooks/useProtocolDataContext';
import { isFeatureEnabled } from '../../../../utils/marketsAndNetworksConfig';
import { SpkAirdropNoteInline } from '../BorrowAssetsList/BorrowAssetsListItem';
import { ListItemUsedAsCollateral } from '../ListItemUsedAsCollateral';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueRow } from '../ListValueRow';
import { hasIntrinsicApy, useIntrinsicApy } from '@/hooks/useIntrinsicApy';

export const SuppliedPositionsListMobileItem = ({
  reserve,
  underlyingBalance,
  underlyingBalanceUSD,
  usageAsCollateralEnabledOnUser,
  underlyingAsset,
}: DashboardReserve) => {
  const { user } = useAppDataContext();
  const { currentMarketData, currentMarket } = useProtocolDataContext();
  const { openSupply, openSwap, openWithdraw, openCollateralChange } = useModalContext();
  const { debtCeiling } = useAssetCaps();
  const isSwapButton = isFeatureEnabled.liquiditySwap(currentMarketData);
  const { symbol, iconSymbol, name, supplyAPY, isIsolated, aIncentivesData, isFrozen, isActive } =
    reserve;
  const { aprMap, isLoading: isLoadingAppleApr } = useMerklAprMap();
  const { apyMap: intrinsicApyMap, isLoading: intrinsicApyLoading } = useIntrinsicApy();
  // const hasAppleRewards = hasMerklRewards(symbol);
  // const showAppleReward = hasAppleRewards;
  const showIntrinsicApy = hasIntrinsicApy(symbol);
  const intrinsicApyValue = showIntrinsicApy
    ? intrinsicApyMap[symbol as keyof typeof intrinsicApyMap] || 0
    : 0;
  const hasRewards = useHasMerklRewards(symbol) || hasIntrinsicApy(symbol);

  // If asset has Merkl rewards and we're on the supply tab, use the APR value
  const displayValue = hasRewards
    ? isLoadingAppleApr || intrinsicApyLoading
      ? Number(supplyAPY) // Show base supplyAPY while loading
      : Number(aprMap[symbol as keyof typeof aprMap] ?? 0) / 100 +
        Number(supplyAPY) +
        Number(intrinsicApyValue ?? 0) / 100
    : Number(supplyAPY);

  const canBeEnabledAsCollateral =
    !debtCeiling.isMaxed &&
    reserve.reserveLiquidationThreshold !== '0' &&
    ((!reserve.isIsolated && !user.isInIsolationMode) ||
      user.isolatedReserve?.underlyingAsset === reserve.underlyingAsset ||
      (reserve.isIsolated && user.totalCollateralMarketReferenceCurrency === '0'));

  return (
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      showSupplyCapTooltips
      showDebtCeilingTooltips
    >
      <ListValueRow
        title={<Trans>Deposit balance</Trans>}
        value={Number(underlyingBalance)}
        subValue={Number(underlyingBalanceUSD)}
        disabled={Number(underlyingBalance) === 0}
      />

      <Row
        caption={<Trans>Deposit APY</Trans>}
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <MerklRewardsIndicator symbol={symbol} baseValue={Number(supplyAPY)} isSupplyTab={true}>
          <IncentivesCard
            value={displayValue}
            incentives={aIncentivesData}
            symbol={symbol}
            variant="secondary14"
          />
        </MerklRewardsIndicator>
      </Row>
      {(reserve.symbol === 'ETH' || reserve.symbol === 'WETH') && (
        <SpkAirdropNoteInline
          tokenAmount={6}
          Wrapper={<Row caption="Airdrop" align="flex-start" captionVariant="description" mb={2} />}
        />
      )}

      <Row
        caption={<Trans>Used as collateral</Trans>}
        align={isIsolated ? 'flex-start' : 'center'}
        captionVariant="description"
        mb={2}
      >
        <ListItemUsedAsCollateral
          isIsolated={isIsolated}
          usageAsCollateralEnabledOnUser={usageAsCollateralEnabledOnUser}
          canBeEnabledAsCollateral={canBeEnabledAsCollateral}
          onToggleSwitch={() => openCollateralChange(underlyingAsset)}
        />
      </Row>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        <Button
          disabled={!isActive}
          variant="contained"
          onClick={() => openWithdraw(underlyingAsset)}
          sx={{ mr: 1.5 }}
          fullWidth
        >
          <Trans>Withdraw</Trans>
        </Button>

        {isSwapButton ? (
          <Button
            disabled={!isActive || isFrozen}
            variant="outlined"
            onClick={() => openSwap(underlyingAsset)}
            fullWidth
          >
            <Trans>Swap</Trans>
          </Button>
        ) : (
          <Button
            disabled={!isActive || isFrozen}
            variant="outlined"
            onClick={() => openSupply(underlyingAsset)}
            fullWidth
          >
            <Trans>Deposit</Trans>
          </Button>
        )}
      </Box>
    </ListMobileItemWrapper>
  );
};
