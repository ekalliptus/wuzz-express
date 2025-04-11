'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import BaseLayout from '@/components/layouts/BaseLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import StaffSidebar from '@/components/layouts/StaffSidebar';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, loading, checkAuthStatus } = useAuthContext();

  useEffect(() => {
    const verifyAuth = async () => {
      // Pastikan sudah terotentikasi
      const isAuth = await checkAuthStatus();
      
      // Redirect jika belum login atau bukan staff
      if (!isAuth) {
        router.push('/auth/login');
      } else if (user?.role !== 'staff') {
        router.push('/');
      }
    };

    verifyAuth();
  }, [checkAuthStatus, router, user]);

  // Tampilkan loading jika belum selesai cek auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Hanya tampilkan konten jika sudah autentikasi dan rolenya staff
  if (isAuthenticated && user?.role === 'staff') {
    return (
      <BaseLayout showNavbar={false} sidebar={<StaffSidebar />}>
        <div className="bg-white min-h-screen p-4">
          {children}
        </div>
      </BaseLayout>
    );
  }

  // Fallback tampilan kosong
  return null;
} 