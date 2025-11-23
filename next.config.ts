// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true, 
  },
  images: {
    remotePatterns: [
      {
        protocol: process.env.ASSETS_PROTOCOL_DEV ?? "http",
        hostname: process.env.ASSETS_HOST_DEV ?? "localhost",
        port: process.env.ASSETS_PORT_DEV ?? "8080",
        pathname: "/photosUser/**",
      } as any,
      ...(process.env.ASSETS_HOST
        ? [{
            protocol: process.env.ASSETS_PROTOCOL ?? "https",
            hostname: process.env.ASSETS_HOST,
            pathname: "/photosUser/**",
          } as any]
        : []),
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
