import type { NextConfig } from "next";

/*
 * DEV
 * - reactStrictMode false: Leaflet MapContainer vs Strict Mode double-mount in dev.
 * - Do not set webpack cache false in dev: it can break HMR and cause
 *   "Cannot read properties of undefined (reading 'call')" in webpack.js.
 * - If chunks look stale: npm run clean && restart dev; hard-refresh the browser (⌘⇧R).
 * - rewrites: only when NODE_ENV=development; production uses NEXT_PUBLIC_API_URL on the client.
 */
const nextConfig: NextConfig = {
  reactStrictMode: false,
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }
    const base = (process.env.DEV_API_PROXY ?? "http://127.0.0.1:8000").replace(/\/$/, "");
    return [{ source: "/api/:path*", destination: `${base}/api/:path*` }];
  },
};

export default nextConfig;
