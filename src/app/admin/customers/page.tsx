'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { 
  UserIcon, 
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// Data pelanggan dummy untuk demo
const DUMMY_CUSTOMERS = [
  {
    id: '1',
    name: 'Budi Santoso',
    company: 'PT Maju Jaya',
    email: 'budi@majujaya.co.id',
    phone: '081234567890',
    address: 'Jl. Sudirman No. 123, Jakarta',
    total_shipments: 15,
    created_at: '2023-05-15T08:30:00Z',
    status: 'active'
  },
  {
    id: '2',
    name: 'Siti Rahayu',
    company: 'CV Berkah Sejahtera',
    email: 'siti@berkahsejahtera.com',
    phone: '085678901234',
    address: 'Jl. Gajah Mada No. 45, Surabaya',
    total_shipments: 8,
    created_at: '2023-06-20T10:15:00Z',
    status: 'active'
  },
  {
    id: '3',
    name: 'Ahmad Hidayat',
    company: 'UD Makmur Abadi',
    email: 'ahmad@makmurabadi.id',
    phone: '089012345678',
    address: 'Jl. Ahmad Yani No. 67, Bandung',
    total_shipments: 12,
    created_at: '2023-04-10T14:45:00Z',
    status: 'active'
  },
  {
    id: '4',
    name: 'Dewi Anggraini',
    company: 'PT Karya Mandiri',
    email: 'dewi@karyamandiri.co.id',
    phone: '082345678901',
    address: 'Jl. Diponegoro No. 89, Semarang',
    total_shipments: 5,
    created_at: '2023-07-05T09:20:00Z',
    status: 'inactive'
  },
  {
    id: '5',
    name: 'Hendra Wijaya',
    company: 'CV Tumbuh Bersama',
    email: 'hendra@tumbuhbersama.com',
    phone: '087890123456',
    address: 'Jl. Pahlawan No. 34, Yogyakarta',
    total_shipments: 20,
    created_at: '2023-03-25T11:10:00Z',
    status: 'active'
  }
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Load dummy data untuk demo
  useEffect(() => {
    // Di implementasi nyata, ini akan menjadi API call
    const fetchCustomers = () => {
      setLoading(true);
      try {
        // Filter data berdasarkan status jika ada
        let filteredData = [...DUMMY_CUSTOMERS];
        if (statusFilter) {
          filteredData = filteredData.filter(customer => customer.status === statusFilter);
        }
        
        // Filter berdasarkan search term jika ada
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredData = filteredData.filter(customer => 
            customer.name.toLowerCase().includes(term) || 
            customer.company.toLowerCase().includes(term) ||
            customer.email.toLowerCase().includes(term)
          );
        }
        
        setCustomers(filteredData);
        setTotalPages(Math.ceil(filteredData.length / 10));
      } catch (err: any) {
        setError('Gagal memuat data pelanggan');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchCustomers();
    }
  }, [isAuthenticated, user, statusFilter, searchTerm]);

  // Redirect jika bukan admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleStatusFilterChange = (status: string | null) => {
    setStatusFilter(status);
    setPage(1); // Reset ke halaman pertama saat filter berubah
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search sudah ditangani oleh effect
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-3 md:mb-0">Pelanggan</h1>
        <Link 
          href="/admin/customers/create" 
          className="inline-flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Tambah Pelanggan
        </Link>
      </div>

      {/* Filter dan pencarian */}
      <div className="mb-4 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleStatusFilterChange(null)} 
            className={classNames(
              "py-1 px-3 text-sm rounded-full",
              statusFilter === null 
                ? "bg-blue-100 text-blue-700 border border-blue-200" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Semua
          </button>
          <button 
            onClick={() => handleStatusFilterChange('active')} 
            className={classNames(
              "py-1 px-3 text-sm rounded-full",
              statusFilter === 'active' 
                ? "bg-blue-100 text-blue-700 border border-blue-200" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Aktif
          </button>
          <button 
            onClick={() => handleStatusFilterChange('inactive')} 
            className={classNames(
              "py-1 px-3 text-sm rounded-full",
              statusFilter === 'inactive' 
                ? "bg-blue-100 text-blue-700 border border-blue-200" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Tidak Aktif
          </button>
        </div>
        <div className="flex-grow">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Cari nama, perusahaan, atau email..."
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
        <div>
          <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
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

      {/* Kartu pelanggan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border shadow-sm animate-pulse">
              <div className="flex items-center space-x-3 mb-3">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-3 border-t">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))
        ) : customers.length > 0 ? (
          customers.map((customer) => (
            <div key={customer.id} className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                  <p className="text-sm text-gray-600">{customer.company}</p>
                </div>
              </div>
              <div className="space-y-2 mb-3 text-sm">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-gray-700">{customer.email}</span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-gray-700">{customer.phone}</span>
                </div>
                <div className="flex items-start">
                  <MapPinIcon className="h-4 w-4 text-gray-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{customer.address}</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-3 border-t">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{customer.total_shipments}</span> pengiriman
                </div>
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Lihat Detail
                </Link>
              </div>
              <div className="mt-2 flex justify-between items-center text-xs">
                <span className="text-gray-500">Bergabung {formatDate(customer.created_at)}</span>
                <span className={classNames(
                  "px-2 py-1 rounded-full",
                  customer.status === 'active' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                )}>
                  {customer.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-8 rounded-lg border text-center">
            <div className="inline-block p-3 bg-blue-50 rounded-full mb-4">
              <UserIcon className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tidak ada data pelanggan</h3>
            <p className="text-gray-500 mb-4">Pelanggan yang ditambahkan akan muncul di sini</p>
            <Link
              href="/admin/customers/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Tambah Pelanggan Pertama
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 px-4 py-3 flex items-center justify-between border-t">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Menampilkan <span className="font-medium">{((page - 1) * 10) + 1}</span> sampai{" "}
                <span className="font-medium">{Math.min(page * 10, customers.length)}</span> dari{" "}
                <span className="font-medium">{customers.length}</span> pelanggan
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={classNames(
                    "relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium",
                    page === 1 
                      ? "text-gray-300 cursor-not-allowed" 
                      : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  <span className="sr-only">Sebelumnya</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={classNames(
                      "relative inline-flex items-center px-4 py-2 border text-sm font-medium",
                      pageNum === page
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    {pageNum}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={classNames(
                    "relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium",
                    page === totalPages 
                      ? "text-gray-300 cursor-not-allowed" 
                      : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  <span className="sr-only">Berikutnya</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 