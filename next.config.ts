import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["images.unsplash.com"],
  },
  experimental: {
    reactRoot: true,
    transparentModuleResolution: true
  }
};

export default nextConfig;
