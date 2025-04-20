'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  TruckIcon, 
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { getShipments } from '@/app/actions';

const STATUS_CONFIG = {
  pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Menunggu Pickup' },
  processing: { color: 'bg-blue-100 text-blue-800', text: 'Diproses' },
  in_transit: { color: 'bg-indigo-100 text-indigo-800', text: 'Dalam Perjalanan' },
  delivered: { color: 'bg-green-100 text-green-800', text: 'Terkirim' },
  cancelled: { color: 'bg-gray-100 text-gray-800', text: 'Dibatalkan' }
};

// Format tanggal
const formatDate = (dateString: string) => {
  // Periksa apakah dateString valid
  if (!dateString) {
    console.error('formatDate: dateString is empty or undefined', dateString);
    return 'Tanggal tidak tersedia';
  }

  try {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    const date = new Date(dateString);
    
    // Periksa apakah tanggal valid
    if (isNaN(date.getTime())) {
      console.error('formatDate: Invalid date from string:', dateString);
      return 'Format tanggal tidak valid';
    }
    
    return date.toLocaleDateString('id-ID', options);
  } catch (error) {
    console.error('formatDate: Error formatting date', error, dateString);
    return 'Error format tanggal';
  }
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface Shipment {
  id: string;
  trackingNumber: string;
  customer: {
    name: string;
    id: string;
  };
  origin: string;
  destination: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: string;
  driverName?: string;
  estimatedDelivery?: string;
  items?: number;
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();

  // Ambil data pengiriman
  const fetchShipments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getShipments(page, 10, statusFilter);
      setShipments(result.data);
      setTotalPages(Math.ceil(result.total / result.limit));
    } catch (err) {
      console.error('Error fetching shipments:', err);
      setError('Gagal memuat data pengiriman. Silakan coba lagi nanti.');
      setShipments([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  // Load data shipments
  useEffect(() => {
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'staff')) {
      console.log("Fetching shipments data...");
      try {
        fetchShipments();
        console.log("Shipments fetched successfully");
      } catch (error) {
        console.error("Error fetching shipments:", error);
      }
    }
  }, [isAuthenticated, user, fetchShipments]);

  // Redirect jika bukan admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Helper functions
  const getStatusColor = useCallback((status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || 'bg-gray-100 text-gray-800';
  }, []);

  const getStatusText = useCallback((status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.text || status;
  }, []);

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
    // Implementasi pencarian akan ditambahkan nanti
  };

  const filteredShipments = shipments.filter(shipment => {
    // Filter berdasarkan status
    if (statusFilter !== null && shipment.status !== statusFilter) {
      return false;
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    // Filter berdasarkan kategori pencarian
    if (searchCategory !== 'all' && searchTerm) {
      switch (searchCategory) {
        case 'tracking':
          return shipment.trackingNumber?.toLowerCase().includes(searchLower) || false;
        case 'customer':
          return shipment.customer?.name?.toLowerCase().includes(searchLower) || false;
        case 'origin':
          return shipment.origin?.toLowerCase().includes(searchLower) || false;
        case 'destination':
          return shipment.destination?.toLowerCase().includes(searchLower) || false;
        case 'driver':
          return shipment.driverName?.toLowerCase().includes(searchLower) || false;
        default:
          return true;
      }
    }
    
    // Pencarian umum jika kategori = all atau tidak ada kata kunci pencarian
    return searchTerm ? (
      (shipment.trackingNumber?.toLowerCase().includes(searchLower) || false) ||
      (shipment.customer?.name?.toLowerCase().includes(searchLower) || false) ||
      (shipment.origin?.toLowerCase().includes(searchLower) || false) ||
      (shipment.destination?.toLowerCase().includes(searchLower) || false) ||
      (shipment.driverName?.toLowerCase().includes(searchLower) || false)
    ) : true;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'in_transit':
        return <TruckIcon className="h-5 w-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ArrowPathIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-3 md:mb-0">Pengiriman</h1>
        <Link 
          href="/admin/shipments/create" 
          className="inline-flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Tambah Pengiriman
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
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <button 
              key={status}
              onClick={() => handleStatusFilterChange(status)}
              className={classNames(
                "py-1 px-3 text-sm rounded-full",
                statusFilter === status 
                  ? "bg-blue-100 text-blue-700 border border-blue-200" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {config.text}
            </button>
          ))}
        </div>
        <div className="flex-grow flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari pengiriman..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <select
            className="block w-full sm:w-44 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            <option value="tracking">No. Tracking</option>
            <option value="customer">Nama Pelanggan</option>
            <option value="origin">Asal</option>
            <option value="destination">Tujuan</option>
            <option value="driver">Pengemudi</option>
          </select>
        </div>
        <div className="flex space-x-2">
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

      {/* Tabel pengiriman */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3">No Resi</th>
                <th scope="col" className="px-4 py-3">Pengirim</th>
                <th scope="col" className="px-4 py-3">Penerima</th>
                <th scope="col" className="px-4 py-3">Tujuan</th>
                <th scope="col" className="px-4 py-3">Tanggal</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b animate-pulse">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : filteredShipments.length > 0 ? (
                filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link 
                        href={`/admin/shipments/detail/${shipment.id}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {shipment.trackingNumber || 'No. Resi tidak tersedia'}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{shipment.customer?.name || 'Data pengirim tidak tersedia'}</td>
                    <td className="px-4 py-3">{shipment.destination || 'Tujuan tidak tersedia'}</td>
                    <td className="px-4 py-3">{shipment.origin || 'Asal tidak tersedia'}</td>
                    <td className="px-4 py-3">{formatDate(shipment.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shipment.status)}`}>
                        {getStatusText(shipment.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/shipments/detail/${shipment.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-b">
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    <p className="text-base">Tidak ada data pengiriman</p>
                    <p className="text-sm mt-1 text-gray-400">Pengiriman yang ditambahkan akan muncul di sini</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">{((page - 1) * 10) + 1}</span> sampai{" "}
                  <span className="font-medium">{Math.min(page * 10, filteredShipments.length)}</span> dari{" "}
                  <span className="font-medium">{totalPages * 10}</span> hasil
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
    </div>
  );
} 