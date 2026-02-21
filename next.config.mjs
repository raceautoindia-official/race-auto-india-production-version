import withPlaiceholder from "@plaiceholder/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  },

  // ✅ Step 1: Canonical redirects
  async redirects() {
    return [
      // www -> non-www
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.raceautoindia.com" }],
        destination: "https://raceautoindia.com/:path*",
        permanent: true,
      },

      // http -> https (only when host is already apex)
      {
        source: "/:path*",
        has: [
          { type: "host", value: "raceautoindia.com" },
          { type: "header", key: "x-forwarded-proto", value: "http" },
        ],
        destination: "https://raceautoindia.com/:path*",
        permanent: true,
      },
    ];
  },
productionBrowserSourceMaps: true,

images: {
  // ✅ Let Next.js optimize images (WebP/AVIF)
  formats: ["image/avif", "image/webp"],

  remotePatterns: [
    // ✅ Your S3 bucket
    {
      protocol: "https",
      hostname: "raceautonextjs-bucket.s3.ap-south-1.amazonaws.com",
      pathname: "/**",
    },

    // ✅ If you use CDN domain (keep it even if not used yet)
    {
      protocol: "https",
      hostname: "cdn.raceautoindia.com",
      pathname: "/**",
    },

    // ✅ Optional: local testing
    {
      protocol: "http",
      hostname: "localhost",
      port: "3000",
      pathname: "/**",
    },
    {
      protocol: "http",
      hostname: "localhost",
      port: "9000",
      pathname: "/**",
    },
  ],

  deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

  minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
},


  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPlaiceholder(nextConfig);
