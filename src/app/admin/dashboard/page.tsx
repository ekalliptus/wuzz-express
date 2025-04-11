'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import AdminDashboard from '@/app/admin/AdminDashboard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import DummyDataButton from '@/app/components/DummyDataButton';

export default function AdminDashboardPage() {
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [showDataInitialization, setShowDataInitialization] = useState(false);
  const [tableCheckResult, setTableCheckResult] = useState<any>(null);
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();

  // Memeriksa apakah tabel tersedia
  useEffect(() => {
    const checkTables = async () => {
      try {
        // Coba mengakses API pengecekan tabel
        const response = await fetch('/api/table-check');
        if (!response.ok) {
          throw new Error('Failed to check tables');
        }
        
        const data = await response.json();
        setTableCheckResult(data);
        
        // Tampilkan banner inisialisasi jika ada masalah dengan tabel
        if (!data.is_complete) {
          setShowDataInitialization(true);
        }
      } catch (err) {
        // Jika error, kemungkinan tabel tidak ada
        console.error('Error checking tables:', err);
        setShowDataInitialization(true);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      checkTables();
    }
  }, [isAuthenticated, user]);

  // Redirect jika bukan admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      router.push('/auth/login');
    } else if (isAuthenticated) {
      setIsLoadingDashboard(false);
    }
  }, [authLoading, isAuthenticated, user, router]);

  if (authLoading || isLoadingDashboard) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {showDataInitialization && tableCheckResult && (
        <div className="mb-8 p-6 bg-yellow-50 border border-yellow-300 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-800 mb-3">Masalah dengan Tabel Database</h2>
          
          {tableCheckResult.missing_tables && tableCheckResult.missing_tables.length > 0 && (
            <div className="mb-4">
              <p className="text-yellow-700 font-medium">Tabel yang tidak ditemukan:</p>
              <ul className="list-disc list-inside ml-4 mt-1 text-yellow-700">
                {tableCheckResult.missing_tables.map((table: string) => (
                  <li key={table}>{table}</li>
                ))}
              </ul>
            </div>
          )}
          
          {tableCheckResult.tables_wrong_case && tableCheckResult.tables_wrong_case.length > 0 && (
            <div className="mb-4">
              <p className="text-yellow-700 font-medium">Tabel dengan nama yang tidak sesuai (case-sensitive):</p>
              <ul className="list-disc list-inside ml-4 mt-1 text-yellow-700">
                {tableCheckResult.tables_wrong_case.map((table: any) => (
                  <li key={table.expected}>
                    Diharapkan: <code>{table.expected}</code>, Ditemukan: <code>{table.schema}.{table.actual}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {tableCheckResult.table_problems && tableCheckResult.table_problems.length > 0 && (
            <div className="mb-4">
              <p className="text-yellow-700 font-medium">Masalah struktur tabel:</p>
              <ul className="list-disc list-inside ml-4 mt-1 text-yellow-700">
                {tableCheckResult.table_problems.map((problem: any, index: number) => (
                  <li key={index}>
                    Tabel <code>{problem.table}</code>: 
                    {problem.problem === 'missing_columns' && (
                      <span> Kolom yang tidak ditemukan: <code>{problem.details.join(', ')}</code></span>
                    )}
                    {problem.problem === 'error_checking' && (
                      <span> Error saat memeriksa: {problem.details}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <p className="text-yellow-700 mb-4">
            Aplikasi memerlukan tabel dengan nama persis <code>customers</code>, <code>locations</code>, dan <code>reports</code> 
            (lowercase). Gunakan tombol di bawah untuk membuat dan mengisi tabel-tabel tersebut.
          </p>
          
          <DummyDataButton />
        </div>
      )}
      
      <AdminDashboard user={user} />
    </div>
  );
} 