import type { NextConfig } from "next";

const apiProxyTarget = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@gelato/gelato-core"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/:path*`
      }
    ];
  }
};

export default nextConfig;
