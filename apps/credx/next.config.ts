import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@credx/shared"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@credx/shared": path.resolve(__dirname, "../../packages/shared"),
    };
    return config;
  },
};

export default nextConfig;
