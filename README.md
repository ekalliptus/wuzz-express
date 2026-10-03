# Wuzz Express

Aplikasi web layanan pengiriman barang antar kota, provinsi, dan pulau. Dibangun dengan Next.js 14 dan menyediakan pelacakan kiriman publik, portal pelanggan, area staf, serta dashboard admin.

## Fitur

- Halaman publik: lacak kiriman, cek tarif, cakupan lokasi, dan kontak
- Registrasi dan login pelanggan serta driver
- Dashboard admin: pengiriman, pelanggan, driver, lokasi, jenis layanan, laporan, dan pengaturan
- Panel staf untuk pemrosesan pengiriman
- Peta interaktif berbasis Leaflet

## Teknologi

Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Zustand, PostgreSQL (Neon / Vercel Postgres), Leaflet.

## Menjalankan

```bash
npm install
npm run dev
```

Atur koneksi database PostgreSQL pada `.env`, lalu buka http://localhost:3000. Endpoint `POST /api/init-database` tersedia untuk inisialisasi tabel.

## Lisensi

MIT
