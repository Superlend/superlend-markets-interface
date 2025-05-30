import { DuplicateIcon } from '@heroicons/react/outline';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationIcon,
  ExternalLinkIcon,
} from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Skeleton,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import makeBlockie from 'ethereum-blockies-base64';
import React, { useEffect, useState } from 'react';
import { Warning } from 'src/components/primitives/Warning';
import { WalletModal } from 'src/components/WalletConnection/WalletModal';
import { useWalletModalContext } from 'src/hooks/useWalletModal';
import useGetEns from 'src/libs/hooks/use-get-ens';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { Link } from '../components/primitives/Link';
import { textCenterEllipsis } from '../helpers/text-center-ellipsis';
import { ENABLE_TESTNET, getNetworkConfig, STAGING_ENV } from '../utils/marketsAndNetworksConfig';
import { DrawerWrapper } from './components/DrawerWrapper';
import { MobileCloseButton } from './components/MobileCloseButton';

interface WalletWidgetProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  headerHeight: number;
}

export default function WalletWidget({ open, setOpen, headerHeight }: WalletWidgetProps) {
  const { disconnectWallet, currentAccount, connected, chainId, loading, readOnlyModeAddress } =
    useWeb3Context();

  const { setWalletModalOpen } = useWalletModalContext();

  const { breakpoints, palette } = useTheme();
  const xsm = useMediaQuery(breakpoints.down('xsm'));
  const md = useMediaQuery(breakpoints.down('md'));

  const { name: ensName, avatar: ensAvatar } = useGetEns(currentAccount);
  const ensNameAbbreviated = ensName
    ? ensName.length > 18
      ? textCenterEllipsis(ensName, 12, 3)
      : ensName
    : undefined;

  const [useBlockie, setUseBlockie] = useState(false);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  useEffect(() => {
    if (ensAvatar) {
      setUseBlockie(false);
    }
  }, [ensAvatar]);

  const networkConfig = getNetworkConfig(chainId);
  let networkColor = '';
  if (networkConfig?.isFork) {
    networkColor = '#ff4a8d';
  } else if (networkConfig?.isTestnet) {
    networkColor = '#7157ff';
  } else {
    networkColor = '#65c970';
  }

  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!connected && !readOnlyModeAddress) {
      setWalletModalOpen(true);
    } else {
      setOpen(true);
      setAnchorEl(event.currentTarget);
    }
  };

  const handleDisconnect = () => {
    if (connected) {
      disconnectWallet();
      handleClose();
    }
  };

  const handleCopy = async () => {
    navigator.clipboard.writeText(currentAccount);
    handleClose();
  };

  const handleSwitchWallet = (): void => {
    setWalletModalOpen(true);
    handleClose();
  };

  const hideWalletAccountText = xsm && (ENABLE_TESTNET || STAGING_ENV || readOnlyModeAddress);

  const accountAvatar = (
    <Box
      sx={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        border: '1px solid #FAFBFC1F',
        img: { width: '100%', height: '100%', borderRadius: '50%' },
      }}
    >
      <img
        src={
          useBlockie ? makeBlockie(currentAccount !== '' ? currentAccount : 'default') : ensAvatar
        }
        alt=""
        onError={() => setUseBlockie(true)}
      />
      {readOnlyModeAddress && (
        <SvgIcon
          color="warning"
          sx={{
            width: 15,
            height: 15,
            position: 'absolute',
            top: '20px',
            left: '20px',
            borderRadius: '50%',
            background: '#383D51',
          }}
        >
          <ExclamationIcon />
        </SvgIcon>
      )}
    </Box>
  );

  let buttonContent = <></>;
  if (currentAccount) {
    if (hideWalletAccountText) {
      buttonContent = <Box sx={{ margin: '1px 0' }}>{accountAvatar}</Box>;
    } else {
      buttonContent = <>{ensNameAbbreviated ?? textCenterEllipsis(currentAccount, 4, 4)}</>;
    }
  } else {
    buttonContent = <Trans>Connect wallet</Trans>;
  }

  const Content = ({ component = ListItem }: { component?: typeof MenuItem | typeof ListItem }) => (
    <>
      <Typography
        variant="subheader2"
        sx={{
          display: { xs: 'block', md: 'none' },
          color: '#A5A8B6',
          px: 4,
          py: 2,
          fontFamily: palette.fonts.header,
        }}
      >
        <Trans>Account</Trans>
      </Typography>

      <Box component={component} disabled>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '1px solid #FAFBFC1F',
                mr: 3,
                img: { width: '100%', height: '100%', borderRadius: '50%' },
              }}
            >
              {readOnlyModeAddress && (
                <SvgIcon
                  color="warning"
                  sx={{
                    width: 20,
                    height: 20,
                    position: 'absolute',
                    top: '35px',
                    left: '40px',
                    borderRadius: '50%',
                    background: md ? '#383D51' : palette.background.paper,
                  }}
                >
                  <ExclamationIcon />
                </SvgIcon>
              )}
              <img
                src={
                  useBlockie
                    ? makeBlockie(currentAccount !== '' ? currentAccount : 'default')
                    : ensAvatar
                }
                alt=""
                onError={() => setUseBlockie(true)}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {ensNameAbbreviated && (
                <Typography variant="h4" color={{ xs: '#F1F1F3', md: 'text.primary' }}>
                  {ensNameAbbreviated}
                </Typography>
              )}

              <Typography
                variant={ensNameAbbreviated ? 'caption' : 'h4'}
                fontFamily={palette.fonts.header}
                fontWeight={500}
                color={
                  ensNameAbbreviated
                    ? { xs: '#A5A8B6', md: 'text.secondary' }
                    : { xs: '#F1F1F3', md: 'text.primary' }
                }
              >
                {textCenterEllipsis(currentAccount, ensNameAbbreviated ? 12 : 7, 4)}
              </Typography>
            </Box>
          </Box>
          {readOnlyModeAddress && (
            <Warning
              icon={false}
              severity="warning"
              sx={{ mt: 3, mb: 0, ...(md ? { background: '#301E04', color: '#FFDCA8' } : {}) }}
            >
              <Trans>Read-only mode.</Trans>
            </Warning>
          )}
        </Box>
      </Box>
      {!md && (
        <Box sx={{ display: 'flex', flexDirection: 'row', padding: '0 16px 10px' }}>
          <Button
            variant="outlined"
            sx={{
              padding: '0 5px',
              marginRight: '10px',
            }}
            size="small"
            onClick={handleSwitchWallet}
          >
            Switch wallet
          </Button>
          <Button
            variant="outlined"
            sx={{
              padding: '0 5px',
            }}
            size="small"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </Box>
      )}
      <Divider
        sx={{
          my: { xs: 7, md: 0 },
          borderColor: { xs: '#FFFFFF1F', md: palette.mode === 'dark' ? 'divider' : '#cecece' },
        }}
      />

      <Box component={component} disabled>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography
              variant="caption"
              color={{ xs: '#FFFFFFB2', md: 'text.secondary' }}
              fontFamily={palette.fonts.header}
            >
              <Trans>Network</Trans>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                bgcolor: networkColor,
                width: 6,
                height: 6,
                mr: 2,
                boxShadow: '0px 2px 1px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25)',
                borderRadius: '50%',
              }}
            />
            <Typography
              color={{ xs: '#F1F1F3', md: 'text.primary' }}
              variant="subheader1"
              fontFamily={palette.fonts.header}
              fontWeight={500}
            >
              {networkConfig.name}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider
        sx={{
          my: { xs: 7, md: 0 },
          borderColor: { xs: '#FFFFFF1F', md: palette.mode === 'dark' ? 'divider' : '#cecece' },
        }}
      />

      <Box
        component={component}
        sx={{ color: { xs: '#F1F1F3', md: 'text.primary' } }}
        onClick={handleCopy}
      >
        <ListItemIcon
          sx={{
            color: {
              xs: '#F1F1F3',
              md: 'primary.light',
              minWidth: 'unset',
              marginRight: 12,
            },
          }}
        >
          <SvgIcon fontSize="small">
            <DuplicateIcon />
          </SvgIcon>
        </ListItemIcon>
        <ListItemText sx={{ fontFamily: palette.fonts.header, fontWeight: 500 }}>
          <Trans>Copy address</Trans>
        </ListItemText>
      </Box>

      {networkConfig?.explorerLinkBuilder && (
        <Link href={networkConfig.explorerLinkBuilder({ address: currentAccount })}>
          <Box
            component={component}
            sx={{ color: { xs: '#F1F1F3', md: 'text.primary' } }}
            onClick={handleClose}
          >
            <ListItemIcon
              sx={{
                color: {
                  xs: '#F1F1F3',
                  md: 'primary.light',
                  minWidth: 'unset',
                  marginRight: 12,
                },
              }}
            >
              <SvgIcon fontSize="small">
                <ExternalLinkIcon />
              </SvgIcon>
            </ListItemIcon>
            <ListItemText sx={{ fontFamily: palette.fonts.header, fontWeight: 500 }}>
              <Trans>View on Explorer</Trans>
            </ListItemText>
          </Box>
        </Link>
      )}
      {md && (
        <>
          <Divider
            sx={{
              my: { xs: 7, md: 0 },
              borderColor: { xs: '#FFFFFF1F', md: palette.mode === 'dark' ? 'divider' : '#cecece' },
            }}
          />
          <Box sx={{ padding: '16px 16px 10px' }}>
            <Button
              sx={{
                marginBottom: '16px',
                background: '#383D51',
                color: '#F1F1F3',
              }}
              fullWidth
              size="large"
              variant={palette.mode === 'dark' ? 'outlined' : 'text'}
              onClick={handleSwitchWallet}
            >
              Switch wallet
            </Button>
            <Button
              sx={{
                background: '#383D51',
                color: '#F1F1F3',
              }}
              fullWidth
              size="large"
              variant={palette.mode === 'dark' ? 'outlined' : 'text'}
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </Box>
        </>
      )}
    </>
  );

  return (
    <>
      {md && (connected || readOnlyModeAddress) && open ? (
        <MobileCloseButton setOpen={setOpen} />
      ) : loading ? (
        <Skeleton height={36} width={126} sx={{ background: '#383D51' }} />
      ) : (
        <Button
          // variant={connected || readOnlyModeAddress ? 'surface' : 'gradient'}
          aria-label="wallet"
          id="wallet-button"
          aria-controls={open ? 'wallet-button' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleClick}
          sx={{
            p: connected || readOnlyModeAddress ? '5px 8px' : undefined,
            minWidth: hideWalletAccountText ? 'unset' : undefined,
            fontFamily: palette.fonts.header,
            background: 'rgba(235, 235, 237, 0.20)',
            color: '#f1f1f1',
          }}
          startIcon={(connected || readOnlyModeAddress) && !hideWalletAccountText && accountAvatar}
          endIcon={
            (connected || readOnlyModeAddress) &&
            !hideWalletAccountText &&
            !md && (
              <SvgIcon
                sx={{
                  display: { xs: 'none', md: 'block' },
                }}
              >
                {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </SvgIcon>
            )
          }
        >
          {buttonContent}
        </Button>
      )}

      {md ? (
        <DrawerWrapper open={open} setOpen={setOpen} headerHeight={headerHeight}>
          <List
            sx={{
              px: 2,
              '.MuiListItem-root.Mui-disabled': { opacity: 1 },
              '.MuiList-root.MuiMenu-list': {
                background: palette.mode === 'dark' ? '#2A2826' : '#f1f1f1',
              },
            }}
          >
            <Content />
          </List>
        </DrawerWrapper>
      ) : (
        <Menu
          id="wallet-menu"
          MenuListProps={{
            'aria-labelledby': 'wallet-button',
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          keepMounted={true}
          sx={{
            '.MuiList-root.MuiMenu-list': {
              background: palette.mode === 'dark' ? '#2A2826' : '#f1f1f1',
            },
          }}
        >
          <MenuList disablePadding sx={{ '.MuiMenuItem-root.Mui-disabled': { opacity: 1 } }}>
            <Content component={MenuItem} />
          </MenuList>
        </Menu>
      )}

      <WalletModal />
    </>
  );
}
