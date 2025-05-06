import { useMemo, useEffect } from 'react';
import { useTelegramDialog } from '../hooks/useTelegramDialog';
import { TelegramConnectionDialog } from './dialogs/TelegramConnectionDialog';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext, ModalType } from 'src/hooks/useModal';

/**
 * Component to integrate Telegram dialog with the application.
 * This component will show the dialog after a successful deposit if the portfolio value exceeds the threshold.
 * Currently disabled as per requirements.
 */
export const TelegramIntegration = () => {
  const { currentAccount } = useWeb3Context();
  const { user } = useAppDataContext();
  const { mainTxState, type: modalType } = useModalContext();

  // Get the user's portfolio value from the app data context
  const portfolioValue = useMemo(() => {
    return user?.totalLiquidityUSD ? parseFloat(user.totalLiquidityUSD) : 0;
  }, [user?.totalLiquidityUSD]);

  // Check if any transaction modal is currently open
  const isTransactionModalOpen = modalType !== undefined;

  // Initialize the Telegram dialog logic
  const {
    isOpen,
    closeDialog,
    // markAsSubmitted,
    checkAfterDeposit,
    portfolioValue: thresholdValue,
  } = useTelegramDialog(portfolioValue, isTransactionModalOpen);

  // Monitor transaction success to trigger the dialog check
  useEffect(() => {
    // Only check after a successful supply/deposit transaction
    if (mainTxState?.success && mainTxState?.txHash && modalType === ModalType.Supply) {
      console.log('Successful deposit detected, checking portfolio value:', portfolioValue);
      checkAfterDeposit(portfolioValue);
    }
  }, [mainTxState?.success, mainTxState?.txHash, modalType, portfolioValue, checkAfterDeposit]);

  // Only render the dialog if the user is connected
  if (!currentAccount) {
    return null;
  }

  const handleClose = () => {
    closeDialog();
  };

  return (
    <TelegramConnectionDialog
      open={isOpen}
      onClose={handleClose}
      portfolioValue={thresholdValue}
      website="MARKETS"
    />
  );
};
