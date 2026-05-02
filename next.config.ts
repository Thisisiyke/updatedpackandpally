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
    ],
  },
};

export default nextConfig;
