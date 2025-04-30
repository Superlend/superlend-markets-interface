import { Box } from '@mui/material';
import React, { ReactNode } from 'react';

// import { TelegramIntegration } from '../../components/TelegramIntegration';
import { AppHeader } from './AppHeader';

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {children}
      </Box>

      {/* Telegram Integration - Dialog will show after a successful deposit if portfolio value > $1000 */}
      {/* <TelegramIntegration /> */}
    </>
  );
}
