import { BookOpenIcon } from '@heroicons/react/outline';
import { t } from '@lingui/macro';
// import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { ReactNode } from 'react';
import { ROUTES } from 'src/components/primitives/Link';

import GithubIcon from '/public/icons/github.svg';

import { MarketDataType } from '../marketsConfig';

interface Navigation {
  link: string;
  title: string;
  isVisible?: (data: MarketDataType) => boolean | undefined;
  dataCy?: string;
}

export const navigation: Navigation[] = [
  {
    link: ROUTES.dashboard,
    title: t`Dashboard`,
    dataCy: 'menuDashboard',
  },
  {
    link: ROUTES.markets,
    title: t`Markets`,
    dataCy: 'menuMarkets',
  },
];

interface MoreMenuItem extends Navigation {
  icon: ReactNode;
  makeLink?: (walletAddress: string) => string;
}

const moreMenuItems: MoreMenuItem[] = [
  // {
  //   link: 'https://docs.superlend.xyz',
  //   title: t`FAQ`,
  //   icon: <QuestionMarkCircleIcon />,
  // },
  {
    link: 'https://docs.superlend.xyz/',
    title: t`Documentation`,
    icon: <BookOpenIcon />,
  },
  {
    link: 'https://github.com/Plenty-network/plend-core-contracts',
    title: t`Github`,
    icon: <GithubIcon />,
  },
  {
    link: 'https://www.etherlinkbridge.com/bridge',
    title: t`Bridge to Etherlink`,
    icon: <CompareArrowsIcon />,
  },
  {
    link: 'https://www.iguanadex.com/swap?chain=etherlink',
    title: t`Trade on Etherlink`,
    icon: <CurrencyExchangeIcon />,
  },
];

export const moreMenuExtraItems: MoreMenuItem[] = [];
export const moreMenuMobileOnlyItems: MoreMenuItem[] = [];

export const moreNavigation: MoreMenuItem[] = [...moreMenuItems, ...moreMenuExtraItems];

export const mobileNavigation: Navigation[] = [
  ...navigation,
  ...moreMenuItems,
  ...moreMenuMobileOnlyItems,
];
