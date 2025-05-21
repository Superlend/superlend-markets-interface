import Head from 'next/head';
import React from 'react';

type MetaProps = {
  title: string;
  description: string;
  imageUrl?: string;
  timestamp?: string;
};

export function Meta({ title, description, imageUrl, timestamp }: MetaProps) {
  // Convert relative URLs to absolute
  const absoluteImageUrl = imageUrl?.startsWith('https') ? imageUrl : `https://markets.superlend.xyz${imageUrl}`;

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
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" key="twittercard" />
      <meta name="twitter:site" content="@SuperlendHQ" key="twittersite" />
      <meta name="twitter:creator" content="@SuperlendHQ" key="twittercreator" />
      <meta name="twitter:title" content={title} key="twittertitle" />
      <meta name="twitter:description" content={description} key="twitterdescription" />
      {imageUrl && <meta name="twitter:image" content={absoluteImageUrl} key="twitterimage" />}
      {imageUrl && <meta name="twitter:image:alt" content="Superlend logo" key="twitteralt" />}

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
