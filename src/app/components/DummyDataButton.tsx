'use client';

import { useState } from 'react';
import { neon } from '@neondatabase/serverless';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function DummyDataButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);

  const addDummyData = async () => {
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
      
      const customersSQL = await customersResp.text();
      const locationsSQL = await locationsResp.text();
      const reportsSQL = await reportsResp.text();
      
      // Mengirim request untuk membuat table dan menambahkan data dummy
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
        setMessage(result.message || 'Data dummy berhasil ditambahkan');
        setDetails(result);
      } else {
        throw new Error(result.error || 'Gagal menambahkan data dummy');
      }
    } catch (err) {
      console.error('Error adding dummy data:', err);
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
          <h2 className="text-lg font-semibold mb-2">Inisialisasi Tabel Database</h2>
          <p className="text-gray-600 mb-4">
            Gunakan tombol di bawah untuk membuat dan mengisi tabel yang diperlukan (customers, locations, reports) dengan data contoh.
            Data yang sudah ada di tabel lain tidak akan terpengaruh.
          </p>
          
          <button
            onClick={addDummyData}
            disabled={loading}
            className={`
              px-4 py-2 rounded-lg text-white font-medium w-full md:w-auto
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {loading ? 'Sedang Menginisialisasi...' : 'Buat Tabel Database'}
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