'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getLocations } from '@/app/actions';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, BuildingOfficeIcon, MapIcon } from '@heroicons/react/24/outline';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  maps_url?: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>('Semua');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const data = await getLocations();
        setLocations(data.locations || []);
        setError(null);
      } catch (err) {
        setError('Gagal memuat data lokasi. Silakan coba lagi nanti.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const provinces = useMemo(() => {
    const uniqueProvinces = [...new Set(locations.map(location => location.province))];
    return ['Semua', ...uniqueProvinces.sort()];
  }, [locations]);

  const filteredLocations = useMemo(() => {
    return selectedProvince === 'Semua'
      ? locations
      : locations.filter(location => location.province === selectedProvince);
  }, [locations, selectedProvince]);

  const handleProvinceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvince(e.target.value);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 animate-pulse">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Lokasi Kami</h1>
        <div className="bg-gray-200 h-10 w-60 mx-auto mb-8 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 p-6 rounded-lg h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Lokasi Kami</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Lokasi Kami</h1>
      
      <div className="mb-8 flex justify-center">
        <div className="flex items-center">
          <label htmlFor="province" className="mr-2 text-gray-700 font-medium">Filter Provinsi:</label>
          <select
            id="province"
            value={selectedProvince}
            onChange={handleProvinceChange}
            className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {provinces.map(province => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {filteredLocations.length === 0 ? (
        <div className="text-center text-gray-600">
          Tidak ada lokasi ditemukan untuk filter yang dipilih.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map(location => (
            <div key={location.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <h2 className="text-xl font-bold mb-3 text-gray-900">{location.name}</h2>
              
              <div className="flex items-start mb-2">
                <MapPinIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{location.address}, {location.city}, {location.province}</span>
              </div>
              
              {location.phone && (
                <div className="flex items-center mb-2">
                  <PhoneIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{location.phone}</span>
                </div>
              )}
              
              {location.email && (
                <div className="flex items-center mb-4">
                  <EnvelopeIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{location.email}</span>
                </div>
              )}
              
              {location.maps_url && (
                <a 
                  href={location.maps_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-200 mt-2"
                >
                  <MapIcon className="h-5 w-5 mr-2" />
                  Lihat di Maps
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 