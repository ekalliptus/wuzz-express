import type { Metadata } from "next";
import "./globals.css";
import { geistSans, geistMono } from "@/lib/fonts";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Wuzz Express | Layanan Pengiriman Antar Kota, Provinsi, dan Pulau",
  description: "Wuzz Express menyediakan layanan pengiriman barang antar kota, provinsi, dan pulau dengan pelacakan real-time dan harga terjangkau.",
};

/**
 * RootLayout - Layout utama aplikasi
 * Pendekatan minimalis untuk halaman root
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
