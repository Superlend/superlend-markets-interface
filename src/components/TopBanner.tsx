'use client';

import { Box, Button, IconButton } from '@mui/material';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const BANNER_VARIANTS = [
  'gradient',
  'accent',
  'dark',
  'highlight',
  'navy',
  'forest',
  'neon',
  'pastel',
  'midnight',
] as const;

export default function TopBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentVariantIndex] = useState(BANNER_VARIANTS.length - 1);

  const variant = BANNER_VARIANTS[currentVariantIndex];

  useEffect(() => {
    // Add initial delay before showing the banner
    const timer = setTimeout(() => {
      setIsVisible(true);
      document.documentElement.classList.add('banner-visible');
    }, 1000);

    // Check screen size initially and on resize
    const checkScreenSize = () => {
      // setIsMobile(window.innerWidth < 640); // Using 640px as the breakpoint (sm in Tailwind)
    };

    checkScreenSize(); // Check initial screen size
    window.addEventListener('resize', checkScreenSize);

    return () => {
      clearTimeout(timer);
      document.documentElement.classList.remove('banner-visible');
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    document.documentElement.classList.remove('banner-visible');
  };

  // Hide banner if onboarding is open on mobile
  const shouldShowBanner = isVisible;

  return (
    <>
      {shouldShowBanner && (
        <>
          {/* REMOVE IN PRODUCTION - Variant Toggle Button */}
          {/* <div className="fixed top-2 right-2 z-[61]">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/80 backdrop-blur-sm"
                            onClick={cycleVariant}
                        >
                            <TestTubes className="w-4 h-4 mr-2" />
                            <span className="text-xs">
                                Test Variant: {variant}
                            </span>
                        </Button>
                    </div> */}

          <Box
            sx={{
              position: 'relative',
              top: 0,
              left: 0,
              width: '100%',
              zIndex: 100,
              overflow: 'hidden',
              background: '#0f244b',
              color: 'white',
            }}
          >
            {/* Animated background elements */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              {variant === 'gradient' && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to right, #E5F3FF, #F0F9FF, #E5F3FF)',
                  }}
                />
              )}
              {variant === 'dark' && (
                <Box sx={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
                  {[...Array(3)].map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: 'absolute',
                        width: '1px',
                        height: '1px',
                        background: 'white',
                        borderRadius: '50%',
                      }}
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}
                </Box>
              )}
              {variant === 'neon' && (
                <Box sx={{ position: 'absolute', inset: 0 }}>
                  {[...Array(5)].map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: 'absolute',
                        width: '30%',
                        height: '1px',
                        background: '#F1FF52',
                        borderRadius: '50%',
                        opacity: 0.3,
                      }}
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        rotate: `${Math.random() * 360}deg`,
                      }}
                    />
                  ))}
                </Box>
              )}
              {variant === 'midnight' && (
                <Box sx={{ position: 'absolute', inset: 0 }}>
                  {[...Array(8)].map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: 'absolute',
                        width: '1px',
                        height: '1px',
                        background: '#F9CAF4',
                        borderRadius: '50%',
                      }}
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            <Box
              sx={{
                maxWidth: '1200px',
                mx: 'auto',
                px: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                py: 2,
                sm: { py: 0, height: '44px' },
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    sm: { justifyContent: 'start' },
                  }}
                >
                  <Box
                    sx={{
                      '@keyframes pulse': {
                        '0%': { opacity: 0.1 },
                        '25%': { opacity: 0.3 },
                        '50%': { opacity: 1 },
                        '75%': { opacity: 0.3 },
                        '100%': { opacity: 0.1 },
                      },
                    }}
                  >
                    {/* {['dark', 'navy', 'forest', 'neon', 'midnight'].includes(variant) ? '⭐' : '🚀'} */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '24px',
                        right: '300px',
                        display: {
                          sm: 'none',
                          md: 'block',
                        },
                      }}
                    >
                      <Sparkles
                        style={{
                          width: 12,
                          height: 12,
                          color: 'black',
                          animation: 'pulse 2s linear infinite alternate',
                        }}
                      />
                    </Box>
                    <Box sx={{ position: 'absolute', top: '-1px', left: '200px' }}>
                      <Sparkles
                        style={{
                          width: 12,
                          height: 12,
                          color: 'black',
                          animation: 'pulse 2s linear infinite',
                        }}
                      />
                    </Box>
                    <Box sx={{ position: 'absolute', bottom: '-1px', left: '60px' }}>
                      <Sparkles
                        style={{
                          width: 12,
                          height: 12,
                          color: 'black',
                          animation: 'pulse 2s linear infinite alternate',
                        }}
                      />
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      textAlign: { xs: 'center', sm: 'left' },
                      fontSize: '16px',
                      fontWeight: 500,
                    }}
                  >
                    Now Live: Earn leveraged yield via Loop Strategy Vaults and Manual Loop Markets
                  </Box>
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    size="small"
                    href="https://loop.superlend.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<ArrowRight style={{ width: 20, height: 20 }} />}
                    sx={{
                      background: '#ff9f69',
                      color: '#0f244b',
                      '&:hover': {
                        background: '#ff9f69',
                        color: '#0f244b',
                      },
                    }}
                  >
                    Launch SuperLoop
                  </Button>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, ml: 4 }}>
                <Box>
                  <IconButton
                    size="small"
                    sx={{
                      color: 'white',
                    }}
                    onClick={handleClose}
                  >
                    <X style={{ width: 20, height: 20 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        </>
      )}
    </>
  );
}
