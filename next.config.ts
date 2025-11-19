import type { NextConfig } from "next";
const path = require("path");

const nextConfig: NextConfig = {
  /* config options here */
   turbopack: {},
  webpack: (config) => {
    config.resolve.alias["cesium"] = path.resolve(__dirname, "node_modules/cesium");
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
