import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fal.media",
      },
      {
        protocol: "https",
        hostname: "v1.fal.media",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
  serverExternalPackages: ["firebase-admin", "firebase-admin/firestore", "firebase-admin/storage"],
};

export default nextConfig;
