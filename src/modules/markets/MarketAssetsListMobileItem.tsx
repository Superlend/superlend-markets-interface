import { Trans } from '@lingui/macro';
import { Box, Button, Divider } from '@mui/material';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { NoData } from 'src/components/primitives/NoData';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import { MerklRewardsIndicator } from '@/components/rewards/MerklRewardsIndicator';
import { hasMerklRewards, useMerklAprMap } from '@/hooks/useMerklAprMap';

import { IncentivesCard } from '../../components/incentives/IncentivesCard';
import { FormattedNumber } from '../../components/primitives/FormattedNumber';
import { Link, ROUTES } from '../../components/primitives/Link';
import { Row } from '../../components/primitives/Row';
import { ComputedReserveData } from '../../hooks/app-data-provider/useAppDataProvider';
import { SpkAirdropNoteInline } from '../dashboard/lists/BorrowAssetsList/BorrowAssetsListItem';
import { ListMobileItemWrapper } from '../dashboard/lists/ListMobileItemWrapper';
import { hasIntrinsicApy, useIntrinsicApy } from '@/hooks/useIntrinsicApy';

export const MarketAssetsListMobileItem = ({ ...reserve }: ComputedReserveData) => {
  const { currentMarket } = useProtocolDataContext();
  const { aprMap, isLoading } = useMerklAprMap();
  const { apyMap: intrinsicApyMap, isLoading: intrinsicApyLoading } = useIntrinsicApy();
  // const hasAppleRewards = hasMerklRewards(reserve.symbol);
  // Always show apple rewards in market list (it's always the supply tab)
  // const showAppleReward = hasAppleRewards;
  const showIntrinsicApy = hasIntrinsicApy(reserve.symbol);
  const intrinsicApyValue = showIntrinsicApy ? intrinsicApyMap[reserve.symbol as keyof typeof intrinsicApyMap] || 0 : 0;
  const hasRewards = hasMerklRewards(reserve.symbol) || hasIntrinsicApy(reserve.symbol);
  // If asset has Merkl rewards, use the APR value from Merkl divided by 100
  const displayValue = hasRewards
    ? isLoading || intrinsicApyLoading
      ? reserve.supplyAPY // Show base APY while loading
      : (Number(aprMap[reserve.symbol as keyof typeof aprMap] || 0) / 100) +
        Number(reserve.supplyAPY || 0) +
        (Number(intrinsicApyValue) / 100)
    : reserve.supplyAPY;

  return (
    <ListMobileItemWrapper
      symbol={reserve.symbol}
      iconSymbol={reserve.iconSymbol}
      name={reserve.name}
      underlyingAsset={reserve.underlyingAsset}
      currentMarket={currentMarket}
    >
      <Row caption={<Trans>Total supplied</Trans>} captionVariant="description" mb={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-end' },
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <FormattedNumber
            compact
            value={reserve.totalLiquidity}
            variant="secondary14"
            symbolsColor="text.white"
          />
          <ReserveSubheader value={reserve.totalLiquidityUSD} rightAlign={true} />
        </Box>
      </Row>
      <Row
        caption={<Trans>Deposit APY</Trans>}
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <MerklRewardsIndicator
          symbol={reserve.symbol}
          baseValue={Number(reserve.supplyAPY)}
          isSupplyTab={true}
        >
          <IncentivesCard
            align="flex-end"
            value={displayValue}
            incentives={reserve.aIncentivesData || []}
            symbol={reserve.symbol}
            variant="secondary14"
          />
        </MerklRewardsIndicator>
      </Row>

      <Divider sx={{ mb: 3 }} />

      <Row caption={<Trans>Total borrowed</Trans>} captionVariant="description" mb={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-end' },
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {Number(reserve.totalDebt) > 0 ? (
            <>
              <FormattedNumber
                compact
                value={reserve.totalDebt}
                variant="secondary14"
                symbolsColor="text.white"
              />
              <ReserveSubheader value={reserve.totalDebtUSD} rightAlign={true} />
            </>
          ) : (
            <NoData variant={'secondary14'} color="text.secondary" />
          )}
        </Box>
      </Row>
      <Row
        caption={
          <VariableAPYTooltip
            text={<Trans>Borrow APY, variable</Trans>}
            key="APY_list_mob_variable_type"
            variant="description"
          />
        }
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <IncentivesCard
            align="flex-end"
            value={Number(reserve.totalVariableDebtUSD) > 0 ? reserve.variableBorrowAPY : '-1'}
            incentives={reserve.vIncentivesData || []}
            symbol={reserve.symbol}
            variant="secondary14"
          />
          {!reserve.borrowingEnabled &&
            Number(reserve.totalVariableDebt) > 0 &&
            !reserve.isFrozen && <ReserveSubheader value={'Disabled'} />}
        </Box>
      </Row>

      {reserve.symbol === 'DAI' && (
        <SpkAirdropNoteInline
          Wrapper={<Row caption="Airdrop" align="flex-start" captionVariant="description" mb={2} />}
          tokenAmount={24}
        />
      )}
      {(reserve.symbol === 'ETH' || reserve.symbol === 'WETH') && (
        <SpkAirdropNoteInline
          Wrapper={<Row caption="Airdrop" align="flex-start" captionVariant="description" mb={2} />}
          tokenAmount={6}
        />
      )}

      <Button
        variant="outlined"
        component={Link}
        href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
        fullWidth
      >
        <Trans>View details</Trans>
      </Button>
    </ListMobileItemWrapper>
  );
};
