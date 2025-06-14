import { ReserveDataHumanized } from '@aave/contract-helpers';
import {
  ComputedUserReserve,
  formatReservesAndIncentives,
  FormatUserSummaryAndIncentivesResponse,
  UserReserveData,
} from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import React, { useContext } from 'react';
import { EmodeCategory } from 'src/helpers/types';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

import {
  reserveSortFn,
  selectChi,
  selectCurrentBaseCurrencyData,
  selectCurrentReserves,
  selectCurrentUserEmodeCategoryId,
  selectCurrentUserReserves,
  selectDaiInDSR,
  selectDSR,
  selectEmodes,
  selectFormattedReserves,
  selectRealChi,
  selectRealDSR,
  selectRho,
  selectSDaiTotalAssets,
  selectTin,
  selectTout,
  selectUserSummaryAndIncentives,
} from '../../store/poolSelectors';
import { useCurrentTimestamp } from '../useCurrentTimestamp';
import { hasMerklRewards, useMerklAprMap } from '../useMerklAprMap';

/**
 * removes the marketPrefix from a symbol
 * @param symbol
 * @param prefix
 */
export const unPrefixSymbol = (symbol: string, prefix: string) => {
  return symbol.toUpperCase().replace(RegExp(`^(${prefix[0]}?${prefix.slice(1)})`), '');
};

export type ComputedReserveData = ReturnType<typeof formatReservesAndIncentives>[0] &
  ReserveDataHumanized & {
    iconSymbol: string;
    isEmodeEnabled: boolean;
    isWrappedBaseAsset: boolean;
  };

export type ComputedUserReserveData = ComputedUserReserve<ComputedReserveData>;

export type ExtendedFormattedUser = FormatUserSummaryAndIncentivesResponse<ComputedReserveData> & {
  earnedAPY: number;
  debtAPY: number;
  netAPY: number;
  netAPYWithRewards: number;
  isInEmode: boolean;
  userEmodeCategoryId: number;
};

export interface AppDataContextType {
  loading: boolean;
  reserves: ComputedReserveData[];
  eModes: Record<number, EmodeCategory>;
  // refreshPoolData?: () => Promise<void[]>;
  isUserHasDeposits: boolean;
  user: ExtendedFormattedUser;
  // refreshIncentives?: () => Promise<void>;
  // loading: boolean;

  marketReferencePriceInUsd: string;
  marketReferenceCurrencyDecimals: number;
  userReserves: UserReserveData[];
  dsr?: BigNumber;
  rho?: BigNumber;
  chi?: BigNumber;
  tin?: BigNumber;
  tout?: BigNumber;
  sDaiTotalAssets?: BigNumber;
  realChi?: BigNumber;
  realDSR?: BigNumber;
  daiInDSR?: BigNumber;
  basePriceInUsd: number;
}

const AppDataContext = React.createContext<AppDataContextType>({} as AppDataContextType);

/**
 * This is the only provider you'll ever need.
 * It fetches reserves /incentives & walletbalances & keeps them updated.
 */
export const AppDataProvider: React.FC = ({ children }) => {
  const currentTimestamp = useCurrentTimestamp(5);
  const { currentAccount } = useWeb3Context();
  const { aprMap } = useMerklAprMap();

  const [
    reserves,
    baseCurrencyData,
    userReserves,
    userEmodeCategoryId,
    eModes,
    dsr,
    chi,
    tin,
    tout,
    formattedPoolReserves,
    user,
    sDaiTotalAssets,
    rho,
    realChi,
    realDSR,
    daiInDSR,
  ] = useRootStore((state) => [
    selectCurrentReserves(state),
    selectCurrentBaseCurrencyData(state),
    selectCurrentUserReserves(state),
    selectCurrentUserEmodeCategoryId(state),
    selectEmodes(state),
    selectDSR(state),
    selectChi(state),
    selectTin(state),
    selectTout(state),
    selectFormattedReserves(state, currentTimestamp),
    selectUserSummaryAndIncentives(state, currentTimestamp),
    selectSDaiTotalAssets(state),
    selectRho(state),
    selectRealChi(state),
    selectRealDSR(state),
    selectDaiInDSR(state),
  ]);

  const proportions = user.userReservesData.reduce(
    (acc, value) => {
      const reserve = formattedPoolReserves.find(
        (r) => r.underlyingAsset === value.reserve.underlyingAsset
      );

      if (reserve) {
        let rewardApy = 0;
        if (hasMerklRewards(reserve.symbol)) {
          rewardApy = (aprMap[reserve.symbol as keyof typeof aprMap] ?? 0) / 100;
        }
        if (value.underlyingBalanceUSD !== '0') {
          acc.positiveProportion = acc.positiveProportion.plus(
            new BigNumber(reserve.supplyAPY).multipliedBy(value.underlyingBalanceUSD)
          );
          acc.positiveProportionWithRewards = acc.positiveProportionWithRewards.plus(
            new BigNumber(reserve.supplyAPY)
              .plus(rewardApy)
              .multipliedBy(value.underlyingBalanceUSD)
          );
          if (reserve.aIncentivesData) {
            reserve.aIncentivesData.forEach((incentive) => {
              acc.positiveProportion = acc.positiveProportion.plus(
                new BigNumber(incentive.incentiveAPR).multipliedBy(value.underlyingBalanceUSD)
              );
            });
          }
        }
        if (value.variableBorrowsUSD !== '0') {
          acc.negativeProportion = acc.negativeProportion.plus(
            new BigNumber(reserve.variableBorrowAPY).multipliedBy(value.variableBorrowsUSD)
          );
          if (reserve.vIncentivesData) {
            reserve.vIncentivesData.forEach((incentive) => {
              acc.positiveProportion = acc.positiveProportion.plus(
                new BigNumber(incentive.incentiveAPR).multipliedBy(value.variableBorrowsUSD)
              );
            });
          }
        }
        if (value.stableBorrowsUSD !== '0') {
          acc.negativeProportion = acc.negativeProportion.plus(
            new BigNumber(value.stableBorrowAPY).multipliedBy(value.stableBorrowsUSD)
          );
          if (reserve.sIncentivesData) {
            reserve.sIncentivesData.forEach((incentive) => {
              acc.positiveProportion = acc.positiveProportion.plus(
                new BigNumber(incentive.incentiveAPR).multipliedBy(value.stableBorrowsUSD)
              );
            });
          }
        }
      } else {
        throw new Error('no possible to calculate net apy');
      }

      return acc;
    },
    {
      positiveProportion: new BigNumber(0),
      negativeProportion: new BigNumber(0),
      positiveProportionWithRewards: new BigNumber(0),
    }
  );

  const isUserHasDeposits = user.userReservesData.some(
    (userReserve) => userReserve.scaledATokenBalance !== '0'
  );

  const earnedAPY = proportions.positiveProportion.dividedBy(user.totalLiquidityUSD).toNumber();
  const earnedAPYWithRewards = proportions.positiveProportionWithRewards
    .dividedBy(user.totalLiquidityUSD)
    .toNumber();
  const debtAPY = proportions.negativeProportion.dividedBy(user.totalBorrowsUSD).toNumber();
  const netAPY =
    (earnedAPY || 0) *
      (Number(user.totalLiquidityUSD) / Number(user.netWorthUSD !== '0' ? user.netWorthUSD : '1')) -
    (debtAPY || 0) *
      (Number(user.totalBorrowsUSD) / Number(user.netWorthUSD !== '0' ? user.netWorthUSD : '1'));
  const netAPYWithRewards =
    (earnedAPYWithRewards || 0) *
      (Number(user.totalLiquidityUSD) / Number(user.netWorthUSD !== '0' ? user.netWorthUSD : '1')) -
    (debtAPY || 0) *
      (Number(user.totalBorrowsUSD) / Number(user.netWorthUSD !== '0' ? user.netWorthUSD : '1'));

  return (
    <AppDataContext.Provider
      value={{
        loading: !reserves.length || (!!currentAccount && userReserves === undefined),
        reserves: formattedPoolReserves,
        eModes,
        user: {
          ...user,
          userEmodeCategoryId,
          isInEmode: userEmodeCategoryId !== 0,
          userReservesData: user.userReservesData.sort((a, b) =>
            reserveSortFn(a.reserve, b.reserve)
          ),
          earnedAPY,
          debtAPY,
          netAPY,
          netAPYWithRewards,
        },
        userReserves,
        isUserHasDeposits,
        marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
        dsr,
        chi,
        tin,
        tout,
        sDaiTotalAssets,
        rho,
        realChi,
        realDSR,
        daiInDSR,
        basePriceInUsd:
          parseFloat(baseCurrencyData.networkBaseTokenPriceInUsd) /
          Math.pow(10, baseCurrencyData.networkBaseTokenPriceDecimals),
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppDataContext = () => useContext(AppDataContext);
