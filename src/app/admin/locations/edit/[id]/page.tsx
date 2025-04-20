'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLocationById, updateLocation } from '@/app/actions';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { provinces } from '@/app/constants';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string | null;
  isActive: boolean;
}

export default function EditLocationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Location>({
    id: '',
    name: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    notes: '',
    isActive: true
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await getLocationById(params.id);
        if (location) {
          setFormData({
            ...location,
            notes: location.notes || ''
          });
        } else {
          setErrors({ submit: 'Lokasi tidak ditemukan.' });
        }
      } catch (error) {
        console.error('Failed to fetch location data:', error);
        setErrors({ submit: 'Gagal mengambil data lokasi. Silakan coba lagi.' });
      } finally {
        setLoadingData(false);
      }
    };

    fetchLocation();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nama lokasi diperlukan';
    if (!formData.address.trim()) newErrors.address = 'Alamat diperlukan';
    if (!formData.city.trim()) newErrors.city = 'Kota diperlukan';
    if (!formData.province.trim()) newErrors.province = 'Provinsi diperlukan';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Kode pos diperlukan';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await updateLocation(params.id, formData);
      router.push('/admin/locations');
      router.refresh();
    } catch (error) {
      console.error('Failed to update location:', error);
      setErrors({ submit: 'Gagal memperbarui lokasi. Silakan coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm flex justify-center items-center h-64">
        <p className="text-gray-600">Memuat data lokasi...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.back()} 
          className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-700"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Lokasi</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nama Lokasi
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Contoh: Gudang Jakarta Pusat"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="province" className="block text-sm font-medium text-gray-700">
              Provinsi
            </label>
            <select
              id="province"
              name="province"
              value={formData.province}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.province ? 'border-red-500' : ''}`}
            >
              <option value="">Pilih Provinsi</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
            {errors.province && <p className="mt-1 text-sm text-red-600">{errors.province}</p>}
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              Kota
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.city ? 'border-red-500' : ''}`}
              placeholder="Contoh: Jakarta Pusat"
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
              Kode Pos
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.postalCode ? 'border-red-500' : ''}`}
              placeholder="Contoh: 10110"
            />
            {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Alamat Lengkap
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.address ? 'border-red-500' : ''}`}
              placeholder="Masukkan alamat lengkap lokasi"
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Catatan (Opsional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Catatan tambahan tentang lokasi ini"
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Lokasi Aktif
              </label>
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
} 