/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: {
      // pose-detection statically imports BlazePose's @mediapipe/pose runtime,
      // which has no ESM exports and breaks bundling. We only use MoveNet, so
      // alias it to a stub. See lib/mediapipe-pose-stub.js.
      "@mediapipe/pose": "./lib/mediapipe-pose-stub.js",
    },
  },
  async headers() {
    const ONE_WEEK = 60 * 60 * 24 * 7 // 604800 seconds

    return [
      {
        // HTML pages: allow caching for one week, but revalidate in the
        // background so returning visitors always get fresh content.
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${ONE_WEEK}, stale-while-revalidate=${ONE_WEEK}`,
          },
        ],
      },
      {
        // Next.js JS/CSS chunks have content-hashed filenames — cache them
        // aggressively for one week (they auto-bust on every deploy).
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${ONE_WEEK}, immutable`,
          },
        ],
      },
    ]
  },
}

export default nextConfig
