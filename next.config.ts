import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this directory. Without this,
  // Next infers the wrong root when run from a git worktree (it
  // walks up to the parent checkout's lockfile and treats *that*
  // directory as root, which means new files in the worktree are
  // never picked up). The pin is harmless in production builds.
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/mull.html",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;