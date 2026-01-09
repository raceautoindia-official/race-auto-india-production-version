import withPlaiceholder from "@plaiceholder/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
  images: {
    loader: 'custom',
    loaderFile: './app/loader.js',
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
    ],
  },
   typescript: {
      // ❗️Allows production builds to successfully complete even if your project has type errors.
      ignoreBuildErrors: true,
   },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPlaiceholder(nextConfig);
