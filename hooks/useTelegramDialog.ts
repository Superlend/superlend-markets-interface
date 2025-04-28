import { useState, useEffect, useCallback } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { checkTelegramUsernameSubmitted } from '../lib/telegram-service';

// Portfolio value threshold for showing the dialog (in USD)
export const PORTFOLIO_VALUE_THRESHOLD = 1000; // $1000 USD threshold for whales

export const useTelegramDialog = (portfolioValue: number = 0) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [shouldShowAfterDeposit, setShouldShowAfterDeposit] = useState<boolean>(false);
  const { currentAccount } = useWeb3Context();

  // Check if wallet is connected (non-empty account)
  const isWalletConnected = !!currentAccount;

  // Check if the user has already submitted their Telegram username
  const checkUserSubmission = useCallback(async () => {
    if (!currentAccount) return;

    setIsChecking(true);
    try {
      const hasAlreadySubmitted = await checkTelegramUsernameSubmitted(currentAccount);
      setHasSubmitted(hasAlreadySubmitted);
    } catch (error) {
      console.error('Error checking Telegram username submission:', error);
    } finally {
      setIsChecking(false);
    }
  }, [currentAccount]);

  // When the user connects their wallet, check the submission status
  useEffect(() => {
    if (isWalletConnected) {
      checkUserSubmission();
    }
  }, [isWalletConnected, checkUserSubmission]);

  // Function to check after a successful deposit
  const checkAfterDeposit = useCallback(
    (newPortfolioValue: number) => {
      console.log('Checking after deposit, portfolio value:', newPortfolioValue);

      if (
        isWalletConnected &&
        !hasSubmitted &&
        !isChecking &&
        newPortfolioValue >= PORTFOLIO_VALUE_THRESHOLD
      ) {
        setShouldShowAfterDeposit(true);
      }
    },
    [isWalletConnected, hasSubmitted, isChecking]
  );

  // Show dialog after deposit if conditions are met
  useEffect(() => {
    if (shouldShowAfterDeposit && !isOpen) {
      setIsOpen(true);
      setShouldShowAfterDeposit(false);
    }
  }, [shouldShowAfterDeposit, isOpen]);

  const openDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  const markAsSubmitted = useCallback(() => {
    setHasSubmitted(true);
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    openDialog,
    closeDialog,
    markAsSubmitted,
    hasSubmitted,
    checkAfterDeposit,
    isEligible: portfolioValue >= PORTFOLIO_VALUE_THRESHOLD,
    portfolioValue,
  };
};
