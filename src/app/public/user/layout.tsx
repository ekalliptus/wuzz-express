'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading, checkAuthStatus } = useAuth();

  useEffect(() => {
    const verifyAuth = async () => {
      // Pastikan sudah terotentikasi
      const isAuth = await checkAuthStatus();
      
      // Redirect jika belum login
      if (!isAuth) {
        router.push('/auth/login');
      }
    };

    verifyAuth();
  }, [checkAuthStatus, router]);

  // Tampilkan loading jika belum selesai cek auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Hanya tampilkan konten jika sudah autentikasi
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Fallback tampilan kosong
  return null;
} 