import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.coreexl.com',
                port: '',
                pathname: '/**',
            },
        ]
    },
    async rewrites() {
    return [
      {
        // Add your main camelCase folders here
        source: '/advancepayment/:path*',
        destination: '/advancePayment/:path*',
      },
      {
        source: '/capscollection/:path*',
        destination: '/capsCollection/:path*',
      },
      {
        source: '/distributorsdelivery/:path*',
        destination: '/distributorsDelivery/:path*',
      },
      {
        source: '/salesteamload/:path*',
        destination: '/salesTeamLoad/:path*',
      },
      {
        source: '/salesteamunload/:path*',
        destination: '/salesTeamUnload/:path*',
      },
      // Continue this pattern for your other main folders...
    ];
  },
};

export default nextConfig;
