'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import BaseLayout from '@/components/layouts/BaseLayout';
import AdminLayoutWrapper from '@/components/layouts/AdminLayoutWrapper';
import AdminSidebar from '@/components/layouts/AdminSidebar';

/**
 * AdminAreaLayout - Layout untuk semua halaman admin
 * Menggunakan AdminLayoutWrapper untuk otentikasi dan BaseLayout untuk tampilan
 */
export default function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { checkAuthStatus, isAuthenticated, loading } = useAuthContext();
  const router = useRouter();

  // Pastikan status autentikasi selalu diverifikasi saat layout dirender
  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuthStatus();
      
      if (!isAuth) {
        console.log('Anda tidak memiliki otorisasi, mengarahkan ke halaman login');
        router.push('/auth/login');
      } else {
        console.log('Status autentikasi berhasil diverifikasi');
      }
    };
    
    verifyAuth();
  }, [checkAuthStatus, router]);

  // Tampilkan loading spinner jika sedang memeriksa status auth
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Jika belum terautentikasi dan belum loading, berarti sedang dalam proses redirect
  if (!isAuthenticated && !loading) {
    return null;
  }

  return (
    <BaseLayout showNavbar={false} sidebar={<AdminSidebar />}>
      <AdminLayoutWrapper>
        {children}
      </AdminLayoutWrapper>
    </BaseLayout>
  );
} 