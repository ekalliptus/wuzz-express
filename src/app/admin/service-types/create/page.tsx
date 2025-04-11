'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthContext } from '@/context/AuthContext';
import { useServiceType } from '@/hooks/useServiceType';

// Tipe data untuk form
type ServiceTypeFormData = {
  code: string;
  name: string;
  description: string;
  estimationDays: number;
  basePrice: number;
};

export default function CreateServiceTypePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();
  const { createServiceType } = useServiceType();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ServiceTypeFormData>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      estimationDays: 1,
      basePrice: 1000
    }
  });
  
  // Redirect jika bukan admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, user, router]);
  
  const onSubmit = async (data: ServiceTypeFormData) => {
    setLoading(true);
    
    try {
      const result = await createServiceType({
        code: data.code,
        name: data.name,
        description: data.description,
        estimationDays: Number(data.estimationDays),
        basePrice: Number(data.basePrice)
      });
      
      if (result.success) {
        toast.success('Jenis layanan berhasil dibuat!');
        router.push('/admin/service-types');
      } else {
        toast.error(result.error || 'Gagal membuat jenis layanan');
      }
    } catch (error) {
      console.error('Error creating service type:', error);
      toast.error('Terjadi kesalahan saat membuat jenis layanan');
    } finally {
      setLoading(false);
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-black">Tambah Jenis Layanan</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-black mb-1">
                Kode Layanan
              </label>
              <input
                type="text"
                id="code"
                {...register('code', { required: 'Kode layanan wajib diisi' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Contoh: REG, NEXT, SAMEDAY"
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black mb-1">
                Nama Layanan
              </label>
              <input
                type="text"
                id="name"
                {...register('name', { required: 'Nama layanan wajib diisi' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Contoh: Reguler, Next Day, Same Day"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-black mb-1">
              Deskripsi
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description', { required: 'Deskripsi wajib diisi' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Deskripsi jenis layanan"
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="estimationDays" className="block text-sm font-medium text-black mb-1">
                Estimasi Hari
              </label>
              <input
                type="number"
                id="estimationDays"
                min="1"
                step="1"
                {...register('estimationDays', { 
                  required: 'Estimasi hari wajib diisi',
                  min: { value: 1, message: 'Estimasi minimal 1 hari' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
              />
              {errors.estimationDays && (
                <p className="mt-1 text-sm text-red-600">{errors.estimationDays.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="basePrice" className="block text-sm font-medium text-black mb-1">
                Harga Dasar (per kg)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-black sm:text-sm">Rp</span>
                </div>
                <input
                  type="number"
                  id="basePrice"
                  min="1000"
                  step="100"
                  {...register('basePrice', { 
                    required: 'Harga dasar wajib diisi',
                    min: { value: 1000, message: 'Harga minimal Rp 1.000' }
                  })}
                  className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
              {errors.basePrice && (
                <p className="mt-1 text-sm text-red-600">{errors.basePrice.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/service-types')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 