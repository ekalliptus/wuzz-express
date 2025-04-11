'use client';

import { useState, useEffect } from 'react';
import { useServiceType } from '@/hooks/useServiceType';
import { TruckIcon, ArrowPathIcon, MapPinIcon, ScaleIcon } from '@heroicons/react/24/outline';

// Format harga ke format Rupiah
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

export default function TarifPage() {
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [weight, setWeight] = useState<number>(1);
  const { serviceTypes, rates, loading, error, fetchServiceTypes, calculateRate } = useServiceType();

  // Ambil daftar jenis layanan saat komponen dimuat
  useEffect(() => {
    fetchServiceTypes();
  }, [fetchServiceTypes]);

  // Kota-kota yang tersedia
  const cities = [
    'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Makassar', 'Semarang', 
    'Palembang', 'Tangerang', 'Depok', 'Bekasi', 'Bogor', 'Batam', 
    'Yogyakarta', 'Malang', 'Denpasar', 'Balikpapan', 'Padang', 'Manado'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originCity || !destinationCity || !weight) {
      return;
    }
    
    await calculateRate(originCity, destinationCity, weight);
  };

  return (
    <div className="bg-white">
      <div className="relative bg-blue-700">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover opacity-30"
            src="https://images.unsplash.com/photo-1615819908476-70e271b58243?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3"
            alt="Cek Tarif Pengiriman"
          />
        </div>
        <div className="relative mx-auto max-w-7xl py-24 px-6 sm:py-32 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Cek Tarif Pengiriman
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-blue-50">
            Hitung biaya pengiriman barang Anda secara instan dengan memasukkan kota asal, tujuan, dan berat
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="origin-city" className="block text-sm font-medium text-gray-700">
                    Kota Asal
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="origin-city"
                      name="origin-city"
                      value={originCity}
                      onChange={(e) => setOriginCity(e.target.value)}
                      className="block w-full pl-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      required
                    >
                      <option value="">Pilih Kota Asal</option>
                      {cities.map((city) => (
                        <option key={`origin-${city}`} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="destination-city" className="block text-sm font-medium text-gray-700">
                    Kota Tujuan
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="destination-city"
                      name="destination-city"
                      value={destinationCity}
                      onChange={(e) => setDestinationCity(e.target.value)}
                      className="block w-full pl-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      required
                    >
                      <option value="">Pilih Kota Tujuan</option>
                      {cities.map((city) => (
                        <option key={`destination-${city}`} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                  Berat (kg)
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ScaleIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    min="1"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value))}
                    className="block w-full pl-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 flex justify-center items-center text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                      Menghitung...
                    </>
                  ) : (
                    <>
                      <TruckIcon className="-ml-1 mr-2 h-5 w-5 text-white" />
                      Cek Tarif
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-8 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {rates.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Hasil Perhitungan Tarif</h2>
              <div className="space-y-6">
                {rates.map((rate, index) => (
                  <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {rate.serviceType.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {rate.serviceType.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-blue-600">
                            {formatCurrency(rate.price)}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Estimasi {rate.estimatedTime}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-gray-500">Dari:</span> {originCity}
                          </div>
                          <div>
                            <span className="text-gray-500">Ke:</span> {destinationCity}
                          </div>
                          <div>
                            <span className="text-gray-500">Berat:</span> {weight} kg
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <p className="font-medium text-gray-500">Keterangan:</p>
                        <p className="text-gray-700 mt-1">
                          Harga sudah termasuk pajak dan biaya tambahan. Waktu pengiriman bisa berubah tergantung kondisi di lapangan.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 