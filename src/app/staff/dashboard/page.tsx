'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TruckIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline';
import { useAuthContext } from '@/context/AuthContext';

// Data statistik dummy
const stats = [
  { name: 'Pengiriman Diproses', value: '45', icon: TruckIcon, change: '12%', changeType: 'increase' },
  { name: 'Pengiriman Selesai', value: '156', icon: ClipboardDocumentCheckIcon, change: '5.4%', changeType: 'increase' },
  { name: 'Pengiriman Tertunda', value: '8', icon: ArrowPathIcon, change: '3.2%', changeType: 'decrease' },
];

// Data pengiriman terbaru dummy
const recentShipments = [
  {
    id: 'WUZZ12345678',
    customer: 'PT Maju Jaya',
    destination: 'Surabaya',
    price: 'Rp 105,000',
    status: 'in_transit',
    date: '10 Apr 2024',
  },
  {
    id: 'WUZZ12345679',
    customer: 'Toko Makmur',
    destination: 'Bandung',
    price: 'Rp 87,500',
    status: 'delivered',
    date: '09 Apr 2024',
  },
  {
    id: 'WUZZ12345680',
    customer: 'CV Sejahtera',
    destination: 'Medan',
    price: 'Rp 230,000',
    status: 'processing',
    date: '08 Apr 2024',
  },
  {
    id: 'WUZZ12345681',
    customer: 'UD Berkah',
    destination: 'Makassar',
    price: 'Rp 325,000',
    status: 'pending',
    date: '08 Apr 2024',
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function StaffDashboardPage() {
  const { user } = useAuthContext();

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Terkirim';
      case 'in_transit':
        return 'Dalam Pengiriman';
      case 'processing':
        return 'Diproses';
      case 'pending':
        return 'Menunggu';
      default:
        return status;
    }
  };

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Staff</h1>
        <p className="mt-1 text-sm text-gray-600">
          Selamat datang, {user?.name || 'Staff Operasional'}! Berikut adalah ringkasan pengiriman yang Anda tangani.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <span
                className={classNames(
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600',
                  'inline-flex items-center text-sm font-medium'
                )}
              >
                {stat.changeType === 'increase' ? (
                  <ArrowUpIcon className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownIcon className="w-3 h-3 mr-1" />
                )}
                {stat.change} dari minggu lalu
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Pengiriman Yang Ditangani</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Nomor Resi
                </th>
                <th scope="col" className="px-6 py-3">
                  Pelanggan
                </th>
                <th scope="col" className="px-6 py-3">
                  Tujuan
                </th>
                <th scope="col" className="px-6 py-3">
                  Harga
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Tanggal
                </th>
                <th scope="col" className="px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {recentShipments.map((shipment) => (
                <tr key={shipment.id} className="bg-white border-b hover:bg-gray-50">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                  >
                    {shipment.id}
                  </th>
                  <td className="px-6 py-4">{shipment.customer}</td>
                  <td className="px-6 py-4">{shipment.destination}</td>
                  <td className="px-6 py-4">{shipment.price}</td>
                  <td className="px-6 py-4">
                    <span
                      className={classNames(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        getStatusClass(shipment.status)
                      )}
                    >
                      {getStatusText(shipment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">{shipment.date}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/staff/shipments/${shipment.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 flex justify-end">
          <Link
            href="/staff/shipments"
            className="text-sm text-blue-600 hover:underline flex items-center"
          >
            Lihat semua pengiriman
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Tugas Hari Ini</h3>
        </div>
        <div className="p-6">
          <ul className="space-y-4">
            <li className="flex items-start pb-4 border-b border-gray-200">
              <div className="flex items-center h-5">
                <input
                  id="task-1"
                  name="task-1"
                  type="checkbox"
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                />
              </div>
              <label htmlFor="task-1" className="ml-3 text-sm font-medium text-gray-900">
                Konfirmasi pengambilan paket dari PT Maju Jaya (WUZZ12345678)
              </label>
            </li>
            <li className="flex items-start pb-4 border-b border-gray-200">
              <div className="flex items-center h-5">
                <input
                  id="task-2"
                  name="task-2"
                  type="checkbox"
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                />
              </div>
              <label htmlFor="task-2" className="ml-3 text-sm font-medium text-gray-900">
                Update status pengiriman WUZZ12345680 ke gudang Medan
              </label>
            </li>
            <li className="flex items-start pb-4 border-b border-gray-200">
              <div className="flex items-center h-5">
                <input
                  id="task-3"
                  name="task-3"
                  type="checkbox"
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                />
              </div>
              <label htmlFor="task-3" className="ml-3 text-sm font-medium text-gray-900">
                Koordinasi dengan kurir untuk pengiriman ke Makassar
              </label>
            </li>
            <li className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="task-4"
                  name="task-4"
                  type="checkbox"
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                />
              </div>
              <label htmlFor="task-4" className="ml-3 text-sm font-medium text-gray-900">
                Membuat laporan pengiriman mingguan
              </label>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 