import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { RenFILToolTip } from 'src/components/infoTooltips/RenFILToolTip';
import { NoData } from 'src/components/primitives/NoData';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import { IncentivesCard } from '../../components/incentives/IncentivesCard';
import { AMPLToolTip } from '../../components/infoTooltips/AMPLToolTip';
import { ListColumn } from '../../components/lists/ListColumn';
import { ListItem } from '../../components/lists/ListItem';
import { FormattedNumber } from '../../components/primitives/FormattedNumber';
import { Link, ROUTES } from '../../components/primitives/Link';
import { TokenIcon } from '../../components/primitives/TokenIcon';
import { MerklRewardsIndicator } from '../../components/rewards/MerklRewardsIndicator';
import { ComputedReserveData } from '../../hooks/app-data-provider/useAppDataProvider';
import { hasMerklRewards, useMerklAprMap } from '@/hooks/useMerklAprMap';
import { SpkAirdropNoteInline } from '../dashboard/lists/BorrowAssetsList/BorrowAssetsListItem';
import { ListAPRColumn } from '../dashboard/lists/ListAPRColumn';
import { hasIntrinsicApy, useIntrinsicApy } from '@/hooks/useIntrinsicApy';

export const MarketAssetsListItem = ({ ...reserve }: ComputedReserveData) => {
  const router = useRouter();
  const { currentMarket } = useProtocolDataContext();
  const { aprMap, isLoading: isLoadingAppleApr } = useMerklAprMap();
  const { apyMap: intrinsicApyMap, isLoading: intrinsicApyLoading } = useIntrinsicApy();
  // const hasAppleRewards = hasMerklRewards(reserve.symbol);
  // Always show apple rewards in market list (it's always the supply tab)
  // const showAppleReward = hasAppleRewards;
  const showIntrinsicApy = hasIntrinsicApy(reserve.symbol);
  const intrinsicApyValue = showIntrinsicApy ? intrinsicApyMap[reserve.symbol as keyof typeof intrinsicApyMap] || 0 : 0;
  const hasRewards = hasMerklRewards(reserve.symbol) || hasIntrinsicApy(reserve.symbol);

  // If asset has Merkl rewards, use the APR value from Merkl divided by 100
  const displayValue = hasRewards
    ? (isLoadingAppleApr || intrinsicApyLoading)
      ? reserve.supplyAPY // Show base APY while loading
      : Number(aprMap[reserve.symbol as keyof typeof aprMap]) / 100 +
        Number(reserve.supplyAPY) +
        intrinsicApyValue / 100
    : reserve.supplyAPY;

  return (
    <ListItem
      px={6}
      minHeight={76}
      onClick={() => router.push(ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket))}
      sx={{ cursor: 'pointer' }}
      button
      data-cy={`marketListItemListItem_${reserve.symbol.toUpperCase()}`}
    >
      <ListColumn isRow maxWidth={280}>
        <TokenIcon symbol={reserve.iconSymbol} fontSize="large" />
        <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
          <Typography variant="h4" noWrap>
            {reserve.name?.toLowerCase()?.includes('stxtz') ?? false
              ? 'Stacy Staked XTZ'
              : reserve.name}
          </Typography>
          <Box
            sx={{
              p: { xs: '0', xsm: '3.625px 0px' },
            }}
          >
            <Typography variant="subheader2" color="text.muted" noWrap>
              {reserve.symbol}
            </Typography>
          </Box>
        </Box>
        {reserve.symbol === 'AMPL' && <AMPLToolTip />}
        {reserve.symbol === 'renFIL' && <RenFILToolTip />}
      </ListColumn>

      <ListColumn>
        <FormattedNumber
          compact
          value={reserve.totalLiquidity}
          variant="main16"
          symbolsColor="text.white"
        />
        <ReserveSubheader value={reserve.totalLiquidityUSD} />
      </ListColumn>

      <ListColumn>
        <MerklRewardsIndicator
          symbol={reserve.symbol}
          baseValue={Number(reserve.supplyAPY)}
          isSupplyTab={true}
        >
          <IncentivesCard
            value={displayValue}
            incentives={reserve.aIncentivesData || []}
            symbol={reserve.symbol}
            variant="main16"
            symbolsVariant="secondary16"
          />
        </MerklRewardsIndicator>
        {(reserve.symbol === 'ETH' || reserve.symbol === 'WETH') && (
          <SpkAirdropNoteInline tokenAmount={6} />
        )}
      </ListColumn>

      <ListColumn>
        {reserve.borrowingEnabled || Number(reserve.totalDebt) > 0 ? (
          <>
            <FormattedNumber
              compact
              value={reserve.totalDebt}
              variant="main16"
              symbolsColor="text.white"
            />{' '}
            <ReserveSubheader value={reserve.totalDebtUSD} />
          </>
        ) : (
          <NoData variant={'secondary14'} color="text.secondary" />
        )}
      </ListColumn>

      <ListAPRColumn
        value={parseFloat(
          Number(reserve.totalVariableDebtUSD) > 0 ? reserve.variableBorrowAPY : '-1'
        )}
        incentives={reserve.vIncentivesData || []}
        symbol={reserve.symbol}
        tooltip={
          reserve.symbol === 'DAI' ? (
            <Trans>
              This rate is set by MakerDAO Governance and will not change based on usage unless
              Maker needs to reclaim capital.
            </Trans>
          ) : null
        }
      >
        {!reserve.borrowingEnabled &&
          Number(reserve.totalVariableDebt) > 0 &&
          !reserve.isFrozen && <ReserveSubheader value={'Disabled'} />}
        {reserve.symbol === 'DAI' && <SpkAirdropNoteInline tokenAmount={24} />}
      </ListAPRColumn>

      <ListColumn maxWidth={95} minWidth={95} align="right">
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
        >
          <Trans>Details</Trans>
        </Button>
      </ListColumn>
    </ListItem>
  );
};