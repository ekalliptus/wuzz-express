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
  AdjustmentsHorizontalIcon
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
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();

  // Ambil data pengiriman
  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getShipments(page, 10, statusFilter || undefined);
      setShipments(result.data);
      setTotalPages(Math.ceil(result.total / result.limit));
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data pengiriman');
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
        <div className="flex-grow">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Cari nomor resi..."
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
        <div className="flex space-x-2">
          <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <FunnelIcon className="h-5 w-5" />
          </button>
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
              ) : shipments.length > 0 ? (
                shipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link 
                        href={`/admin/shipments/detail/${shipment.id}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {shipment.receipt_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{shipment.sender_name}</td>
                    <td className="px-4 py-3">{shipment.recipient_name}</td>
                    <td className="px-4 py-3">{shipment.destination_city}</td>
                    <td className="px-4 py-3">{formatDate(shipment.created_at)}</td>
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
                  <span className="font-medium">{Math.min(page * 10, shipments.length)}</span> dari{" "}
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