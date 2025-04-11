/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: ["images.unsplash.com"],
  },
  
  // Konfigurasi rewrite untuk mengarahkan akses ke "/" menuju "/public"
  // tanpa mengubah URL di browser
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/public',
      },
    ];
  },
};

module.exports = nextConfig; 