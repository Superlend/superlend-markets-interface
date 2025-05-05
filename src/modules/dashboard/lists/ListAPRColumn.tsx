import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Box, Tooltip } from '@mui/material';
import { ReactNode } from 'react';

import { hasMerklRewards, useMerklApyMap } from '@/hooks/useMerklApyMap';

import { IncentivesCard } from '../../../components/incentives/IncentivesCard';
import { ListColumn } from '../../../components/lists/ListColumn';
import { MerklRewardsIndicator } from '../../../components/rewards/MerklRewardsIndicator';

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
  const { apyMap, isLoading } = useMerklApyMap();
  const hasRewards = hasMerklRewards(symbol);
  const showAppleReward = hasRewards && isSupplyTab;

  // If asset has Merkl rewards and we're on the supply tab, use the APR value
  const displayValue = showAppleReward
    ? isLoading
      ? value // Show base value while loading
      : apyMap[symbol as keyof typeof apyMap] / 100 + value
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
