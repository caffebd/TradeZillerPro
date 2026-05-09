import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Required for pdfjs-dist to work correctly
    config.resolve.alias["canvas"] = false;
    return config;
  },
};

export default nextConfig;
