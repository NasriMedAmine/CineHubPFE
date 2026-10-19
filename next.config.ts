import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Le service worker ne doit jamais être mis en cache par le navigateur,
  // sinon les mises à jour de sw.js ne seraient pas prises en compte.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
};

export default nextConfig;
