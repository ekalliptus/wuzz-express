'use client';

import { FunctionComponent, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { geistSans, geistMono } from '@/lib/fonts';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

/**
 * AuthLayout - Layout khusus untuk halaman autentikasi
 * Menyediakan tampilan konsisten dengan logo dan informasi
 */
const AuthLayout: FunctionComponent<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = true
}) => {
  const router = useRouter();

  // Menggunakan useCallback untuk handle back navigation
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Menggunakan useMemo untuk logo component
  const logoComponent = useMemo(() => (
    <div className="flex flex-col items-center justify-center mb-2">
      <div className="flex items-center">
        <Image
          src="/wuzz-logo.svg"
          alt="Wuzz Express Logo"
          width={40}
          height={40}
          className="h-10 w-10"
          priority
        />
        <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Wuzz</span>
        <span className="text-sm font-semibold ml-1 text-gray-600">Express</span>
      </div>
    </div>
  ), []);

  // Menggunakan useMemo untuk header component
  const headerComponent = useMemo(() => (
    <div className="text-center">
      {logoComponent}
      <h2 className="mt-3 text-2xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
    </div>
  ), [logoComponent, title, subtitle]);

  // Menggunakan useMemo untuk back button component
  const backButtonComponent = useMemo(() => (
    showBackButton && (
      <button
        onClick={handleBack}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Kembali ke halaman sebelumnya"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Kembali
      </button>
    )
  ), [showBackButton, handleBack]);

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md w-full space-y-4 bg-white p-6 rounded-xl shadow-lg">
        {backButtonComponent}
        {headerComponent}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout; 