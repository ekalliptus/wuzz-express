'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  TruckIcon,
  MapPinIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  PhoneIcon,
  EnvelopeIcon,
  BellIcon,
  Cog8ToothIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { HomeIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/hooks/useAuth';

// Konfigurasi status untuk digunakan di beberapa tempat
const STATUS_CONFIG = {
  delivered: {
    class: 'bg-green-100 text-green-800 ring-1 ring-green-600/20',
    text: 'Terkirim'
  },
  in_transit: {
    class: 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20',
    text: 'Dalam Pengiriman'
  },
  processing: {
    class: 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-600/20',
    text: 'Diproses'
  },
  pending: {
    class: 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20',
    text: 'Menunggu'
  }
};

// Konfigurasi progress bar
const PROGRESS_COLOR_CONFIG = {
  full: 'bg-green-500',   // 100%
  high: 'bg-blue-500',    // > 60%
  medium: 'bg-yellow-500', // > 30%
  low: 'bg-gray-500'      // < 30%
};

// Data pengiriman dummy - pindahkan ke luar komponen untuk menghindari re-render
const myShipments = [
  {
    id: 'WUZZ87654321',
    destination: 'Jakarta',
    status: 'in_transit',
    date: '10 Apr 2024',
    estimatedArrival: '14 Apr 2024',
    progress: 65,
  },
  {
    id: 'WUZZ87654322',
    destination: 'Bandung',
    status: 'delivered',
    date: '02 Apr 2024',
    estimatedArrival: '05 Apr 2024',
    progress: 100,
  },
  {
    id: 'WUZZ87654323',
    destination: 'Surabaya',
    status: 'processing',
    date: '09 Apr 2024',
    estimatedArrival: '14 Apr 2024',
    progress: 30,
  },
];

// Navigasi - pindahkan ke luar komponen
const navigation = [
  { name: 'Beranda', href: '/user/dashboard', icon: HomeIcon, current: true },
  { name: 'Lacak', href: '/lacak', icon: TruckIcon, current: false },
  { name: 'Riwayat', href: '/user/shipments', icon: ClipboardDocumentListIcon, current: false },
];

export default function UserDashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useAuth();
  
  // Gunakan useEffect dengan cleanup function untuk menghindari memory leak
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update setiap menit
    
    return () => clearInterval(timer);
  }, []);

  // Optimasi formatGreeting dengan useCallback
  const formatGreeting = useCallback(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  }, [currentTime]);

  // Optimasi getStatusClass dengan useCallback
  const getStatusClass = useCallback((status: string): string => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.class || 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
  }, []);

  // Optimasi getStatusText dengan useCallback
  const getStatusText = useCallback((status: string): string => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.text || status;
  }, []);
  
  // Optimasi getProgressColorClass dengan useCallback
  const getProgressColorClass = useCallback((progress: number): string => {
    if (progress === 100) return PROGRESS_COLOR_CONFIG.full;
    if (progress > 60) return PROGRESS_COLOR_CONFIG.high;
    if (progress > 30) return PROGRESS_COLOR_CONFIG.medium;
    return PROGRESS_COLOR_CONFIG.low;
  }, []);

  // Optimasi classNames dengan useCallback
  const classNames = useCallback((...classes: string[]): string => {
    return classes.filter(Boolean).join(' ');
  }, []);
  
  // Data untuk quick actions cards
  const quickActions = useMemo(() => [
    {
      icon: TruckIcon,
      title: 'Lacak Kiriman',
      description: 'Pantau status pengiriman Anda secara real-time dengan memasukkan nomor resi.',
      link: '/lacak',
      linkText: 'Lacak sekarang',
      color: 'blue'
    },
    {
      icon: ShoppingBagIcon,
      title: 'Kirim Paket',
      description: 'Kirim paket Anda dengan mudah melalui layanan pengiriman kami.',
      link: '/kirim',
      linkText: 'Kirim paket',
      color: 'green'
    },
    {
      icon: ClipboardDocumentListIcon,
      title: 'Riwayat Pengiriman',
      description: 'Lihat riwayat pengiriman Anda untuk memantau seluruh aktivitas.',
      link: '/user/shipments',
      linkText: 'Lihat riwayat',
      color: 'purple'
    }
  ], []);
  
  // Format tanggal dengan useMemo
  const formattedDate = useMemo(() => {
    return currentTime.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }, [currentTime]);

  // Data panduan pengiriman
  const shippingGuides = useMemo(() => [
    'Cara mengemas barang dengan aman',
    'Ketentuan barang yang tidak boleh dikirim',
    'Cara menghitung berat volumetrik',
    'FAQ seputar pengiriman'
  ], []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center ml-2 md:mr-24">
                <TruckIcon className="h-8 w-8 text-blue-600 mr-2" />
                <span className="self-center text-xl font-semibold whitespace-nowrap text-blue-600">Wuzz Express</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <BellIcon className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <Cog8ToothIcon className="w-6 h-6" />
              </button>
              <div className="flex items-center">
                <Link
                  href="/user/profile"
                  className="flex text-sm bg-gray-800 rounded-full ring-2 ring-gray-300 hover:ring-blue-500 transition-all"
                >
                  <UserCircleIcon className="w-8 h-8 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        <div className="mx-auto max-w-7xl px-4">
          {/* Status Akun */}
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
            <div className="flex items-center">
              <CheckBadgeIcon className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <h5 className="text-sm font-medium text-gray-900">Status Akun</h5>
                <p className="text-xs text-blue-600">Pengguna Terverifikasi</p>
              </div>
            </div>
            <Link href="/user/profile" className="text-xs text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 bg-blue-50 rounded-lg">
              Lihat Profil
            </Link>
          </div>
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl shadow-lg mb-8 p-6 text-white mt-6">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-bold">{formatGreeting()}, {user?.name || 'Pengguna'}!</h1>
                <p className="mt-1 text-blue-100">{formattedDate}</p>
                <p className="mt-4 text-blue-100">
                  Pantau pengiriman Anda dengan mudah melalui dashboard pribadi Anda.
                </p>
              </div>
              <div className="flex items-center">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl flex flex-col items-center backdrop-filter">
                  <span className="text-3xl font-bold">{myShipments.length}</span>
                  <span className="text-sm text-blue-100">Pengiriman Aktif</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {quickActions.map((action, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg group"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-xl bg-${action.color}-100 text-${action.color}-600 group-hover:bg-${action.color}-600 group-hover:text-white transition-all`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <h3 className="ml-4 text-xl font-semibold">{action.title}</h3>
                </div>
                <p className="mb-4 text-gray-600">{action.description}</p>
                <Link
                  href={action.link}
                  className={`inline-flex items-center text-${action.color}-600 hover:text-${action.color}-800 font-medium transition-colors group-hover:translate-x-1`}
                >
                  {action.linkText}
                  <ArrowRightIcon className="w-4 h-4 ml-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
          
          {/* Pengiriman Aktif */}
          <div className="bg-white rounded-xl shadow-md mb-8 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Pengiriman Aktif</h3>
              <button className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50">
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            </div>
            
            {myShipments.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">Anda belum memiliki pengiriman aktif</p>
                <Link href="/kirim" className="mt-3 inline-flex items-center text-blue-600 font-medium">
                  Kirim paket sekarang
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {myShipments.map((shipment) => (
                  <div key={shipment.id} className="p-5 transition-colors hover:bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="mb-4 lg:mb-0">
                        <p className="text-sm text-gray-500">No. Resi</p>
                        <div className="flex items-center">
                          <h4 className="text-lg font-semibold text-gray-900">{shipment.id}</h4>
                          <span
                            className={classNames(
                              'ml-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                              getStatusClass(shipment.status)
                            )}
                          >
                            {getStatusText(shipment.status)}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4 lg:mb-0 lg:grid-cols-3">
                        <div>
                          <p className="text-sm text-gray-500">Tujuan</p>
                          <p className="text-sm font-medium">{shipment.destination}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tanggal Kirim</p>
                          <p className="text-sm font-medium">{shipment.date}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Estimasi Tiba</p>
                          <p className="text-sm font-medium">{shipment.estimatedArrival}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Link
                          href={`/lacak?tracking=${shipment.id}`}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                          Lacak
                        </Link>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${getProgressColorClass(shipment.progress)}`}
                          style={{ width: `${shipment.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="p-4 flex justify-end bg-gray-50">
              <Link
                href="/user/shipments"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center transition-colors"
              >
                Lihat semua pengiriman
                <ArrowRightIcon className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Bantuan & Informasi */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Bantuan & Informasi</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <h4 className="text-base font-medium mb-3 text-gray-900">Hubungi Kami</h4>
                  <p className="text-gray-600 mb-4">Jika Anda memiliki pertanyaan atau masalah, silakan hubungi kami.</p>
                  <div className="flex items-center mb-3 hover:text-blue-600 transition-colors">
                    <PhoneIcon className="w-5 h-5 text-blue-500 mr-3" />
                    <a href="tel:08001234567" className="text-gray-700 hover:text-blue-600 transition-colors">0800-1234-5678</a>
                  </div>
                  <div className="flex items-center hover:text-blue-600 transition-colors">
                    <EnvelopeIcon className="w-5 h-5 text-blue-500 mr-3" />
                    <a href="mailto:support@wuzz.co.id" className="text-gray-700 hover:text-blue-600 transition-colors">support@wuzz.co.id</a>
                  </div>
                </div>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <h4 className="text-base font-medium mb-3 text-gray-900">Panduan Pengiriman</h4>
                  <ul className="space-y-2 text-gray-600">
                    {shippingGuides.map((guide, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium mr-2 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span>{guide}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>© 2024 Wuzz Express. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center">
        <div className="bg-white rounded-full shadow-lg px-1 py-1 flex items-center space-x-1 backdrop-blur-sm bg-white/90">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(
                item.current
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50',
                'flex flex-col items-center justify-center px-5 py-2 rounded-full transition-all duration-200'
              )}
            >
              <item.icon
                className={classNames(
                  item.current ? 'text-blue-600' : 'text-gray-500',
                  'w-6 h-6 mb-1'
                )}
              />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 