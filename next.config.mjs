/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "limbus-assets.eldritchtools.com",
        pathname: "/**",
      },
      {
        // Youtube thumbnails
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**"
      }
    ]
  },
  env: {
    NEXT_PUBLIC_LAST_UPDATED: new Date().toISOString(),
  },

  async redirects() {
    return [
      {
        source: '/keyword-solver',
        destination: '/team-solver',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
