import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  // Sanity Studio uses styled-components; enable the SWC transform.
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
