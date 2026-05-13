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
  // The / → /mull.html rewrite was removed at v2 cutover. The new
  // editorial homepage at app/page.tsx is now what / serves. The
  // mull.html file stays in /public until the rest of the redesign
  // (archetype + philosopher restyles) lands, so we have a quick
  // rollback path: re-add the rewrite if anything's broken.
};

export default nextConfig;