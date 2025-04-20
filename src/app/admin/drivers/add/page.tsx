'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

// Vehicle Types
const VEHICLE_TYPES = [
  'Motor',
  'Mobil (City Car)',
  'Mobil (MPV)',
  'Mobil (SUV)',
  'Van',
  'Pick Up',
  'Box',
  'Truk Kecil',
  'Truk Sedang',
  'Truk Besar'
];

export default function AddDriver() {
  const router = useRouter();
  
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseType: '',
    vehicleType: '',
    vehiclePlate: '',
    address: '',
    status: 'available',
    notes: ''
  });
  
  // State for form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State for loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama supir harus diisi';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon harus diisi';
    } else if (!/^[0-9]{10,13}$/.test(formData.phone)) {
      newErrors.phone = 'Nomor telepon harus 10-13 digit angka';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'Nomor SIM harus diisi';
    }
    
    if (!formData.vehicleType) {
      newErrors.vehicleType = 'Jenis kendaraan harus dipilih';
    }
    
    if (!formData.vehiclePlate.trim()) {
      newErrors.vehiclePlate = 'Plat nomor kendaraan harus diisi';
    } else if (!/^[A-Z0-9 ]{5,10}$/.test(formData.vehiclePlate.toUpperCase())) {
      newErrors.vehiclePlate = 'Format plat nomor tidak valid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual API call to create driver
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Driver data to submit:', formData);
      
      // Redirect to drivers list
      router.push('/admin/drivers');
      router.refresh();
    } catch (error) {
      console.error('Error adding driver:', error);
      setErrors({
        ...errors,
        form: 'Gagal menambahkan supir. Silakan coba lagi.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Tambah Supir Baru</h1>
        <p className="text-gray-600">Isi formulir di bawah untuk menambahkan supir baru</p>
      </div>
      
      {errors.form && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{errors.form}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-6">
          {/* Informasi Dasar */}
          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-4">Informasi Dasar</h2>
            
            {/* Nama Supir */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Supir
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.name ? 'border-red-300' : 'border-gray-300'} 
                              px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="Masukkan nama lengkap"
                />
                {errors.name && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                  </div>
                )}
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            {/* Nomor Telepon */}
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.phone ? 'border-red-300' : 'border-gray-300'} 
                              px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="Contoh: 081234567890"
                />
                {errors.phone && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                  </div>
                )}
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
            
            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email (Opsional)
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.email ? 'border-red-300' : 'border-gray-300'} 
                              px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="contoh@email.com"
                />
                {errors.email && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                  </div>
                )}
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            {/* Alamat */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Masukkan alamat tempat tinggal"
              />
            </div>
          </div>
          
          {/* Informasi SIM & Kendaraan */}
          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-4">Informasi SIM & Kendaraan</h2>
            
            {/* Nomor SIM */}
            <div className="mb-4">
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor SIM
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.licenseNumber ? 'border-red-300' : 'border-gray-300'} 
                              px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="Masukkan nomor SIM"
                />
                {errors.licenseNumber && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                  </div>
                )}
              </div>
              {errors.licenseNumber && <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>}
            </div>
            
            {/* Jenis SIM */}
            <div className="mb-4">
              <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700 mb-1">
                Jenis SIM (Opsional)
              </label>
              <input
                type="text"
                id="licenseType"
                name="licenseType"
                value={formData.licenseType}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Contoh: A, B1, B2, C"
              />
            </div>
            
            {/* Tipe Kendaraan */}
            <div className="mb-4">
              <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Kendaraan
              </label>
              <div className="relative">
                <select
                  id="vehicleType"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.vehicleType ? 'border-red-300' : 'border-gray-300'} 
                              px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                >
                  <option value="">Pilih Tipe Kendaraan</option>
                  {VEHICLE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.vehicleType && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                  </div>
                )}
              </div>
              {errors.vehicleType && <p className="mt-1 text-sm text-red-600">{errors.vehicleType}</p>}
            </div>
            
            {/* Plat Nomor */}
            <div>
              <label htmlFor="vehiclePlate" className="block text-sm font-medium text-gray-700 mb-1">
                Plat Nomor Kendaraan
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="vehiclePlate"
                  name="vehiclePlate"
                  value={formData.vehiclePlate}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.vehiclePlate ? 'border-red-300' : 'border-gray-300'} 
                              px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="Contoh: B 1234 CD"
                />
                {errors.vehiclePlate && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                  </div>
                )}
              </div>
              {errors.vehiclePlate && <p className="mt-1 text-sm text-red-600">{errors.vehiclePlate}</p>}
            </div>
          </div>
          
          {/* Status & Catatan */}
          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-4">Status & Catatan</h2>
            
            {/* Status */}
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="available">Tersedia</option>
                <option value="busy">Sedang Mengirim</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
            
            {/* Catatan */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Catatan (Opsional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Catatan tambahan tentang supir"
              />
            </div>
          </div>
          
          {/* Tombol */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white 
                        hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium 
                        text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Supir'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 