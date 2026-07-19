import type { NextConfig } from "next";

const assetHostname = process.env.NEXT_PUBLIC_ASSET_BASE_URL
  ? new URL(process.env.NEXT_PUBLIC_ASSET_BASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: assetHostname
      ? [
          {
            protocol: "https",
            hostname: assetHostname,
            pathname: "/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
