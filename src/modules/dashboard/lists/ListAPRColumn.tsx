import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Box, Tooltip } from '@mui/material';
import { ReactNode } from 'react';

import { hasMerklRewards, useMerklAprMap } from '@/hooks/useMerklAprMap';

import { IncentivesCard } from '../../../components/incentives/IncentivesCard';
import { ListColumn } from '../../../components/lists/ListColumn';
import { MerklRewardsIndicator } from '../../../components/rewards/MerklRewardsIndicator';
import { hasIntrinsicApy, useIntrinsicApy } from '@/hooks/useIntrinsicApy';

interface ListAPRColumnProps {
  value: number;
  incentives?: ReserveIncentiveResponse[];
  symbol: string;
  tooltip?: ReactNode;
  isSupplyTab?: boolean;
  children?: ReactNode;
}

export const ListAPRColumn = ({
  value,
  incentives,
  symbol,
  tooltip,
  isSupplyTab = false,
  children,
}: ListAPRColumnProps) => {
  const { aprMap, isLoading: isLoadingAppleApr } = useMerklAprMap();
  const { apyMap: intrinsicApyMap, isLoading: intrinsicApyLoading } = useIntrinsicApy();

  const showIntrinsicApy = hasIntrinsicApy(symbol) && isSupplyTab;
  const intrinsicApyValue = showIntrinsicApy
    ? Number(intrinsicApyMap[symbol as keyof typeof intrinsicApyMap] || 0) / 100
    : 0;
  const showMerklApy = isSupplyTab && hasMerklRewards(symbol);
  const merklApyValue = showMerklApy ? Number(aprMap[symbol as keyof typeof aprMap] || 0) / 100 : 0;
  const hasRewards = hasMerklRewards(symbol) || hasIntrinsicApy(symbol);

  // If asset has Merkl rewards and we're on the supply tab, use the APR value
  const displayValue = hasRewards
    ? isLoadingAppleApr || intrinsicApyLoading
      ? value // Show base value while loading
      : merklApyValue + value + intrinsicApyValue
    : value;

  return (
    <ListColumn>
      {tooltip != null ? (
        <Tooltip
          title={
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {tooltip}
            </Box>
          }
          arrow
          placement="top"
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IncentivesCard
              value={displayValue}
              incentives={incentives}
              symbol={symbol}
              data-cy={`apyType`}
            />
            <div style={{ paddingLeft: '3px' }}>*</div>
          </Box>
        </Tooltip>
      ) : (
        <MerklRewardsIndicator symbol={symbol} baseValue={value} isSupplyTab={isSupplyTab}>
          <IncentivesCard
            value={displayValue}
            incentives={incentives}
            symbol={symbol}
            data-cy={`apyType`}
          />
        </MerklRewardsIndicator>
      )}
      {children}
    </ListColumn>
  );
};