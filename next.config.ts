import type { NextConfig } from "next";

// When this category app is served as one zone of a larger portal (multi-zone
// rewrites from a root app), set NEXT_PUBLIC_BASE_PATH to the path it is
// mounted at -- e.g. NEXT_PUBLIC_BASE_PATH=/input-and-localization. Left
// unset, the app serves from the domain root, which is what you want while
// developing it standalone. Next.js prefixes <Link> hrefs and asset URLs
// automatically, so no page code changes either way.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
