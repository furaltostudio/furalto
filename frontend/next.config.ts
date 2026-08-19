import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Keep Turbopack rooted at frontend/ so a parent package-lock.json cannot
  // become the workspace root and break loading of frontend/.env.local.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
  // Old room → furniture-type URLs → flat furniture-type collections
  async redirects() {
    const oldRooms = [
      "living-room",
      "bedroom",
      "outdoor",
      "dining",
      "bath",
      "office",
      "art-mirrors",
      "decor",
      "sale",
    ];

    return oldRooms.map((room) => ({
      source: `/collections/${room}/:sub`,
      destination: "/collections/:sub",
      permanent: true,
    }));
  },
};

export default nextConfig;
