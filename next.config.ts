import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory otherwise confuses root detection.
  turbopack: { root: __dirname },
  // Lets a Cloudflare quick tunnel (cloudflared tunnel --url localhost:3000) load dev assets on a phone.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
