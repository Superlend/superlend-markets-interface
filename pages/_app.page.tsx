// Side effect imports
import '/public/fonts/basier-circle/basier-circle.css';
import '/public/fonts/inter/inter.css';
// import '/public/fonts/space-grotesk/space-grotesk.css';
import '/src/styles/variables.css';

import { CacheProvider, EmotionCache } from '@emotion/react';
import { Web3ReactProvider } from '@web3-react/core';
import { AnalyticsProvider } from 'context/amplitude-provider';
import { providers } from 'ethers';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
import * as React from 'react';
import { useEffect } from 'react';
import { BlockVPN } from 'src/components/BlockVPN';
import { Meta } from 'src/components/Meta';
import { BorrowModal } from 'src/components/transactions/Borrow/BorrowModal';
import { ClaimRewardsModal } from 'src/components/transactions/ClaimRewards/ClaimRewardsModal';
import { CollateralChangeModal } from 'src/components/transactions/CollateralChange/CollateralChangeModal';
import { EmodeModal } from 'src/components/transactions/Emode/EmodeModal';
import { FaucetModal } from 'src/components/transactions/Faucet/FaucetModal';
import { GasStationProvider } from 'src/components/transactions/GasStation/GasStationProvider';
import { MigrateV3Modal } from 'src/components/transactions/MigrateV3/MigrateV3Modal';
import { PSMSwapModal } from 'src/components/transactions/PSMSwap/PSMSwapModal';
import { RateSwitchModal } from 'src/components/transactions/RateSwitch/RateSwitchModal';
import { RepayModal } from 'src/components/transactions/Repay/RepayModal';
import { SupplyModal } from 'src/components/transactions/Supply/SupplyModal';
import { SwapModal } from 'src/components/transactions/Swap/SwapModal';
import { WithdrawModal } from 'src/components/transactions/Withdraw/WithdrawModal';
import { BackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { AppDataProvider } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ModalContextProvider } from 'src/hooks/useModal';
import { PermissionProvider } from 'src/hooks/usePermissions';
import { AppGlobalStyles } from 'src/layouts/AppGlobalStyles';
import { LanguageProvider } from 'src/libs/LanguageProvider';
import { Web3ContextProvider } from 'src/libs/web3-data-provider/Web3Provider';

import { GA_TRACKING_ID, pageview } from '../lib/gtag';
import createEmotionCache from '../src/createEmotionCache';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getWeb3Library(provider: any): providers.Web3Provider {
  const library = new providers.Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: NextPageWithLayout;
}
export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page: React.ReactNode) => page);

  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      pageview(url);
    };

    // Track page views on route change
    router.events.on('routeChangeComplete', handleRouteChange);

    // Cleanup
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Meta
        title={'Superlend - Lend & Borrow USDC, USDT, ETH, BTC, XTZ on Etherlink'}
        description={
          "Explore Superlend's Etherlink Markets — lend or borrow USDC, USDT, XTZ & more seamlessly through our high-yield DeFi money markets."
        }
        imageUrl="/superlend_banner.png"
        iconUrl="/logos/superlend-square-logo.webp"
        cardType="summary"
      />
      <AnalyticsProvider>
        <LanguageProvider>
          <BlockVPN>
            <Web3ReactProvider getLibrary={getWeb3Library}>
              <Web3ContextProvider>
                <AppGlobalStyles>
                  {/* <AddressBlocked> */}
                  <PermissionProvider>
                    <ModalContextProvider>
                      <BackgroundDataProvider>
                        <AppDataProvider>
                          <GasStationProvider>
                            <Script
                              strategy="afterInteractive"
                              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
                            />
                            <Script
                              id="gtag-init"
                              strategy="afterInteractive"
                              dangerouslySetInnerHTML={{
                                __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
                              }}
                            />
                            {getLayout(<Component {...pageProps} />)}
                            <SupplyModal />
                            <WithdrawModal />
                            <BorrowModal />
                            <RepayModal />
                            <CollateralChangeModal />
                            <RateSwitchModal />
                            <ClaimRewardsModal />
                            <EmodeModal />
                            <SwapModal />
                            <FaucetModal />
                            <PSMSwapModal />
                            <MigrateV3Modal />
                          </GasStationProvider>
                        </AppDataProvider>
                      </BackgroundDataProvider>
                    </ModalContextProvider>
                  </PermissionProvider>
                  {/* </AddressBlocked> */}
                </AppGlobalStyles>
              </Web3ContextProvider>
            </Web3ReactProvider>
          </BlockVPN>
        </LanguageProvider>
      </AnalyticsProvider>
    </CacheProvider>
  );
}
