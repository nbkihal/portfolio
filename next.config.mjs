/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Three.js ships untranspiled ESM helpers that Next needs to compile.
  transpilePackages: ["three"],
};

export default nextConfig;
