import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';

import { ListColumn } from '../../../../components/lists/ListColumn';
import { useProtocolDataContext } from '../../../../hooks/useProtocolDataContext';
import { isFeatureEnabled } from '../../../../utils/marketsAndNetworksConfig';
import { SpkAirdropNoteInline } from '../BorrowAssetsList/BorrowAssetsListItem';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemUsedAsCollateral } from '../ListItemUsedAsCollateral';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';

export const SuppliedPositionsListItem = ({
  reserve,
  underlyingBalance,
  underlyingBalanceUSD,
  usageAsCollateralEnabledOnUser,
  underlyingAsset,
}: DashboardReserve) => {
  const { user } = useAppDataContext();
  const { isIsolated, aIncentivesData, isFrozen, isActive } = reserve;
  const { currentMarketData, currentMarket } = useProtocolDataContext();
  const { openSupply, openWithdraw, openCollateralChange, openSwap } = useModalContext();
  const { debtCeiling } = useAssetCaps();
  const isSwapButton = isFeatureEnabled.liquiditySwap(currentMarketData);

  const canBeEnabledAsCollateral =
    !debtCeiling.isMaxed &&
    reserve.reserveLiquidationThreshold !== '0' &&
    ((!reserve.isIsolated && !user.isInIsolationMode) ||
      user.isolatedReserve?.underlyingAsset === reserve.underlyingAsset ||
      (reserve.isIsolated && user.totalCollateralMarketReferenceCurrency === '0'));

  return (
    <ListItemWrapper
      symbol={reserve.symbol}
      iconSymbol={reserve.iconSymbol}
      name={reserve.name}
      detailsAddress={underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      data-cy={`dashboardSuppliedListItem_${reserve.symbol.toUpperCase()}_${
        canBeEnabledAsCollateral && usageAsCollateralEnabledOnUser ? 'Collateral' : 'NoCollateral'
      }`}
      showSupplyCapTooltips
      showDebtCeilingTooltips
    >
      <ListValueColumn
        symbol={reserve.iconSymbol}
        value={Number(underlyingBalance)}
        subValue={Number(underlyingBalanceUSD)}
        disabled={Number(underlyingBalance) === 0}
      />

      <ListAPRColumn
        value={Number(reserve.supplyAPY)}
        incentives={aIncentivesData}
        symbol={reserve.symbol}
        isSupplyTab={true}
      >
        {reserve.symbol === 'ETH' && <SpkAirdropNoteInline tokenAmount={6} />}
      </ListAPRColumn>

      <ListColumn>
        <ListItemUsedAsCollateral
          isIsolated={isIsolated}
          usageAsCollateralEnabledOnUser={usageAsCollateralEnabledOnUser}
          canBeEnabledAsCollateral={canBeEnabledAsCollateral}
          onToggleSwitch={() => openCollateralChange(underlyingAsset)}
          data-cy={`collateralStatus`}
        />
      </ListColumn>

      <ListButtonsColumn>
        <Button
          disabled={!isActive}
          variant="contained"
          onClick={() => openWithdraw(underlyingAsset)}
        >
          <Trans>Withdraw</Trans>
        </Button>

        {isSwapButton ? (
          <Button
            disabled={!isActive || isFrozen}
            variant="outlined"
            onClick={() => openSwap(underlyingAsset)}
            data-cy={`swapButton`}
          >
            <Trans>Swap</Trans>
          </Button>
        ) : (
          <Button
            disabled={!isActive || isFrozen}
            variant="outlined"
            onClick={() => openSupply(underlyingAsset)}
          >
            <Trans>Deposit</Trans>
          </Button>
        )}
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
