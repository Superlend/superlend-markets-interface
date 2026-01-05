import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, IconButton, Typography } from '@mui/material';
import React from 'react';
import { toast } from 'sonner';

import ImageWithDefault from '@/components/ImageWithDefault';

interface V2LiveToastProps {
  id: string | number;
  onDismiss?: () => void;
}

const V2LiveToast = ({ id, onDismiss }: V2LiveToastProps) => {
  const handleDismiss = () => {
    toast.dismiss(id);
    if (onDismiss) onDismiss();
  };

  const handleExplore = () => {
    // handleDismiss();
    window.location.href = 'https://beta.superlend.xyz/markets';
  };

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        height: 150,
        width: '510px',
        overflow: 'hidden',
        borderRadius: 4,
        backgroundImage: "url('/banners/redirection-toast.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        p: { xs: 2, sm: 5 },
        boxShadow: 3,
        maxWidth: { lg: 510 },
      }}
    >
      {/* Decorative Clouds */}
      <Box
        component="div"
        style={{
          position: 'absolute',
          left: -40,
          top: -50,
          mixBlendMode: 'overlay',
          zIndex: 0,
        }}
      >
        <ImageWithDefault
          src="/images/decorative/cloud-blue.png"
          alt="cloud-1"
          width={181}
          height={70}
        />
      </Box>
      <Box
        component="div"
        style={{
          position: 'absolute',
          left: -40,
          bottom: -30,
          mixBlendMode: 'overlay',
          zIndex: 0,
        }}
      >
        <ImageWithDefault
          src="/images/decorative/cloud-blue.png"
          alt="cloud-2"
          width={140}
          height={54}
        />
      </Box>

      {/* Close Button */}
      <IconButton
        onClick={handleDismiss}
        size="small"
        sx={{
          position: 'absolute',
          right: 12,
          top: 12,
          zIndex: 10,
          color: 'rgba(124, 45, 18, 0.5)', // orange-900/50
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: 'rgb(124, 45, 18)', // orange-900
          },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <Box
        sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: 2, zIndex: 1 }}
      >
        {/* Left Content */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            maxWidth: { lg: '70%' },
            zIndex: 1,
          }}
        >
          <Box>
            <Typography
              component="div"
              sx={{ color: 'rgb(124, 45, 18)', fontWeight: 'bold', fontSize: '1rem' }}
            >
              Superlend V2 is live!
            </Typography>
            <Typography
              component="div"
              sx={{ color: 'rgb(124, 45, 18)', opacity: 0.9, fontSize: '0.875rem' }}
            >
              Major performance and UX upgrades are here.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={handleExplore}
            // size="large"
            sx={{
              bgcolor: '#f97316',
              '&:hover': { bgcolor: '#ea580c' },
              textTransform: 'none',
              px: 5,
              borderRadius: 2,
              width: 'fit-content',
            }}
          >
            Explore V2
          </Button>
        </Box>

        {/* Right Image (S Logo) */}
        <Box
          sx={{
            display: { xs: 'none', lg: 'flex' },
            position: 'absolute',
            right: -160,
            top: -50,
            zIndex: 0,
            pointerEvents: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
          }}
        >
          <ImageWithDefault
            src="/images/decorative/superlend-coin-1.png"
            alt="Superlend Logo"
            width={500}
            height={500}
            className="!max-w-full"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default V2LiveToast;
