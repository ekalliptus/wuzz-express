'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TruckIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowPathIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { ChartBarIcon, HomeIcon } from '@heroicons/react/24/solid';

// Data statistik dummy
const stats = [
  { name: 'Total Pengiriman', value: '3,256', icon: TruckIcon, change: '12%', changeType: 'increase' },
  { name: 'Pengiriman Dalam Proses', value: '356', icon: ArrowPathIcon, change: '5.4%', changeType: 'increase' },
  { name: 'Pelanggan Aktif', value: '1,467', icon: UsersIcon, change: '3.2%', changeType: 'increase' },
  { name: 'Pendapatan Bulan Ini', value: 'Rp 276.3jt', icon: CurrencyRupeeIcon, change: '8.1%', changeType: 'increase' },
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
  {
    id: 'WUZZ12345682',
    customer: 'PT Abadi Sentosa',
    destination: 'Yogyakarta',
    price: 'Rp 97,500',
    status: 'delivered',
    date: '07 Apr 2024',
  },
];

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon, current: true },
  { name: 'Pengiriman', href: '/admin/shipments', icon: TruckIcon, current: false },
  { name: 'Pelanggan', href: '/admin/customers', icon: UsersIcon, current: false },
  { name: 'Lokasi', href: '/admin/locations', icon: MapPinIcon, current: false },
  { name: 'Laporan', href: '/admin/reports', icon: ChartBarIcon, current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-600 rounded cursor-pointer lg:hidden hover:text-gray-900 hover:bg-gray-100"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <div className="flex items-center ml-2 md:mr-24">
                <span className="self-center text-xl font-semibold whitespace-nowrap">Wuzz Admin</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center ml-3">
                <div>
                  <button
                    type="button"
                    className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300"
                  >
                    <UserCircleIcon className="w-8 h-8 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <aside
        className={classNames(
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200 lg:translate-x-0'
        )}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
          <ul className="space-y-2 font-medium">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    'group flex items-center p-2 rounded-lg'
                  )}
                >
                  <item.icon
                    className={classNames(
                      item.current ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-900',
                      'w-5 h-5 me-3'
                    )}
                  />
                  <span className="ms-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="p-4 lg:ml-64 mt-14">
        <div className="p-4 mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Selamat datang kembali, Admin! Berikut adalah ringkasan data Wuzz Ekspedisi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                  {stat.change} dari bulan lalu
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pengiriman Terbaru</h3>
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
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {shipment.id}
                    </th>
                    <td className="px-6 py-4">{shipment.customer}</td>
                    <td className="px-6 py-4">{shipment.destination}</td>
                    <td className="px-6 py-4">{shipment.price}</td>
                    <td className="px-6 py-4">
                      <span
                        className={classNames(
                          getStatusClass(shipment.status),
                          'inline-flex rounded-full px-2 text-xs font-semibold py-0.5'
                        )}
                      >
                        {getStatusText(shipment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{shipment.date}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/shipments/${shipment.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200">
            <Link
              href="/admin/shipments"
              className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-700"
            >
              Lihat semua pengiriman
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <TruckIcon className="w-4 h-4" />
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">
                    Pengiriman <span className="font-medium">WUZZ12345678</span> sedang dalam perjalanan ke Surabaya
                  </p>
                  <p className="text-xs text-gray-500">2 jam yang lalu</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <TruckIcon className="w-4 h-4" />
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">
                    Pengiriman <span className="font-medium">WUZZ12345679</span> telah diterima oleh Toko Makmur
                  </p>
                  <p className="text-xs text-gray-500">3 jam yang lalu</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <UsersIcon className="w-4 h-4" />
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">
                    Pelanggan baru <span className="font-medium">PT Sejahtera Abadi</span> telah mendaftar
                  </p>
                  <p className="text-xs text-gray-500">5 jam yang lalu</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <CurrencyRupeeIcon className="w-4 h-4" />
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">
                    Pembayaran <span className="font-medium">Rp 2,500,000</span> diterima dari PT Maju Jaya
                  </p>
                  <p className="text-xs text-gray-500">1 hari yang lalu</p>
                </div>
              </li>
            </ul>
            <div className="mt-4">
              <Link
                href="/admin/activities"
                className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-700"
              >
                Lihat semua aktivitas
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kinerja Pengiriman</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Pengiriman Tepat Waktu</span>
                  <span className="text-sm font-medium text-gray-700">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Kepuasan Pelanggan</span>
                  <span className="text-sm font-medium text-gray-700">95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Pengiriman Tanpa Kerusakan</span>
                  <span className="text-sm font-medium text-gray-700">98%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Efisiensi Rute</span>
                  <span className="text-sm font-medium text-gray-700">87%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Rata-rata Waktu Pengiriman</p>
                <p className="text-xl font-semibold text-gray-900">2.3 hari</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Total Pengiriman Bulan Ini</p>
                <p className="text-xl font-semibold text-gray-900">1,247</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 