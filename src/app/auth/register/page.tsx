'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  
  return (
    <div className="text-center mx-auto max-w-md w-full">
      <h1 className="text-2xl font-bold mb-2">Daftar Akun Baru</h1>
      <p className="text-gray-600 mb-6">Halaman ini masih dalam pengembangan</p>
      
      <div className="p-8">
        <p className="text-gray-600 mb-4">
          Fitur registrasi akan segera tersedia.
        </p>
        <button
          onClick={() => router.push('/auth/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Kembali ke Login
        </button>
      </div>
    </div>
  );
} 