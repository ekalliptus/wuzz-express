import { Metadata } from 'next';
import AuthLayout from '@/components/layouts/AuthLayout';

export const metadata: Metadata = {
  title: 'Autentikasi - Wuzz Express',
  description: 'Masuk ke Wuzz Express untuk mengakses fitur admin dan staf',
};

/**
 * Komponen layout untuk halaman autentikasi
 */
export default function AuthPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayout title="">
      <div className="bg-white min-h-screen">
        {children}
      </div>
    </AuthLayout>
  );
} 