import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Bypass the dev-time image optimizer — third-party CDNs (Unsplash,
    // randomuser, dicebear) sporadically time out the optimizer and leave
    // images blank. Direct fetches from the browser are reliable.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "d2kun19yxkbvdw.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "vipme2023.s3.us-east-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
    ],
  },
};

export default nextConfig;
