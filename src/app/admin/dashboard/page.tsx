'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  HomeIcon, 
  TruckIcon, 
  UserIcon, 
  DocumentTextIcon, 
  MapPinIcon,
  CogIcon,
  UserCircleIcon,
  Bars3Icon,
  ChevronLeftIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardData } from '@/app/actions';

// Status dan teks yang sesuai disimpan dalam objek untuk kemudahan pemeliharaan
const STATUS_CONFIG = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800',
    text: 'Menunggu Pickup'
  },
  processing: {
    color: 'bg-blue-100 text-blue-800',
    text: 'Diproses'
  },
  in_transit: {
    color: 'bg-indigo-100 text-indigo-800',
    text: 'Dalam Perjalanan'
  },
  delivered: {
    color: 'bg-green-100 text-green-800',
    text: 'Terkirim'
  },
  cancelled: {
    color: 'bg-gray-100 text-gray-800',
    text: 'Dibatalkan'
  }
};

// Format Tanggal
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

// Format Mata Uang
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminDashboardPage() {
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();

  // Ambil data dashboard dari server
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data dashboard');
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoadingDashboard(false);
      }
    }

    if (isAuthenticated && user && user.role === 'admin') {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  // Redirect jika bukan admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, user, router]);

  // Helper functions dengan useCallback
  const getStatusColor = useCallback((status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || 'bg-gray-100 text-gray-800';
  }, []);

  const getStatusText = useCallback((status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.text || status;
  }, []);

  // Memoize calculated values
  const totalShipments = useMemo(() => {
    if (!dashboardData?.shipmentsByStatus) return 0;
    return dashboardData.shipmentsByStatus.reduce((acc: number, curr: any) => acc + parseInt(curr.count), 0);
  }, [dashboardData?.shipmentsByStatus]);
  
  const deliveredCount = useMemo(() => {
    if (!dashboardData?.shipmentsByStatus) return 0;
    return dashboardData.shipmentsByStatus.find((s: any) => s.status === 'delivered')?.count || 0;
  }, [dashboardData?.shipmentsByStatus]);
  
  const inTransitCount = useMemo(() => {
    if (!dashboardData?.shipmentsByStatus) return 0;
    return dashboardData.shipmentsByStatus.find((s: any) => s.status === 'in_transit')?.count || 0;
  }, [dashboardData?.shipmentsByStatus]);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/auth/login');
  }, [logout, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Error display */}
      {error && (
        <div className="mb-3 p-3 border border-red-300 bg-red-50 text-red-800 rounded-lg">
          <p className="font-medium">Error: {error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-1 text-sm font-medium text-red-600 hover:text-red-800"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {isLoadingDashboard ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 rounded-lg animate-pulse bg-gray-200 shadow-sm"></div>
          ))
        ) : dashboardData ? (
          <>
            <div className="p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-2 mr-3 text-blue-500 bg-blue-100 rounded-full">
                  <TruckIcon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Pengiriman</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {totalShipments}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-2 mr-3 text-green-500 bg-green-100 rounded-full">
                  <TruckIcon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pengiriman Terkirim</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {deliveredCount}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-2 mr-3 text-yellow-500 bg-yellow-100 rounded-full">
                  <TruckIcon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Dalam Perjalanan</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {inTransitCount}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-2 mr-3 text-indigo-500 bg-indigo-100 rounded-full">
                  <DocumentTextIcon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Pendapatan</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {formatCurrency(parseFloat(dashboardData.revenue || 0))}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Recent shipments */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-3">
          Pengiriman Terbaru
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-t-lg">
              <tr>
                <th scope="col" className="px-4 py-2 rounded-tl-lg">
                  No Resi
                </th>
                <th scope="col" className="px-4 py-2">
                  Tujuan
                </th>
                <th scope="col" className="px-4 py-2">
                  Jenis Layanan
                </th>
                <th scope="col" className="px-4 py-2">
                  Tanggal
                </th>
                <th scope="col" className="px-4 py-2 rounded-tr-lg">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingDashboard ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="bg-white border-b hover:bg-gray-50">
                    <td colSpan={5} className="px-4 py-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : dashboardData?.recentShipments?.length ? (
                dashboardData.recentShipments.map((shipment: any, index: number) => (
                  <tr key={index} className="bg-white border-b hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      <Link href={`/admin/shipments/${shipment.id}`} className="hover:underline hover:text-blue-600 transition-colors duration-150">
                        {shipment.receipt_number}
                      </Link>
                    </td>
                    <td className="px-4 py-2">
                      {shipment.destination_city}
                    </td>
                    <td className="px-4 py-2">
                      {shipment.service_type}
                    </td>
                    <td className="px-4 py-2">
                      {formatDate(shipment.created_at)}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shipment.status)}`}>
                        {getStatusText(shipment.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white border-b">
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    <p className="text-base">Tidak ada data pengiriman</p>
                    <p className="text-sm mt-1 text-gray-400">Pengiriman baru akan muncul di sini</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {dashboardData?.recentShipments?.length > 0 && (
          <div className="mt-3 text-right">
            <Link 
              href="/admin/shipments" 
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Lihat semua pengiriman →
            </Link>
          </div>
        )}
      </div>

      {/* Shipment stats */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-3">
          Statistik Status Pengiriman
        </h2>

        {isLoadingDashboard ? (
          <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
        ) : dashboardData?.shipmentsByStatus?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {dashboardData.shipmentsByStatus.map((status: any) => (
              <div key={status.status} className="p-3 bg-white border rounded-lg shadow-sm text-center hover:shadow-md transition-shadow duration-200">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${getStatusColor(status.status)}`}>
                  <span className="text-base font-bold">{status.count}</span>
                </div>
                <p className="font-medium text-gray-700 text-sm">{getStatusText(status.status)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 mb-2">Tidak ada data statistik</p>
            <p className="text-sm text-gray-400">Status pengiriman akan muncul di sini saat tersedia</p>
          </div>
        )}
      </div>
    </div>
  );
} 