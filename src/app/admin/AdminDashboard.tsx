'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingBagIcon, 
  CreditCardIcon, 
  UserIcon, 
  BuildingOfficeIcon,
  DocumentChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TruckIcon,
  MapPinIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { getDashboardData } from '@/app/actions';
import Link from 'next/link';
import { formatCurrency } from '../utils/format';

interface AdminDashboardProps {
  user: any;
}

// Helper function to format date with error handling
const formatShipmentDate = (dateString: string | null | undefined) => {
  try {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

// Admin quick access menu items
const quickAccessMenuItems = [
  { 
    name: 'Pengiriman', 
    href: '/admin/shipments', 
    icon: TruckIcon, 
    description: 'Kelola semua pengiriman point-to-point' 
  },
  { 
    name: 'Pelanggan', 
    href: '/admin/customers', 
    icon: UserIcon, 
    description: 'Lihat dan kelola data pelanggan' 
  },
  { 
    name: 'Lokasi', 
    href: '/admin/locations', 
    icon: MapPinIcon, 
    description: 'Atur lokasi dan rute pengiriman' 
  },
  { 
    name: 'Jenis Layanan', 
    href: '/admin/service-types', 
    icon: ClipboardDocumentCheckIcon,
    description: 'Kelola jenis layanan point-to-point' 
  },
  { 
    name: 'Supir', 
    href: '/admin/drivers', 
    icon: UserGroupIcon, 
    description: 'Kelola supir yang menjalankan pengiriman' 
  },
  { 
    name: 'Laporan', 
    href: '/admin/reports', 
    icon: ChartBarIcon, 
    description: 'Lihat laporan dan analitik' 
  },
  { 
    name: 'Pengaturan', 
    href: '/admin/settings', 
    icon: CogIcon, 
    description: 'Atur konfigurasi sistem' 
  }
];

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>({
    recentShipments: [],
    shipmentsByStatus: [],
    totalRevenue: 0,
    userCount: 0,
    locationCount: 0,
    driverCount: 0,
    activeDrivers: [],
    weeklyShipments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    setError(null);
    
    try {
      const data = await getDashboardData();
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto refresh every 5 minutes
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchDashboardData]);

  // Get counts for each status
  const getStatusCount = (status: string) => {
    const statusItem = dashboardData.shipmentsByStatus.find(
      (item: any) => item.status === status
    );
    return statusItem ? Number(statusItem.count) : 0;
  };

  const pendingCount = getStatusCount('pending');
  const inTransitCount = getStatusCount('in_transit') + getStatusCount('picked');
  const deliveredCount = getStatusCount('delivered');
  const cancelledCount = getStatusCount('cancelled');

  if (loading && !lastUpdated) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-sm text-gray-600 font-medium">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={() => fetchDashboardData(true)} 
            className="p-2 rounded-full hover:bg-gray-100"
            disabled={refreshing}
            title="Refresh dashboard"
          >
            <ArrowPathIcon className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center justify-between">
          <p>{error}</p>
          <button
            onClick={() => fetchDashboardData(true)}
            className="text-sm text-red-700 hover:text-red-900 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Shipments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pengiriman Tertunda</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : pendingCount}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <TruckIcon className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </div>

        {/* In Transit Shipments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pengiriman Dalam Perjalanan</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : inTransitCount}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TruckIcon className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Delivered Shipments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pengiriman Selesai</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : deliveredCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TruckIcon className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : formatCurrency(dashboardData.totalRevenue || 0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Shipment Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Status Pengiriman</h2>
        {loading ? (
          <div className="h-12 flex items-center justify-center">
            <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div>
            <div className="flex h-8 w-full rounded-full overflow-hidden bg-gray-200">
              {pendingCount > 0 && (
                <div 
                  className="bg-amber-500 h-8" 
                  style={{ 
                    width: `${(pendingCount / (pendingCount + inTransitCount + deliveredCount + cancelledCount)) * 100}%` 
                  }}
                  title={`Tertunda: ${pendingCount}`}
                />
              )}
              {inTransitCount > 0 && (
                <div 
                  className="bg-blue-500 h-8" 
                  style={{ 
                    width: `${(inTransitCount / (pendingCount + inTransitCount + deliveredCount + cancelledCount)) * 100}%` 
                  }}
                  title={`Dalam Perjalanan: ${inTransitCount}`}
                />
              )}
              {deliveredCount > 0 && (
                <div 
                  className="bg-green-500 h-8" 
                  style={{ 
                    width: `${(deliveredCount / (pendingCount + inTransitCount + deliveredCount + cancelledCount)) * 100}%` 
                  }}
                  title={`Terkirim: ${deliveredCount}`}
                />
              )}
              {cancelledCount > 0 && (
                <div 
                  className="bg-red-500 h-8" 
                  style={{ 
                    width: `${(cancelledCount / (pendingCount + inTransitCount + deliveredCount + cancelledCount)) * 100}%` 
                  }}
                  title={`Dibatalkan: ${cancelledCount}`}
                />
              )}
            </div>
            <div className="flex flex-wrap mt-4 text-base gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-amber-500 rounded-full mr-2"></div>
                <span className="font-medium text-gray-800">Tertunda ({pendingCount})</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                <span className="font-medium text-gray-800">Dalam Perjalanan ({inTransitCount})</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span className="font-medium text-gray-800">Terkirim ({deliveredCount})</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                <span className="font-medium text-gray-800">Dibatalkan ({cancelledCount})</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Shipments and Active Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Shipments */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Pengiriman Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                Loading recent shipments...
              </div>
            ) : dashboardData.recentShipments.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      No. Tracking
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Pelanggan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Origin - Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Tanggal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.recentShipments.map((shipment: any) => (
                    <tr key={shipment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {shipment.tracking_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shipment.customer_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shipment.origin_name || 'N/A'} - {shipment.destination_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${shipment.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                            shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-800' : 
                            shipment.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                            'bg-gray-100 text-gray-800'}`}
                        >
                          {shipment.status === 'delivered' ? 'Terkirim' :
                           shipment.status === 'in_transit' ? 'Dalam Perjalanan' :
                           shipment.status === 'pending' ? 'Tertunda' :
                           shipment.status === 'cancelled' ? 'Dibatalkan' :
                           shipment.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatShipmentDate(shipment.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No recent shipments found
              </div>
            )}
          </div>
        </div>

        {/* Active Drivers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Supir Aktif</h2>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                Loading active drivers...
              </div>
            ) : dashboardData.activeDrivers && dashboardData.activeDrivers.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {dashboardData.activeDrivers.map((driver: any) => (
                  <li key={driver.id} className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 bg-gray-100 p-2 rounded-full">
                        <TruckIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {driver.name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {driver.license_number || 'No license'} • {driver.location_name || 'No location'}
                        </p>
                      </div>
                      <div className="inline-flex items-center text-sm font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {Number(driver.active_shipments) || 0} pengiriman
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No active drivers found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customers Count */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pelanggan</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : dashboardData.userCount || 0}
              </p>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <UserIcon className="h-6 w-6 text-teal-500" />
            </div>
          </div>
        </div>

        {/* Drivers Count */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Supir</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : dashboardData.driverCount || 0}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <UserGroupIcon className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Locations Count */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Lokasi</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : dashboardData.locationCount || 0}
              </p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <BuildingOfficeIcon className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Shipments Growth */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Pertumbuhan Pengiriman Mingguan
        </h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
          </div>
        ) : dashboardData.weeklyShipments && dashboardData.weeklyShipments.length > 0 ? (
          <div className="h-64">
            <div className="flex h-full items-end space-x-2">
              {dashboardData.weeklyShipments.map((data: any, index: number) => {
                // Find max count to calculate relative heights
                const maxCount = Math.max(
                  ...dashboardData.weeklyShipments.map((item: any) => item.count || 0)
                );
                const height = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
                
                // Format the week label (just show the day and month)
                const weekDate = new Date(data.week);
                const weekLabel = weekDate.toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short'
                });
                
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all"
                      style={{ height: `${height}%` }}
                      title={`${weekLabel}: ${data.count} pengiriman`}
                    ></div>
                    <div className="text-xs mt-2 text-gray-600">
                      {weekLabel}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-between">
              <div className="text-sm text-gray-500">
                <ChartBarIcon className="h-4 w-4 inline mb-0.5 mr-1" />
                Total: {dashboardData.weeklyShipments.reduce((sum: number, item: any) => sum + (item.count || 0), 0)} pengiriman
              </div>
              <Link href="/admin/reports" className="text-sm text-blue-600 hover:text-blue-800">
                Lihat laporan lengkap →
              </Link>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Belum ada data pengiriman mingguan
          </div>
        )}
      </div>
    </div>
  );
} 