/** @type {import('next').NextConfig} */

if (process.env.NODE_ENV === 'production') {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.error('ERROR: Missing required production environment variable: NEXT_PUBLIC_API_URL');
    process.exit(1);
  }
}

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
