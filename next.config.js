// eslint-disable-next-line
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Define page extensions for regular pages
const pageExtensions = ['page.tsx'];
if (process.env.NEXT_PUBLIC_ENABLE_GOVERNANCE === 'true') pageExtensions.push('governance.tsx');
if (process.env.NEXT_PUBLIC_ENABLE_STAKING === 'true') pageExtensions.push('staking.tsx');

// Include page.js for API routes, but not plain .js to avoid duplicates
pageExtensions.push('page.js');

/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer({
  experimental: {
    esmExternals: 'loose',
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: ['prefixIds'],
            },
          },
        },
      ],
    });
    // Enable both topLevelAwait and layers experiments
    config.experiments = {
      topLevelAwait: true,
      layers: true,
    };
    
    // Configure module resolution for Yarn v4
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@types/react': require.resolve('@types/react'),
        '@types/react-dom': require.resolve('@types/react-dom'),
      },
    };
    
    return config;
  },
  reactStrictMode: true,
  // assetPrefix: "./",
  trailingSlash: true,
  pageExtensions,
  images: {
    domains: ['www.etherlink.com'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
});
