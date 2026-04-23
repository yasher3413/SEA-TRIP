import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Allow large system prompts in API routes
  serverExternalPackages: [],
};

export default nextConfig;
