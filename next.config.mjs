/** @type {import('next').NextConfig} */
import withPWA from "@ducanh2912/next-pwa";

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            }
        ]
    },
    // Reduce ChunkLoadError in dev: keep more pages in buffer and longer
    onDemandEntries: {
        maxInactiveAge: 60 * 1000,
        pagesBufferLength: 5,
    },
    // Shrink chunks that use Firebase so layout/auth chunk loads faster
    experimental: {
        optimizePackageImports: ['firebase/auth', 'firebase/app', 'firebase/firestore'],
    },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default pwaConfig(nextConfig);
