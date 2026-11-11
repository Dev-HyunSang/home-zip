import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Docker 이미지에 필요한 파일만 .next/standalone 으로 모은다
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
