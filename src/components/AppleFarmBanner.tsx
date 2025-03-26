import React from 'react'
import { Typography, Box, Card as MuiCard } from '@mui/material'
import ImageWithDefault from '@/components/ImageWithDefault'
import { ArrowRightIcon } from 'lucide-react'
import { styled } from '@mui/material/styles'

const StyledCard = styled(MuiCard)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(to right, rgba(22, 163, 74, 0.1), rgba(22, 163, 74, 0.05))',
    cursor: 'pointer',
    borderRadius: '1.125rem',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(22, 163, 74, 0.2)',
    boxShadow: '0 0 10px rgba(22, 163, 74, 0.1)',
    '&:hover': {
        boxShadow: '0 0 20px rgba(22, 163, 74, 0.2)',
        border: '1px solid rgba(22, 163, 74, 0.4)'
    }
}))

const ContentWrapper = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    gap: '24px'
})

const TextContent = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    zIndex: 1
})

const TitleWrapper = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
})

const RewardsText = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#4ade80',
    fontWeight: 600,
    '& svg': {
        transition: 'transform 0.2s ease',
    },
    '&:hover svg': {
        transform: 'translateX(4px)'
    }
})

export default function AppleFarmBanner() {
    return (
        <a href="https://www.applefarm.xyz" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <StyledCard>
                <ContentWrapper>
                    <TextContent>
                        <TitleWrapper>
                            <ImageWithDefault
                                src="/logos/apple-green.png"
                                alt="Apple Farm"
                                width={36}
                                height={36}
                                style={{ objectFit: 'contain' }}
                            />
                            <Typography 
                                component="h2"
                                sx={{ 
                                    fontSize: '1.125rem',
                                    lineHeight: 1.75,
                                    fontWeight: 600,
                                    color: '#ffffff',
                                }}
                            >
                                Apple Farm is Live on Etherlink!
                            </Typography>
                        </TitleWrapper>
                        <Typography 
                            component="p"
                            sx={{ 
                                fontSize: '0.875rem',
                                lineHeight: 1.5,
                                color: 'rgba(255, 255, 255, 0.8)',
                                maxWidth: 600 
                            }}
                        >
                            An onchain incentive platform that rewards users who provide liquidity for key token pairs, supply to lending markets, and trade on selected DeFi protocols.
                        </Typography>
                        <RewardsText>
                            Season One Rewards: $3,000,000
                            <ArrowRightIcon size={16} />
                        </RewardsText>
                    </TextContent>

                    <Box sx={{
                        display: { xs: 'none', md: 'block' },
                        position: 'absolute',
                        right: 24,
                        top: '50%',
                        transform: 'translateY(-50%)'
                    }}>
                        <ImageWithDefault
                            src="https://www.etherlink.com/logo-desktop.svg"
                            alt="Etherlink"
                            width={160}
                            height={45}
                            style={{ objectFit: 'contain' }}
                        />
                    </Box>
                </ContentWrapper>
            </StyledCard>
        </a>
    )
} 