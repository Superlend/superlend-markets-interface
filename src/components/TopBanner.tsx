'use client';

import { Box, Button } from '@mui/material';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function TopBanner() {
  const [isVisible, setIsVisible] = useState(false);

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

  // Hide banner if onboarding is open on mobile
  const shouldShowBanner = isVisible;

  return (
    <>
      {shouldShowBanner && (
        <>
          <Box
            sx={{
              position: 'relative',
              top: 0,
              left: 0,
              width: '100%',
              height: 48,
              zIndex: 100,
              overflow: 'hidden',
              background: '#0F244B',
              color: 'white',
            }}
          >
            {/* background elements */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,

                overflow: 'hidden',
                zIndex: 98,
              }}
            >
              <img src="/banner/bg-stars.svg" width="100%" height="100%" />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                left: '-2%',

                overflow: 'hidden',
                zIndex: 99,
              }}
            >
              <img src="/banner/left-cloud.svg" alt="Left Cloud" width={178} height={70} />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                right: '-2%',

                overflow: 'hidden',
                zIndex: 99,
              }}
            >
              <img src="/banner/right-cloud.svg" alt="Right Cloud" width={178} height={70} />
            </Box>

            <Box
              display="flex"
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                gap: 2,
                alignItems: 'center',
                zIndex: 100,
              }}
            >
              <Box
                sx={{
                  textAlign: 'center',
                  fontSize: '16px',
                  fontWeight: 500,
                }}
              >
                Superlend V2 is Live!
              </Box>

              <Box
                sx={{
                  width: 4,
                  height: 4,

                  backgroundColor: '#8DE7FF',
                  borderRadius: '50%',
                }}
              />

              <a
                href="https://app.superlend.xyz"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '16px',
                  color: '#ff7831',
                }}
              >
                Try Out the New UI
              </a>
            </Box>
          </Box>
        </>
      )}
    </>
  );
}
