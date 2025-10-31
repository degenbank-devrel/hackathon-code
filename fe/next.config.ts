import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.degenbank.cc",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "shorthand.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.degenbanx.xyz",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
