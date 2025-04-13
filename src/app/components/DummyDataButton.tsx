'use client';

import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function DummyDataButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (shouldRefresh && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (shouldRefresh && countdown === 0) {
      window.location.reload();
    }
    return () => clearTimeout(timer);
  }, [shouldRefresh, countdown]);

  const addDummyData = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    setDetails(null);
    setShouldRefresh(false);
    
    try {
      console.log('DummyDataButton: Memulai inisialisasi database melalui API...');
      
      // Gunakan API endpoint untuk inisialisasi database
      const response = await fetch('/api/init-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || `Error status ${response.status}`);
      }
      
      const result = await response.json();
      console.log('DummyDataButton: Hasil dari API:', result);
      
      if (result.success) {
        setMessage(result.message || 'Database berhasil diinisialisasi dengan data contoh.');
        if (result.tables) {
          setDetails({ tables: result.tables });
        }
        if (result.refreshNeeded) {
          setShouldRefresh(true);
          setCountdown(5);
        }
      } else {
        throw new Error(result.error || 'Terjadi kesalahan saat inisialisasi database');
      }
    } catch (err) {
      console.error('DummyDataButton: Error saat inisialisasi database:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 border rounded-lg shadow-sm">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2">Perbaikan Struktur Tabel Database</h2>
          <p className="text-gray-600 mb-4">
            Gunakan tombol di bawah untuk memperbaiki struktur tabel yang diperlukan (users, customers, locations, reports) dan mengisi data contoh.
            Proses ini akan menambahkan kolom yang kurang dan membuat tabel yang belum ada.
          </p>
          
          <button
            onClick={addDummyData}
            disabled={loading || shouldRefresh}
            className={`
              px-4 py-2 rounded-lg text-white font-medium w-full md:w-auto
              ${loading || shouldRefresh ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {loading ? 'Sedang Memperbaiki...' : shouldRefresh ? `Refresh otomatis dalam ${countdown}s...` : 'Perbaiki Struktur Tabel Database'}
          </button>
          
          {message && (
            <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg border border-green-100 flex items-start">
              <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-green-500" />
              <div>
                <p className="font-medium">{message}</p>
                {shouldRefresh && (
                  <p className="mt-1 text-sm">Halaman akan di-refresh otomatis dalam {countdown} detik...</p>
                )}
                {details && details.tables && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Tabel yang ada di database:</p>
                    <ul className="mt-1 text-sm list-disc list-inside">
                      {details.tables.map((table: string) => (
                        <li key={table}>{table}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg border border-red-100 flex items-start">
              <XCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
              <div>
                <p className="font-medium">Error: {error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-2 text-sm font-medium px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 inline-flex items-center"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 