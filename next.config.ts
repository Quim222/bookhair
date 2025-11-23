// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/photosUser/**", // cobre /photosUser/user/:id e /photosUser/service/:id
      },
      // opcional, caso uses 127.0.0.1 nalgum sítio
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/photosUser/**",
      },
    ],
  },
};

export default nextConfig;
