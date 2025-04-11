'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  MapPinIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { getLocations } from '@/app/actions';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();

  // Fetch data lokasi dari database
  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching locations data...');
      const result = await getLocations(typeFilter || undefined);
      console.log('Fetched locations data:', result);
      
      // Cek apakah ada error dari server action
      if (result.error) {
        setError(result.error);
        setLocations([]);
        return;
      }
      
      // Filter berdasarkan search term jika ada
      let filteredLocations = result.locations;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredLocations = filteredLocations.filter((location: any) => 
          location.name.toLowerCase().includes(term) || 
          location.city.toLowerCase().includes(term) ||
          location.address.toLowerCase().includes(term)
        );
      }
      
      setLocations(filteredLocations);
    } catch (err: any) {
      console.error('Error fetching locations:', err);
      setError(err.message || 'Gagal memuat data lokasi. Silakan coba lagi nanti.');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, searchTerm]);

  // Load data lokasi saat komponen dimuat
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchLocations();
    }
  }, [isAuthenticated, user, fetchLocations]);

  // Redirect jika bukan admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLocations();
  };

  const getLocationTypeText = (type: string) => {
    switch (type) {
      case 'hq':
        return 'Kantor Pusat';
      case 'branch':
        return 'Cabang';
      case 'warehouse':
        return 'Gudang';
      default:
        return 'Lainnya';
    }
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'hq':
        return 'bg-purple-100 text-purple-800';
      case 'branch':
        return 'bg-blue-100 text-blue-800';
      case 'warehouse':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'maintenance':
        return 'Pemeliharaan';
      case 'inactive':
        return 'Tidak Aktif';
      default:
        return status;
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-3 md:mb-0">Lokasi</h1>
        <Link 
          href="/admin/locations/create" 
          className="inline-flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Tambah Lokasi
        </Link>
      </div>

      {/* Filter dan pencarian */}
      <div className="mb-4 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setTypeFilter(null)} 
            className={classNames(
              "py-1 px-3 text-sm rounded-full",
              typeFilter === null 
                ? "bg-blue-100 text-blue-700 border border-blue-200" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Semua
          </button>
          <button 
            onClick={() => setTypeFilter('hq')} 
            className={classNames(
              "py-1 px-3 text-sm rounded-full",
              typeFilter === 'hq' 
                ? "bg-purple-100 text-purple-700 border border-purple-200" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Kantor Pusat
          </button>
          <button 
            onClick={() => setTypeFilter('branch')} 
            className={classNames(
              "py-1 px-3 text-sm rounded-full",
              typeFilter === 'branch' 
                ? "bg-blue-100 text-blue-700 border border-blue-200" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Cabang
          </button>
          <button 
            onClick={() => setTypeFilter('warehouse')} 
            className={classNames(
              "py-1 px-3 text-sm rounded-full",
              typeFilter === 'warehouse' 
                ? "bg-orange-100 text-orange-700 border border-orange-200" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Gudang
          </button>
        </div>
        
        <div className="flex-grow">
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="text"
              placeholder="Cari nama, kota, atau alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow rounded-l-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700 transition-colors"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-800 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Error:</p>
              <p className="mt-1">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-4 inline-flex items-center p-1.5 bg-red-50 text-red-700 rounded-full hover:bg-red-100"
              aria-label="Tutup"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="mt-3 flex justify-end">
            <button 
              onClick={() => fetchLocations()}
              className="text-sm font-medium px-3 py-1.5 bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              Coba Lagi
            </button>
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-sm font-medium px-3 py-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Grid Lokasi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border shadow-sm animate-pulse">
              <div className="flex justify-between mb-3">
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded mb-3 w-full"></div>
              <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-5 w-1/2"></div>
              <div className="flex justify-end">
                <div className="h-8 bg-gray-200 rounded w-20 mr-2"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))
        ) : locations.length > 0 ? (
          locations.map((location) => (
            <div key={location.id} className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                <span className={classNames(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  getLocationTypeColor(location.type)
                )}>
                  {getLocationTypeText(location.type)}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-700 text-sm">{location.address}</p>
                    <p className="text-gray-700 text-sm">
                      {location.city}, {location.province}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-gray-700 text-sm">{location.phone}</span>
                </div>
                
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-gray-700 text-sm">{location.email}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t">
                <span className={classNames(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  getStatusColor(location.status)
                )}>
                  {getStatusText(location.status)}
                </span>
                
                <div className="space-x-2">
                  <Link
                    href={`/admin/locations/${location.id}/edit`}
                    className="inline-flex items-center py-1 px-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                  
                  <button
                    className="inline-flex items-center py-1 px-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-8 rounded-lg border text-center">
            <div className="inline-block p-3 bg-blue-50 rounded-full mb-4">
              <MapPinIcon className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tidak ada lokasi ditemukan</h3>
            <p className="text-gray-500 mb-4">Tambahkan lokasi baru untuk mulai mengelola cabang dan gudang Anda</p>
            <Link
              href="/admin/locations/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Tambah Lokasi Baru
            </Link>
          </div>
        )}
      </div>

      {/* Peta Lokasi */}
      {locations.length > 0 && (
        <div className="mt-8 bg-white p-5 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Peta Lokasi</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Peta lokasi akan ditampilkan di sini (Integrasi dengan Google Maps)</p>
          </div>
        </div>
      )}
    </div>
  );
} 