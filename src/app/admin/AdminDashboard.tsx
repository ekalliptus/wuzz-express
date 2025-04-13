'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingBagIcon, 
  CreditCardIcon, 
  UserIcon, 
  BuildingOfficeIcon,
  DocumentChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { getDashboardData } from '@/app/actions';

interface AdminDashboardProps {
  user: any;
}

// Fungsi untuk memformat tanggal
const formatShipmentDate = (dateString: string) => {
  if (!dateString) {
    console.error('formatShipmentDate: dateString is empty or undefined', dateString);
    return 'Tanggal tidak tersedia';
  }

  try {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    const date = new Date(dateString);
    
    // Periksa apakah tanggal valid
    if (isNaN(date.getTime())) {
      console.error('formatShipmentDate: Invalid date from string:', dateString);
      return 'Format tanggal tidak valid';
    }
    
    return date.toLocaleDateString('id-ID', options);
  } catch (error) {
    console.error('formatShipmentDate: Error formatting date', error, dateString);
    return 'Error format tanggal';
  }
};

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Memulai pengambilan data dashboard...');
        const data = await getDashboardData();
        console.log('Data dashboard diterima:', data);
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Gagal memuat data dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Admin</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-full">
              <ShoppingBagIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-500">Total Pengiriman</h3>
              <p className="text-lg font-semibold text-gray-900">
                {isLoading ? (
                  <span className="h-7 w-16 bg-gray-200 rounded animate-pulse inline-block"></span>
                ) : dashboardData?.shipmentsByStatus ? (
                  dashboardData.shipmentsByStatus.reduce(
                    (total: number, item: any) => total + Number(item.count), 0
                  )
                ) : 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg border">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-full">
              <CreditCardIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-500">Total Pendapatan</h3>
              <p className="text-lg font-semibold text-gray-900">
                {isLoading ? (
                  <span className="h-7 w-16 bg-gray-200 rounded animate-pulse inline-block"></span>
                ) : `Rp ${Number(dashboardData?.revenue || 0).toLocaleString('id-ID')}`}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-50 rounded-full">
              <UserIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-500">Pengguna</h3>
              <p className="text-lg font-semibold text-gray-900">
                {isLoading ? (
                  <span className="h-7 w-16 bg-gray-200 rounded animate-pulse inline-block"></span>
                ) : dashboardData?.userCount || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg border">
          <div className="flex items-center">
            <div className="p-3 bg-orange-50 rounded-full">
              <BuildingOfficeIcon className="h-6 w-6 text-orange-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-500">Lokasi</h3>
              <p className="text-lg font-semibold text-gray-900">
                {isLoading ? (
                  <span className="h-7 w-16 bg-gray-200 rounded animate-pulse inline-block"></span>
                ) : dashboardData?.locationCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 text-red-800 rounded-lg">
          <p className="font-medium">{error}</p>
        </div>
      )}
      
      {/* Shipment status and recent shipments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded-lg border h-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Pengiriman</h2>
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-8"></div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              ))
            ) : dashboardData?.shipmentsByStatus?.length ? (
              <>
                {dashboardData.shipmentsByStatus.map((status: any, index: number) => {
                  const total = dashboardData.shipmentsByStatus.reduce(
                    (acc: number, curr: any) => acc + Number(curr.count), 0
                  );
                  const percentage = total > 0 ? (Number(status.count) / total) * 100 : 0;
                  
                  let color;
                  switch (status.status) {
                    case 'pending':
                      color = 'bg-yellow-500';
                      break;
                    case 'in_transit':
                      color = 'bg-blue-500';
                      break;
                    case 'delivered':
                      color = 'bg-green-500';
                      break;
                    case 'cancelled':
                      color = 'bg-red-500';
                      break;
                    default:
                      color = 'bg-gray-500';
                  }
                  
                  return (
                    <div key={index} className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-600">
                          {status.status === 'pending' && 'Menunggu'}
                          {status.status === 'in_transit' && 'Dalam Pengiriman'}
                          {status.status === 'delivered' && 'Terkirim'}
                          {status.status === 'cancelled' && 'Dibatalkan'}
                          {!['pending', 'in_transit', 'delivered', 'cancelled'].includes(status.status) && status.status}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{status.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className={`h-2 ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <p className="text-gray-500">Tidak ada data pengiriman</p>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white p-5 rounded-lg border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pengiriman Terbaru</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="border-b">
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Nomor Resi</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tujuan</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Layanan</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tanggal</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
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
                          {shipment.receipt_number}
                        </td>
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {shipment.destination_city}
                        </td>
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {shipment.service_type}
                        </td>
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {formatShipmentDate(shipment.created_at)}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            shipment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                            shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            shipment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {shipment.status === 'pending' && 'Menunggu'}
                            {shipment.status === 'in_transit' && 'Dalam Pengiriman'}
                            {shipment.status === 'delivered' && 'Terkirim'}
                            {shipment.status === 'cancelled' && 'Dibatalkan'}
                            {!['pending', 'in_transit', 'delivered', 'cancelled'].includes(shipment.status) && shipment.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-white border-b">
                      <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                        Tidak ada data pengiriman
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 