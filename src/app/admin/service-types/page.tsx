'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthContext } from '@/context/AuthContext';
import { useServiceType } from '@/hooks/useServiceType';

export default function ServiceTypesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();
  const { 
    serviceTypes, 
    loading: serviceTypesLoading, 
    error, 
    fetchServiceTypes,
    deleteServiceType
  } = useServiceType();
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Redirect jika bukan admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, user, router]);
  
  // Load jenis layanan
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      console.log('Fetching service types...');
      fetchServiceTypes().then(data => {
        console.log('Fetched service types:', data);
      }).catch(err => {
        console.error('Error fetching service types:', err);
      });
    }
  }, [isAuthenticated, user, fetchServiceTypes]);
  
  // Handler untuk menghapus jenis layanan
  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jenis layanan ini?')) {
      setDeleting(id);
      
      try {
        const result = await deleteServiceType(id);
        
        if (result.success) {
          toast.success('Jenis layanan berhasil dihapus');
        } else {
          toast.error(result.error || 'Gagal menghapus jenis layanan');
        }
      } catch (error) {
        console.error('Error deleting service type:', error);
        toast.error('Terjadi kesalahan saat menghapus jenis layanan');
      } finally {
        setDeleting(null);
      }
    }
  };
  
  // Tampilkan loading saat cek auth
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Hanya tampilkan konten jika terotentikasi sebagai admin
  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return null;
  }

  console.log('Current serviceTypes:', serviceTypes);
  console.log('Loading state:', serviceTypesLoading);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Jenis Layanan</h1>
          <button
            onClick={() => router.push('/admin/service-types/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Tambah Layanan
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {serviceTypesLoading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Kode
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Nama Layanan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Estimasi Waktu
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Harga Dasar
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serviceTypes.length > 0 ? (
                  serviceTypes.map(serviceType => (
                    <tr key={serviceType.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {serviceType.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {serviceType.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {serviceType.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {serviceType.estimatedTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        Rp {Number(serviceType.pricePerKg).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => router.push(`/admin/service-types/edit/${serviceType.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(serviceType.id)}
                            disabled={deleting === serviceType.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {deleting === serviceType.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <TrashIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-black">
                      Belum ada jenis layanan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 