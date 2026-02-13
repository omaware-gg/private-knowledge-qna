/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel serverless functions: increase timeout for embedding-heavy uploads
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
