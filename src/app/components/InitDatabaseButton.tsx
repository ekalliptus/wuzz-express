'use client';

import { useState } from 'react';
import { ShieldCheckIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function InitDatabaseButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);

  const initDatabase = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    setDetails(null);
    
    try {
      // Membaca file SQL
      const customersResp = await fetch('/api/sql/customers');
      const locationsResp = await fetch('/api/sql/locations');
      const reportsResp = await fetch('/api/sql/reports');
      
      if (!customersResp.ok || !locationsResp.ok || !reportsResp.ok) {
        throw new Error('Gagal membaca file SQL');
      }
      
      let customersSQL = await customersResp.text();
      let locationsSQL = await locationsResp.text();
      let reportsSQL = await reportsResp.text();
      
      // Menghapus bagian INSERT pada semua SQL
      customersSQL = removeInserts(customersSQL);
      locationsSQL = removeInserts(locationsSQL);
      reportsSQL = removeInserts(reportsSQL);
      
      // Mengirim request untuk membuat struktur tabel saja
      const response = await fetch('/api/init-tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customers: customersSQL,
          locations: locationsSQL,
          reports: reportsSQL
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setMessage(result.message || 'Struktur tabel berhasil dibuat');
        setDetails(result);
      } else {
        throw new Error(result.error || 'Gagal membuat struktur tabel');
      }
    } catch (err) {
      console.error('Error initializing database:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };
  
  // Fungsi untuk menghapus bagian INSERT pada SQL
  const removeInserts = (sql: string) => {
    const insertIndex = sql.toLowerCase().indexOf('insert into');
    if (insertIndex !== -1) {
      return sql.substring(0, insertIndex);
    }
    return sql;
  };

  return (
    <div className="bg-white p-5 border rounded-lg shadow-sm">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2">Inisialisasi Tabel Database</h2>
          <p className="text-gray-600 mb-4">
            Gunakan tombol di bawah untuk membuat struktur tabel yang diperlukan (customers, locations, reports) tanpa data contoh.
            Database akan terhubung langsung menggunakan koneksi yang sudah dikonfigurasi.
          </p>
          
          <button
            onClick={initDatabase}
            disabled={loading}
            className={`
              px-4 py-2 rounded-lg text-white font-medium w-full md:w-auto
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {loading ? 'Sedang Menginisialisasi...' : 'Buat Struktur Tabel Database'}
          </button>
          
          {message && (
            <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg border border-green-100 flex items-start">
              <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-green-500" />
              <div>
                <p className="font-medium">{message}</p>
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