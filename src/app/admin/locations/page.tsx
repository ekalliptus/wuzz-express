'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
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

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// Data lokasi dummy untuk demo
const DUMMY_LOCATIONS = [
  {
    id: 1,
    name: 'Kantor Pusat Jakarta',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    postal_code: '10220',
    phone: '021-5551234',
    email: 'jakarta@wuzz.co.id',
    type: 'hq',
    status: 'active',
    coordinates: {
      lat: -6.2088,
      lng: 106.8456
    }
  },
  {
    id: 2,
    name: 'Cabang Surabaya',
    address: 'Jl. Pemuda No. 45, Surabaya',
    city: 'Surabaya',
    province: 'Jawa Timur',
    postal_code: '60271',
    phone: '031-5559876',
    email: 'surabaya@wuzz.co.id',
    type: 'branch',
    status: 'active',
    coordinates: {
      lat: -7.2575,
      lng: 112.7521
    }
  },
  {
    id: 3,
    name: 'Cabang Bandung',
    address: 'Jl. Asia Afrika No. 67, Bandung',
    city: 'Bandung',
    province: 'Jawa Barat',
    postal_code: '40112',
    phone: '022-4238765',
    email: 'bandung@wuzz.co.id',
    type: 'branch',
    status: 'active',
    coordinates: {
      lat: -6.9175,
      lng: 107.6191
    }
  },
  {
    id: 4,
    name: 'Gudang Bekasi',
    address: 'Jl. Industri No. 89, Bekasi',
    city: 'Bekasi',
    province: 'Jawa Barat',
    postal_code: '17214',
    phone: '021-8234567',
    email: 'gudang.bekasi@wuzz.co.id',
    type: 'warehouse',
    status: 'active',
    coordinates: {
      lat: -6.2382,
      lng: 106.9976
    }
  },
  {
    id: 5,
    name: 'Cabang Denpasar',
    address: 'Jl. Raya Kuta No. 34, Denpasar',
    city: 'Denpasar',
    province: 'Bali',
    postal_code: '80361',
    phone: '0361-754321',
    email: 'denpasar@wuzz.co.id',
    type: 'branch',
    status: 'active',
    coordinates: {
      lat: -8.6705,
      lng: 115.2126
    }
  },
  {
    id: 6,
    name: 'Gudang Semarang',
    address: 'Jl. Majapahit No. 56, Semarang',
    city: 'Semarang',
    province: 'Jawa Tengah',
    postal_code: '50176',
    phone: '024-7619832',
    email: 'gudang.semarang@wuzz.co.id',
    type: 'warehouse',
    status: 'maintenance',
    coordinates: {
      lat: -7.0051,
      lng: 110.4381
    }
  }
];

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Load dummy data untuk demo
  useEffect(() => {
    const fetchLocations = () => {
      setLoading(true);
      try {
        let filteredData = [...DUMMY_LOCATIONS];
        
        // Filter berdasarkan tipe
        if (typeFilter) {
          filteredData = filteredData.filter(location => location.type === typeFilter);
        }
        
        // Filter berdasarkan search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredData = filteredData.filter(location => 
            location.name.toLowerCase().includes(term) || 
            location.city.toLowerCase().includes(term) ||
            location.address.toLowerCase().includes(term)
          );
        }
        
        setLocations(filteredData);
      } catch (err: any) {
        setError('Gagal memuat data lokasi');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchLocations();
    }
  }, [isAuthenticated, user, typeFilter, searchTerm]);

  // Redirect jika bukan admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search sudah ditangani oleh effect
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
              placeholder="Cari lokasi..."
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
          <p className="font-medium">Error: {error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-1 text-sm font-medium text-red-600 hover:text-red-800"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Daftar Lokasi */}
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
                      {location.city}, {location.province} {location.postal_code}
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
              
              <div className="flex justify-between items-center">
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

      {/* Peta Lokasi Preview (Cuma placeholder) */}
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