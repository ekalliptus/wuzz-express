'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import { getShipments } from '@/app/actions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ShipmentListProps {
  data: any[]; 
  total: number;
  page: number;
  limit: number;
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<ShipmentListProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  const statuses = [
    { value: undefined, label: 'Semua' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'picked_up', label: 'Diambil' },
    { value: 'in_transit', label: 'Dalam Pengiriman' },
    { value: 'out_for_delivery', label: 'Menuju Alamat' },
    { value: 'delivered', label: 'Terkirim' },
    { value: 'cancelled', label: 'Dibatalkan' }
  ];

  useEffect(() => {
    async function loadShipments() {
      setLoading(true);
      try {
        const data = await getShipments(currentPage, 10, selectedStatus);
        setShipments(data);
      } catch (error) {
        console.error('Error loading shipments:', error);
      } finally {
        setLoading(false);
      }
    }

    loadShipments();
  }, [currentPage, selectedStatus]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedStatus(value === 'all' ? undefined : value);
    setCurrentPage(1); // Reset ke halaman pertama
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'picked_up':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-indigo-100 text-indigo-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pending':
        return 'Menunggu';
      case 'picked_up':
        return 'Diambil';
      case 'in_transit':
        return 'Dalam Pengiriman';
      case 'out_for_delivery':
        return 'Menuju Alamat';
      case 'delivered':
        return 'Terkirim';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Daftar Pengiriman</h1>
          <Link 
            href="/staff/shipments/create" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tambah Pengiriman
          </Link>
        </div>

        <div className="mb-4">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter Status
          </label>
          <select
            id="status-filter"
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedStatus ?? 'all'}
            onChange={handleStatusChange}
          >
            {statuses.map((status) => (
              <option key={status.value ?? 'all'} value={status.value ?? 'all'}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : shipments && shipments.data.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No. Resi
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pengirim
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Penerima
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dari - Tujuan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Dibuat
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shipments.data.map((shipment: any) => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        <Link href={`/staff/shipments`}>
                          {shipment.receipt_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shipment.sender_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shipment.recipient_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shipment.origin_city} - {shipment.destination_city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(shipment.status)}`}>
                          {getStatusLabel(shipment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(shipment.created_at).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {shipments.total > 10 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-700">
                  Menampilkan {(shipments.page - 1) * shipments.limit + 1} - {Math.min(shipments.page * shipments.limit, shipments.total)} dari {shipments.total} pengiriman
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage * shipments.limit >= shipments.total}
                    className={`px-3 py-1 border rounded-md ${
                      currentPage * shipments.limit >= shipments.total
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white p-6 text-center">
            <p className="text-gray-500">Tidak ada data pengiriman ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
} 