/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['rzdoygryvifvcmhhbiaq.supabase.co'],
  },
  // Add performance and memory optimization options
  webpack: (config, { isServer }) => {
    // Optimize webpack memory usage
    config.optimization.moduleIds = 'deterministic';
    
    // Reduce the size of included modules
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 20000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Get the name of the npm package
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `npm.${packageName.replace('@', '')}`;
            },
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;
