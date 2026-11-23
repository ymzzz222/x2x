import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["192.168.34.56"],
  outputFileTracingExcludes: {
    "/*": ["./docs/editor/**/*"],
  },
};

export default nextConfig;
