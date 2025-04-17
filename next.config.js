/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add or modify the images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rzdoygryvifvcmhhbiaq.supabase.co', // Your Supabase project hostname
        port: '',
        pathname: '/storage/v1/object/public/**', // Allow any path within the public storage
      },
      // Add other allowed hostnames here if needed
    ],
  },
  // ... any other existing configurations
};

module.exports = nextConfig;
