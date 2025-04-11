'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { createShipment, getServiceTypes, getLocations } from '@/app/actions';
import { useAuthContext } from '@/context/AuthContext';

// Tipe data untuk form
type ShipmentFormData = {
  serviceTypeId: number;
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  originCity: string;
  destinationCity: string;
  weight: number;
  price: number;
};

export default function AdminCreateShipmentPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [loadingPrice, setLoadingPrice] = useState(false);
  
  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<ShipmentFormData>({
    defaultValues: {
      serviceTypeId: 0,
      senderName: '',
      senderAddress: '',
      senderPhone: '',
      recipientName: '',
      recipientAddress: '',
      recipientPhone: '',
      originCity: '',
      destinationCity: '',
      weight: 1,
      price: 0
    }
  });
  
  // Redirect jika bukan admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, user, router]);
  
  // Load data service dan lokasi
  useEffect(() => {
    async function loadData() {
      try {
        // Load service types
        const serviceTypesData = await getServiceTypes();
        setServiceTypes(serviceTypesData);
        
        // Load locations
        const locationsData = await getLocations();
        setLocations(locationsData.locations);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Gagal memuat data. Silakan coba lagi.');
      }
    }
    
    if (isAuthenticated && user?.role === 'admin') {
      loadData();
    }
  }, [isAuthenticated, user]);
  
  // Update harga ketika weight, originCity, destinationCity, atau serviceTypeId berubah
  const watchWeight = watch('weight');
  const watchOriginCity = watch('originCity');
  const watchDestinationCity = watch('destinationCity');
  const watchServiceTypeId = watch('serviceTypeId');
  
  useEffect(() => {
    // Hanya hitung jika semua field yang diperlukan sudah diisi
    if (watchWeight && watchOriginCity && watchDestinationCity && watchServiceTypeId) {
      setLoadingPrice(true);
      
      // Hitung base price dari service type yang dipilih
      const selectedService = serviceTypes.find(st => st.id === Number(watchServiceTypeId));
      if (selectedService) {
        const basePrice = selectedService.basePrice || 0;
        // Rumus sederhana: harga = berat * harga dasar
        const calculatedPrice = watchWeight * basePrice;
        setCalculatedPrice(calculatedPrice);
        setValue('price', calculatedPrice);
      }
      
      setLoadingPrice(false);
    }
  }, [watchWeight, watchOriginCity, watchDestinationCity, watchServiceTypeId, serviceTypes, setValue]);
  
  const onSubmit = async (data: ShipmentFormData) => {
    setLoading(true);
    
    try {
      // Konversi serviceTypeId ke number
      const formattedData = {
        ...data,
        serviceTypeId: Number(data.serviceTypeId),
        weight: Number(data.weight),
        price: Number(data.price)
      };
      
      const result = await createShipment(formattedData);
      
      if (result.success) {
        toast.success('Pengiriman berhasil dibuat!');
        router.push('/admin/shipments');
      } else {
        toast.error('Gagal membuat pengiriman');
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast.error('Terjadi kesalahan saat membuat pengiriman');
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
        <h1 className="text-2xl mb-6 text-black">Buat Pengiriman Baru</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Jenis Layanan */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg text-black mb-4">Informasi Layanan</h2>
            <div className="mb-4">
              <label htmlFor="serviceTypeId" className="block text-sm font-medium text-black mb-1">
                Jenis Layanan
              </label>
              <select
                id="serviceTypeId"
                {...register('serviceTypeId', { required: 'Jenis layanan harus dipilih' })}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Jenis Layanan</option>
                {serviceTypes.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.estimatedTime})
                  </option>
                ))}
              </select>
              {errors.serviceTypeId && (
                <p className="mt-1 text-sm text-red-600">{errors.serviceTypeId.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-black mb-1">
                  Berat (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  min="0.1"
                  step="0.1"
                  {...register('weight', { 
                    required: 'Berat wajib diisi',
                    min: { value: 0.1, message: 'Berat minimal 0.1 kg' }
                  })}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.weight && (
                  <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="originCity" className="block text-sm font-medium text-black mb-1">
                  Kota Asal
                </label>
                <select
                  id="originCity"
                  {...register('originCity', { required: 'Kota asal harus dipilih' })}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Kota Asal</option>
                  {locations.map(location => (
                    <option key={`origin-${location.id}`} value={location.city}>
                      {location.city}, {location.province}
                    </option>
                  ))}
                </select>
                {errors.originCity && (
                  <p className="mt-1 text-sm text-red-600">{errors.originCity.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="destinationCity" className="block text-sm font-medium text-black mb-1">
                  Kota Tujuan
                </label>
                <select
                  id="destinationCity"
                  {...register('destinationCity', { required: 'Kota tujuan harus dipilih' })}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Kota Tujuan</option>
                  {locations.map(location => (
                    <option key={`dest-${location.id}`} value={location.city}>
                      {location.city}, {location.province}
                    </option>
                  ))}
                </select>
                {errors.destinationCity && (
                  <p className="mt-1 text-sm text-red-600">{errors.destinationCity.message}</p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-black mb-1">
                Biaya Pengiriman
              </label>
              <div className="bg-blue-50 p-3 rounded-md flex items-center">
                <span className="text-lg text-black">
                  Rp {calculatedPrice.toLocaleString('id-ID')}
                </span>
                {loadingPrice && (
                  <LoadingSpinner size="sm" className="ml-2" />
                )}
                <input type="hidden" {...register('price')} />
              </div>
            </div>
          </div>
          
          {/* Informasi Pengirim */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg text-black mb-4">Informasi Pengirim</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="senderName" className="block text-sm text-black mb-1">
                  Nama Pengirim
                </label>
                <input
                  type="text"
                  id="senderName"
                  {...register('senderName', { required: 'Nama pengirim wajib diisi' })}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.senderName && (
                  <p className="mt-1 text-sm text-red-600">{errors.senderName.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="senderPhone" className="block text-sm text-black mb-1">
                  Nomor Telepon Pengirim
                </label>
                <input
                  type="tel"
                  id="senderPhone"
                  {...register('senderPhone', { required: 'Nomor telepon pengirim wajib diisi' })}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.senderPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.senderPhone.message}</p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <label htmlFor="senderAddress" className="block text-sm text-black mb-1">
                Alamat Pengirim
              </label>
              <textarea
                id="senderAddress"
                rows={3}
                {...register('senderAddress', { required: 'Alamat pengirim wajib diisi' })}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
              {errors.senderAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.senderAddress.message}</p>
              )}
            </div>
          </div>
          
          {/* Informasi Penerima */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg text-black mb-4">Informasi Penerima</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="recipientName" className="block text-sm text-black mb-1">
                  Nama Penerima
                </label>
                <input
                  type="text"
                  id="recipientName"
                  {...register('recipientName', { required: 'Nama penerima wajib diisi' })}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.recipientName && (
                  <p className="mt-1 text-sm text-red-600">{errors.recipientName.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="recipientPhone" className="block text-sm text-black mb-1">
                  Nomor Telepon Penerima
                </label>
                <input
                  type="tel"
                  id="recipientPhone"
                  {...register('recipientPhone', { required: 'Nomor telepon penerima wajib diisi' })}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.recipientPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.recipientPhone.message}</p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <label htmlFor="recipientAddress" className="block text-sm text-black mb-1">
                Alamat Penerima
              </label>
              <textarea
                id="recipientAddress"
                rows={3}
                {...register('recipientAddress', { required: 'Alamat penerima wajib diisi' })}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
              {errors.recipientAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.recipientAddress.message}</p>
              )}
            </div>
          </div>
          
          {/* Tombol Aksi */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/shipments')}
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
                'Buat Pengiriman'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 