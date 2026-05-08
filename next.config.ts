import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {},

  webpack: (config) => {
    config.resolve.alias["cesium"] = path.resolve(
      __dirname,
      "node_modules/cesium",
    );

    config.resolve.fallback = {
      fs: false,
      path: false,
      zlib: false,
      http: false,
      https: false,
      url: false,
    };

    return config;
  },
};

export default nextConfig;
