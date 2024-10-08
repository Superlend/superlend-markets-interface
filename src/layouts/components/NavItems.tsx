import { useLingui } from '@lingui/react';
import { Button, List, ListItem, Typography, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';

import { Link } from '../../components/primitives/Link';
import { useProtocolDataContext } from '../../hooks/useProtocolDataContext';
import { navigation } from '../../ui-config/menu-items';
import { MoreMenu } from '../MoreMenu';

interface NavItemsProps {
  setOpen?: (value: boolean) => void;
}

export const NavItems = ({ setOpen }: NavItemsProps) => {
  const { i18n } = useLingui();
  const { currentMarketData } = useProtocolDataContext();

  const { breakpoints, palette } = useTheme();
  const md = useMediaQuery(breakpoints.down('md'));

  return (
    <List
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', md: 'center' },
        flexDirection: { xs: 'column', md: 'row' },
      }}
      disablePadding
    >
      {navigation
        .filter((item) => !item.isVisible || item.isVisible(currentMarketData))
        .map((item, index) => (
          <ListItem
            sx={{
              width: { xs: '100%', md: 'unset' },
              mr: { xs: 0, md: 2 },
            }}
            data-cy={item.dataCy}
            disablePadding
            key={index}
          >
            {md ? (
              <Typography
                component={Link}
                href={item.link}
                variant="h2"
                color={palette.mode === 'dark' ? 'common.white' : 'common.black'}
                sx={{ width: '100%', p: 4 }}
                onClick={() => (setOpen ? setOpen(false) : undefined)}
              >
                {i18n._(item.title)}
              </Typography>
            ) : (
              <Button
                component={Link}
                href={item.link}
                sx={() => ({
                  color: '#FFFFFF',
                  p: '6px 20px',
                  fontSize: '16px',
                  fontWeight: '400',
                  fontFamily: palette.fonts.header,
                  position: 'relative',
                  '&.active, &:hover': {
                    color: '#F1FF52',
                  },
                })}
              >
                {i18n._(item.title)}
              </Button>
            )}
          </ListItem>
        ))}

      <ListItem sx={{ display: { xs: 'none', md: 'flex' }, width: 'unset' }}>
        <MoreMenu />
      </ListItem>
    </List>
  );
};
