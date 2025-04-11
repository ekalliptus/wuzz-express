'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
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
  return (
    <BaseLayout showNavbar={false} sidebar={<AdminSidebar />}>
      <AdminLayoutWrapper>
        {children}
      </AdminLayoutWrapper>
    </BaseLayout>
  );
} 