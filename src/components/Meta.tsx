import Head from 'next/head';
import React from 'react';

type MetaProps = {
  title: string;
  description: string;
  imageUrl?: string;
  iconUrl?: string;
  timestamp?: string;
  cardType?: 'summary' | 'summary_large_image';
};

export function Meta({ title, description, imageUrl, iconUrl, timestamp, cardType = 'summary_large_image' }: MetaProps) {
  // Convert relative URLs to absolute
  const absoluteImageUrl = imageUrl?.startsWith('http') ? imageUrl : `https://markets.superlend.xyz${imageUrl}`;
  const absoluteIconUrl = iconUrl?.startsWith('http') ? iconUrl : `https://markets.superlend.xyz${iconUrl}`;

  // Use icon for summary cards, banner for large cards
  const twitterImageUrl = cardType === 'summary' ? absoluteIconUrl : absoluteImageUrl;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} key="description" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content="website" key="ogtype" />
      <meta property="og:title" content={title} key="title" />
      <meta property="og:description" content={description} key="ogdescription" />
      <meta property="og:url" content="https://markets.superlend.xyz/" key="ogurl" />
      {imageUrl && <meta property="og:image" content={absoluteImageUrl} key="ogimage" />}
      {iconUrl && <meta property="og:image" content={absoluteIconUrl} key="ogicon" />}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={cardType} key="twittercard" />
      <meta name="twitter:site" content="@SuperlendHQ" key="twittersite" />
      <meta name="twitter:creator" content="@SuperlendHQ" key="twittercreator" />
      <meta name="twitter:title" content={title} key="twittertitle" />
      <meta name="twitter:description" content={description} key="twitterdescription" />
      <meta name="twitter:image" content={twitterImageUrl} key="twitterimage" />
      <meta name="twitter:image:alt" content="Superlend" key="twitteralt" />

      {timestamp && <meta name="revised" content={timestamp} key="timestamp" />}
      <meta
        name="keywords"
        key="keywords"
        content="Superlend Markets, Etherlink, USDC Borrow, USDC earn, DeFi Earn, DeFi lend borrow ETH"
      />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
      <meta name="msapplication-TileColor" content="#171715" />
      <meta name="theme-color" content="#FF5B00" />
      <link rel="canonical" href="https://markets.superlend.xyz/" />
    </Head>
  );
}
