'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type AdminLayoutWrapperProps = {
  children: React.ReactNode;
};

/**
 * AdminLayoutWrapper - Komponen yang menangani otentikasi dan otorisasi admin
 * Memisahkan logika bisnis dari komponen presentasi
 */
export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const router = useRouter();
  const { user, isAuthenticated, loading, checkAuthStatus } = useAuthContext();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasVerified, setHasVerified] = useState(false);

  // Memindahkan fungsi ke useCallback untuk performa
  const verifyAuth = useCallback(async () => {
    // Hindari verifikasi berulang
    if (hasVerified) return;
    
    console.log("Mulai verifikasi autentikasi admin");
    try {
      const isAuth = await checkAuthStatus();
      console.log("Status autentikasi:", isAuth, "User:", user);
      
      if (!isAuth) {
        console.log("Tidak terotentikasi, arahkan ke login");
        router.push('/auth/login');
        return;
      }
      
      // Pastikan user role adalah 'admin' (string literal check)
      // Gunakan data user dari localStorage untuk memastikan konsistensi
      const storedUser = localStorage.getItem('wuzz_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.role === 'admin') {
          console.log("User adalah admin:", parsedUser.role);
          setHasVerified(true);
          return;
        }
      }
      
      if (!user || user.role !== 'admin') {
        console.log('User bukan admin:', user);
        router.push('/public');
        return;
      }
    } finally {
      setIsVerifying(false);
      setHasVerified(true);
    }
  }, [checkAuthStatus, router, user, hasVerified]);

  // Verifikasi otentikasi hanya sekali saat komponen mount
  useEffect(() => {
    if (isVerifying && !hasVerified && !loading) {
      verifyAuth();
    }
  }, [verifyAuth, isVerifying, loading, hasVerified]);

  // Loading state saat verifikasi awal
  if (loading || isVerifying) {
    return <LoadingSpinner />;
  }

  // Render content hanya jika terautentikasi sebagai admin
  if (isAuthenticated && user && user.role === 'admin') {
    console.log('AdminLayoutWrapper: Rendering admin content, user is authenticated admin');
    return <>{children}</>;
  }

  console.log('AdminLayoutWrapper: Not rendering, authentication failed', { isAuthenticated, userRole: user?.role });
  return null;
} 