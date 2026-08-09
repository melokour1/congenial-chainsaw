/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@laxvaletcare/shared', '@laxvaletcare/config'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
