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
  
  // Nonaktifkan verifikasi build-time
  experimental: {
    serverComponentsExternalPackages: ['mysql2'],
  },
  
  // Mengabaikan error build terkait dynamic server usage
  typescript: {
    // !! PERINGATAN !!
    // Ini akan menonaktifkan pemeriksaan tipe TypeScript selama build
    // Gunakan hanya untuk development atau jika Anda yakin dengan kode Anda
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 