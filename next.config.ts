import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "example.r2.dev" },
      { protocol: "https", hostname: "cdn.staygoldie.app" },
    ],
  },
};

export default nextConfig;
