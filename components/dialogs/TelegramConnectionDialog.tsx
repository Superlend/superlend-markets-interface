// import { Trans } from '@lingui/macro';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogContent, 
  DialogTitle,
  IconButton, 
  TextField, 
  Typography,
  useMediaQuery,
  Card,
  InputLabel,
  FormHelperText,
  Drawer,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import React, { useState, useEffect, useRef } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { validateTelegramUsername, submitTelegramUsername } from '../../lib/telegram-service';

interface TelegramConnectionDialogProps {
  open: boolean;
  onClose: () => void;
  portfolioValue: number;
  website?: 'AGGREGATOR' | 'MARKETS';
}

export const TelegramConnectionDialog = ({ 
  open, 
  onClose, 
  portfolioValue,
  website = 'MARKETS'
}: TelegramConnectionDialogProps) => {
  const { currentAccount } = useWeb3Context();
  const [telegramUsername, setTelegramUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const inputRef = useRef<HTMLInputElement>(null);

  // Format portfolio value for display
  const formattedPortfolioValue = portfolioValue 
    ? new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      }).format(portfolioValue)
    : '$0.00';

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setTelegramUsername('');
      setUsernameError('');
      setSubmitSuccess(false);
    }
  }, [open]);
  
  // Focus input when dialog opens
  useEffect(() => {
    if (open && !submitSuccess && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, submitSuccess]);

  // Simple input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelegramUsername(e.target.value);
    if (usernameError) {
      setUsernameError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username
    const validationError = validateTelegramUsername(telegramUsername);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit username
      const result = await submitTelegramUsername({
        telegramUsername,
        walletAddress: currentAccount,
        portfolioValue,
        website,
      });
      
      if (result.success) {
        setSubmitSuccess(true);
      } else {
        setUsernameError(result.message);
      }
    } catch (error) {
      setUsernameError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDiscordClick = () => {
    window.open('https://discord.gg/superlend', '_blank');
  };

  // Simple dialog content
  const renderDialogContent = () => (
    <>
      {/* Header */}
      <DialogTitle sx={{ textAlign: 'center', pb: 0, pt: 1, mb: 2 }}>
        <Typography sx={{ fontSize: '1.25rem', fontWeight: 500, color: 'white' }}>
          We need your inputs!
        </Typography>
      </DialogTitle>
      
      {/* Close button */}
      <IconButton
        aria-label="close"
        onClick={onClose}
        disabled={isSubmitting}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'white',
        }}
      >
        <CloseIcon />
      </IconButton>
      
      <DialogContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: '100%', overflow: 'hidden' }}>
          {submitSuccess ? (
            // Success state
            <Card sx={{ 
              p: 3, 
              bgcolor: theme.palette.mode === 'dark' ? '#2c6e42' : '#4ade80', 
              borderRadius: 2,
              boxShadow: 'none',
              textAlign: 'center'
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap:.5,
                mb: 2
              }}>
                <Box sx={{ 
                  width: 28, 
                  height: 28, 
                  bgcolor: 'rgba(255,255,255,0.3)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mr: 1
                }}>
                  <CheckCircleOutlineIcon sx={{ color: 'white' }} fontSize="small" />
                </Box>
                <Typography sx={{ fontWeight: 500, color: 'white' }}>
                  Thank you! We'll connect with you soon.
                </Typography>
              </Box>
              
              {/* Divider */}
              <Box sx={{ height: '1px', bgcolor: 'rgba(255,255,255,0.3)', width: '100%', my: 2 }} />
              
              {/* Join Discord button */}
              <Button
                variant="contained"
                fullWidth
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2, 
                  bgcolor: '#5865F2', // Discord brand color
                  color: 'white',
                  '&:hover': { bgcolor: '#4752C4' },
                  textTransform: 'none',
                  fontWeight: 500
                }}
                onClick={handleDiscordClick}
              >
                Join our Discord Community
              </Button>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', mt: 1, fontSize: '0.875rem' }}>
                Join our active community for the latest updates and support
              </Typography>
            </Card>
          ) : (
            <>
              {/* Message */}
              <Typography sx={{ color: 'white', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Hope you've been enjoying Superlend. 
                Our product manager would like to have a chat with you and ask you a few questions to understand how best we can add value to you.
                This will help us build the best DeFi products for you.
              </Typography>
              
              <Typography sx={{ color: 'white', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Do drop-in your Telegram username, and our PM will reach out in the next 24-48 hours
              </Typography>
              
              {/* Info Banner */}
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 2,
                mt: 1,
                bgcolor: '#0b3b65', 
                borderRadius: 1,
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <InfoOutlinedIcon sx={{ color: 'white', fontSize: 20 }} />
                <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>
                  Your portfolio of <Box component="span" sx={{ fontWeight: 600 }}>{formattedPortfolioValue}</Box> qualifies you for personalized support.
                </Typography>
              </Box>
              
              {/* Input field - simplified */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InputLabel sx={{ color: 'white', fontSize: '0.875rem' }} htmlFor="telegram-username">
                    Your Telegram Username
                  </InputLabel>
                  <Tooltip
                    title={
                      <Box sx={{ p: 1, maxWidth: 280 }}>
                        <Typography sx={{ fontSize: '0.875rem', color: 'inherit' }}>
                          Your Telegram username can be found in your Telegram profile settings.
                        </Typography>
                        <Box sx={{ height: 1, bgcolor: 'divider', my: 1 }} />
                        <Typography sx={{ fontSize: '0.875rem', color: 'inherit' }}>
                          To get your Telegram username:
                        </Typography>
                        <ol style={{ paddingLeft: 16, marginTop: 4 }}>
                          <li style={{ marginBottom: 2, fontSize: '0.875rem' }}>Open Telegram</li>
                          <li style={{ marginBottom: 2, fontSize: '0.875rem' }}>Go to Settings</li>
                          <li style={{ marginBottom: 2, fontSize: '0.875rem' }}>Tap on your profile</li>
                          <li style={{ fontSize: '0.875rem' }}>Your username will be listed as @username</li>
                        </ol>
                      </Box>
                    }
                    arrow
                  >
                    <InfoOutlinedIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </Tooltip>
                </Box>
                
                <TextField
                  id="telegram-username"
                  value={telegramUsername}
                  onChange={handleInputChange}
                  placeholder="Enter your Telegram username"
                  fullWidth
                  error={!!usernameError}
                  helperText={usernameError}
                  inputRef={inputRef}
                  autoFocus
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      height: 56,
                      bgcolor: 'white',
                      border: '2px solid white',
                      '&:hover, &.Mui-focused': {
                        borderColor: 'white',
                        boxShadow: '0 0 0 2px rgba(255,255,255,0.4)'
                      }
                    },
                    '& .MuiInputBase-input': {
                      px: 2,
                      color: '#333',
                      '&::placeholder': {
                        color: '#777',
                        opacity: 1
                      }
                    },
                    '& .MuiFormHelperText-root': {
                      color: theme => theme.palette.error.main,
                      mt: 1
                    }
                  }}
                />
                
                <FormHelperText sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', mt: 0.5 }}>
                  Your information will only be used for product improvement purposes.
                </FormHelperText>
              </Box>
              
              {/* Buttons */}
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                pt: 1.5,
                mt: 1
              }}>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !telegramUsername.trim()}
                  variant="contained"
                  sx={{ 
                    py: 1.5,
                    px: 4,
                    borderRadius: 5,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    bgcolor: theme => isSubmitting || !telegramUsername.trim() 
                      ? theme.palette.action.disabledBackground 
                      : theme.palette.primary.main,
                    color: theme => isSubmitting || !telegramUsername.trim() 
                      ? theme.palette.action.disabled 
                      : theme.palette.primary.contrastText,
                    '&:hover': {
                      bgcolor: theme => !isSubmitting && telegramUsername.trim() 
                        ? theme.palette.primary.dark 
                        : theme.palette.action.disabledBackground
                    }
                  }}
                >
                  Connect
                  {isSubmitting ? (
                    <CircularProgress size={16} color="inherit" sx={{ ml: 1 }} />
                  ) : (
                    <ArrowForwardIcon fontSize="small" />
                  )}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
    </>
  );

  // Render the appropriate dialog
  if (isDesktop) {
    return (
      <Dialog 
        open={open} 
        onClose={!isSubmitting ? onClose : undefined}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 450,
            p: 3,
            pt: 2.5,
            bgcolor: '#222222',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }
        }}
      >
        {renderDialogContent()}
      </Dialog>
    );
  }
  
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={!isSubmitting ? onClose : undefined}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          p: 3,
          pt: 2.5,
          bgcolor: '#222222',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.3)'
        }
      }}
    >
      {renderDialogContent()}
    </Drawer>
  );
}; 