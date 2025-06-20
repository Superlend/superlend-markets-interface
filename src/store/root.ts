// import { V3FaucetService } from '@aave/contract-helpers';
import { enableMapSet } from 'immer';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { ENABLE_TESTNET, STAGING_ENV } from 'src/utils/marketsAndNetworksConfig';
import create from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import { createGovernanceSlice, GovernanceSlice } from './governanceSlice';
import { createIncentiveSlice, IncentiveSlice } from './incentiveSlice';
import { createIntrinsicApySlice, IntrinsicApySlice } from './intrinsicApySlice';
import { createMerklRewardsSlice, MerklRewardsSlice } from './merklRewardsSlice';
import { createPoolSlice, PoolSlice } from './poolSlice';
import { createProtocolDataSlice, ProtocolDataSlice } from './protocolDataSlice';
import { createStakeSlice, StakeSlice } from './stakeSlice';
import { createSingletonSubscriber } from './utils/createSingletonSubscriber';
import { getQueryParameter } from './utils/queryParams';
import { createV3MigrationSlice, V3MigrationSlice } from './v3MigrationSlice';
import { createWalletSlice, WalletSlice } from './walletSlice';

enableMapSet();

export type RootStore = StakeSlice &
  ProtocolDataSlice &
  WalletSlice &
  PoolSlice &
  IncentiveSlice &
  GovernanceSlice &
  V3MigrationSlice &
  MerklRewardsSlice &
  IntrinsicApySlice;

export const useRootStore = create<RootStore>()(
  subscribeWithSelector(
    devtools((...args) => {
      return {
        ...createStakeSlice(...args),
        ...createProtocolDataSlice(...args),
        ...createWalletSlice(...args),
        ...createPoolSlice(...args),
        ...createIncentiveSlice(...args),
        ...createGovernanceSlice(...args),
        ...createV3MigrationSlice(...args),
        ...createMerklRewardsSlice(...args),
        ...createIntrinsicApySlice(...args),
      };
    })
  )
);

// hydrate state from localeStorage to not break on ssr issues
if (typeof document !== 'undefined') {
  document.onreadystatechange = function () {
    if (document.readyState == 'complete') {
      const selectedMarket =
        getQueryParameter('marketName') || localStorage.getItem('selectedMarket');

      if (selectedMarket) {
        const currentMarket = useRootStore.getState().currentMarket;
        const setCurrentMarket = useRootStore.getState().setCurrentMarket;
        if (selectedMarket !== currentMarket) {
          setCurrentMarket(selectedMarket as CustomMarket, true);
        }
      }
    }
  };
}

export const useStakeDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refetchStakeData();
}, 30000);

export const useWalletBalancesSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refetchWalletBalances();
}, 30000);

export const usePoolDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshPoolData();
}, 30000);

export const usePoolDataV3Subscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshPoolV3Data();
}, 30000);

export const usePoolDataV2Subscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshPoolV2Data();
}, 30000);

export const useIncentiveDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshIncentiveData();
}, 30000);

export const useGovernanceDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshGovernanceData();
}, 30000);

export const useMerklRewardsSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().fetchMerklRewards();
}, 5 * 60 * 1000); // Refresh every 5 minutes

export const useIntrinsicApySubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().fetchIntrinsicApy();
}, 5 * 60 * 1000); // Refresh every 5 minutes

// let latest: V3FaucetService;
useRootStore.subscribe(
  (state) => state.currentMarketData,
  async (selected) => {
    const { setIsFaucetPermissioned: setFaucetPermissioned } = useRootStore.getState();
    if (ENABLE_TESTNET || STAGING_ENV) {
      if (!selected.v3) {
        setFaucetPermissioned(false);
        return;
      }

      // If there are multiple calls in flight, we only want to use the result from the latest one.
      // Use the instance of the service to check if it's the latest one since it is recreated
      // everytime this subscription fires.
      // const service = new V3FaucetService(jsonRpcProvider(), selected.addresses.FAUCET);
      // latest = service;
      // service
      //   .isPermissioned()
      //   .then((isPermissioned) => {
      //     if (latest === service) {
      //       setFaucetPermissioned(isPermissioned);
      //     }
      //   })
      //   .catch((e) => {
      //     console.error('error checking faucet permission', e);
      //     setFaucetPermissioned(false);
      //   });
    } else {
      setFaucetPermissioned(false);
    }
  },
  { fireImmediately: true }
);

// Initialize Merkl rewards data
useRootStore.getState().fetchMerklRewards();

// Initialize Intrinsic APY data
useRootStore.getState().fetchIntrinsicApy();
