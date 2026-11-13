import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 브라우저(notice-map)에서 쓰도록 빌드 시 번들에 넣는다. Client ID는 공개값이라 OK
  env: { NAVER_MAP_CLIENT_ID: process.env.NAVER_MAP_CLIENT_ID ?? "" },
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
