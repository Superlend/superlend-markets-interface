import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import * as React from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ListItem } from 'src/components/lists/ListItem';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useFaucetCall } from 'src/hooks/useFaucetCall';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { FaucetItemLoader } from './FaucetItemLoader';
import { FaucetMobileItemLoader } from './FaucetMobileItemLoader';

export default function FaucetAssetsList() {
  const { reserves, loading } = useAppDataContext();
  const { walletBalances } = useWalletBalances();
  const { currentAccount, loading: web3Loading } = useWeb3Context();
  const { currentMarket } = useProtocolDataContext();
  const { makeFaucetCall, isLoading, isError, data } = useFaucetCall();

  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const listData = reserves
    .filter((reserve) => !reserve.isWrappedBaseAsset && !reserve.isFrozen)
    .map((reserve) => {
      const walletBalance = valueToBigNumber(
        walletBalances[reserve.underlyingAsset]?.amount || '0'
      );
      return {
        ...reserve,
        walletBalance,
      };
    });

  if (!currentAccount || web3Loading) {
    return (
      <ConnectWalletPaper
        loading={web3Loading}
        description={<Trans>Please connect your wallet to get free testnet assets.</Trans>}
      />
    );
  }

  return (
    <ListWrapper
      titleComponent={
        <>
          <Typography component="div" variant="h2" sx={{ mr: 4 }}>
            <Trans>Test Assets</Trans>
          </Typography>
        </>
      }
    >
      <Box
        px={downToXSM ? 4 : 6}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div>
          Use{' '}
          <Link
            href="https://faucet.etherlink.com/"
            sx={{ textDecoration: 'underline' }}
            variant="caption"
            color="text.secondary"
          >
            Etherlink Faucet
          </Link>{' '}
          to request testnet xtz. With that you can borrow USDT or any other available asset.
        </div>

        {isLoading ? (
          <Button
            variant="gradient"
            disabled={true}
            sx={{
              marginY: '0.5rem',
              width: '11rem',
            }}
          >
            <Trans>
              <CircularProgress sx={{ color: 'black' }} size="1.5rem" />
            </Trans>
          </Button>
        ) : loading ? (
          <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
            <Skeleton width={100} height={24} />
          </Box>
        ) : data ? (
          <Button
            variant="gradient"
            disabled={true}
            sx={{
              marginY: '0.5rem',
              width: '11rem',
            }}
          >
            <Box sx={{ color: 'black' }}>Claimed </Box>
          </Button>
        ) : (
          <Button
            variant="gradient"
            onClick={() => makeFaucetCall(currentAccount)}
            sx={{
              marginY: '0.5rem',
              width: '11rem',
            }}
          >
            <Trans>Claim Testnet Tokens</Trans>
          </Button>
        )}
      </Box>

      <Box
        px={downToXSM ? 4 : 6}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div>
          {!isLoading && data ? (
            <Box color={'success.main'}>
              Succesfully claimed testnet tokens. It will reflect in your balance soon !
            </Box>
          ) : isError ? (
            <Box color={'error.main'}>Failed to claim testnet tokens. Please try again !</Box>
          ) : (
            ''
          )}
        </div>
      </Box>

      <ListHeaderWrapper px={downToXSM ? 4 : 6}>
        <ListColumn isRow maxWidth={280}>
          <ListHeaderTitle>
            <Trans>Asset</Trans>
          </ListHeaderTitle>
        </ListColumn>

        {!downToXSM && (
          <ListColumn>
            <ListHeaderTitle>
              <Trans>Wallet balance</Trans>
            </ListHeaderTitle>
          </ListColumn>
        )}
      </ListHeaderWrapper>

      {loading ? (
        downToXSM ? (
          <>
            <FaucetMobileItemLoader />
            <FaucetMobileItemLoader />
            <FaucetMobileItemLoader />
          </>
        ) : (
          <>
            <FaucetItemLoader />
            <FaucetItemLoader />
            <FaucetItemLoader />
            <FaucetItemLoader />
            <FaucetItemLoader />
          </>
        )
      ) : (
        listData.map((reserve) => (
          <ListItem px={downToXSM ? 4 : 6} key={reserve.symbol}>
            <ListColumn isRow maxWidth={280}>
              <Link
                href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
                noWrap
                sx={{ display: 'inline-flex', alignItems: 'center' }}
              >
                <TokenIcon symbol={reserve.iconSymbol} fontSize="large" />
                <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
                  <Typography variant="h4" noWrap>
                    {reserve.name}
                  </Typography>
                  <Typography variant="subheader2" color="text.muted" noWrap>
                    {reserve.symbol}
                  </Typography>
                </Box>
              </Link>
            </ListColumn>

            {!downToXSM && (
              <ListColumn>
                <FormattedNumber
                  compact
                  value={reserve.walletBalance.toString()}
                  variant="main16"
                />
              </ListColumn>
            )}
          </ListItem>
        ))
      )}
    </ListWrapper>
  );
}
