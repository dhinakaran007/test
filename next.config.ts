import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Only add node-loader for server-side compilation
    if (isServer) {
      config.module.rules.push({
        test: /\.node$/,
        use: 'node-loader',
      });

      // Fix Realm's optional dependencies warning
      config.externals.push({
        realm: 'commonjs realm',
      });
    }

    return config;
  },
  experimental: {
    // Needed for Realm's ESM compatibility
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['realm'],
  },
  // Optional: Enable React Strict Mode
  reactStrictMode: true,
};

export default nextConfig;