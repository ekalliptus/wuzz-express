'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  UserIcon,
  PencilSquareIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  KeyIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

// Data status dan teks yang digunakan di beberapa tempat
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

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Data dummy untuk riwayat pesanan - pindahkan ke useMemo
  const orderHistory = useMemo(() => [
    {
      id: 'WUZZ87654321',
      date: '10 Apr 2024',
      status: 'delivered',
      destination: 'Jakarta',
      total: 'Rp 85.000'
    },
    {
      id: 'WUZZ87654322',
      date: '02 Apr 2024',
      status: 'delivered',
      destination: 'Bandung',
      total: 'Rp 72.500'
    },
    {
      id: 'WUZZ87654323',
      date: '09 Mar 2024',
      status: 'delivered',
      destination: 'Surabaya',
      total: 'Rp 125.000'
    },
  ], []);
  
  // Data dummy untuk alamat tersimpan - pindahkan ke useMemo
  const savedAddresses = useMemo(() => [
    {
      id: 1,
      name: 'Rumah',
      address: 'Jl. Merdeka No. 123, Kelurahan Sukamaju',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12345',
      isDefault: true
    },
    {
      id: 2,
      name: 'Kantor',
      address: 'Menara Tinggi Lt. 12, Jl. Sudirman No. 45',
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
      postalCode: '10220',
      isDefault: false
    }
  ], []);
  
  // Data dummy untuk kartu pembayaran tersimpan - pindahkan ke useMemo
  const savedPayments = useMemo(() => [
    {
      id: 1,
      type: 'Credit Card',
      number: '**** **** **** 1234',
      expiry: '06/25',
      name: 'JOHN DOE',
      isDefault: true
    },
    {
      id: 2,
      type: 'Debit Card',
      number: '**** **** **** 5678',
      expiry: '09/26',
      name: 'JOHN DOE',
      isDefault: false
    }
  ], []);
  
  // Fungsi untuk mendapatkan kelas status - optimasi dengan memoization
  const getStatusClass = useCallback((status: string): string => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.class || 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
  }, []);

  // Fungsi untuk mendapatkan teks status - optimasi dengan memoization
  const getStatusText = useCallback((status: string): string => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.text || status;
  }, []);
  
  // Fungsi helper untuk menggabungkan kelas - optimasi dengan memoization
  const classNames = useCallback((...classes: string[]): string => {
    return classes.filter(Boolean).join(' ');
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 pt-16">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-20">
              {/* User info */}
              <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 bg-blue-200 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold">{user?.name || 'Pengguna'}</h2>
                    <p className="text-blue-100 text-sm">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>
                <div className="text-sm text-blue-100 flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  <span>Pengguna Terverifikasi</span>
                </div>
              </div>
              
              {/* Menu */}
              <nav className="p-2">
                {[
                  { id: 'profile', icon: UserIcon, label: 'Data Pribadi' },
                  { id: 'addresses', icon: MapPinIcon, label: 'Alamat Tersimpan' },
                  { id: 'payment', icon: CreditCardIcon, label: 'Pembayaran' },
                  { id: 'orders', icon: ClipboardDocumentListIcon, label: 'Riwayat Pesanan' },
                  { id: 'settings', icon: KeyIcon, label: 'Keamanan & Privasi' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={classNames(
                      activeTab === item.id 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50',
                      'flex items-center w-full px-4 py-3 rounded-lg transition-colors'
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Content area */}
          <div className="flex-1">
            {/* Profile content */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Data Pribadi</h2>
                  <button className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium">
                    <PencilSquareIcon className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Nama Lengkap</h3>
                    <p className="text-gray-900">{user?.name || 'Pengguna Demo'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                    <p className="text-gray-900">{user?.email || 'user@example.com'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Nomor Telepon</h3>
                    <p className="text-gray-900">{user?.phone || '0812-3456-7890'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Tanggal Lahir</h3>
                    <p className="text-gray-900">10 Januari 1990</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Jenis Kelamin</h3>
                    <p className="text-gray-900">Laki-laki</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Tanggal Bergabung</h3>
                    <p className="text-gray-900">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '20 Mei 2023'}</p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Kontak Darurat</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Nama</h4>
                        <p className="text-gray-900">Ahmad Setiawan</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Hubungan</h4>
                        <p className="text-gray-900">Saudara</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Nomor Telepon</h4>
                        <p className="text-gray-900">0857-1234-5678</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Addresses content */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-xl shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Alamat Tersimpan</h2>
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      + Tambah Alamat
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {savedAddresses.map((address) => (
                    <div key={address.id} className="p-6">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center mb-2">
                            <h3 className="font-medium text-gray-900">{address.name}</h3>
                            {address.isDefault && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                Utama
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 mb-1">{address.address}</p>
                          <p className="text-gray-700 mb-1">{address.city}, {address.province}</p>
                          <p className="text-gray-700">Kode Pos: {address.postalCode}</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <button className="text-gray-500 hover:text-gray-700">
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      {!address.isDefault && (
                        <button className="mt-4 text-sm text-blue-600 font-medium">
                          Jadikan Alamat Utama
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Payment methods content */}
            {activeTab === 'payment' && (
              <div className="bg-white rounded-xl shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Metode Pembayaran</h2>
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      + Tambah Kartu
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {savedPayments.map((payment) => (
                    <div key={payment.id} className="p-6">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center mb-2">
                            <CreditCardIcon className="h-5 w-5 text-gray-500 mr-2" />
                            <h3 className="font-medium text-gray-900">{payment.type}</h3>
                            {payment.isDefault && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                Utama
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 mb-1">{payment.number}</p>
                          <p className="text-gray-500 text-sm">Expired: {payment.expiry}</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <button className="text-gray-500 hover:text-gray-700">
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      {!payment.isDefault && (
                        <button className="mt-4 text-sm text-blue-600 font-medium">
                          Jadikan Metode Utama
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Order history content */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Riwayat Pesanan</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {orderHistory.map((order) => (
                    <div key={order.id} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-4 md:mb-0">
                          <div className="flex items-center mb-1">
                            <h3 className="font-medium text-gray-900 mr-2">{order.id}</h3>
                            <span
                              className={classNames(
                                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                getStatusClass(order.status)
                              )}
                            >
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm">{order.date}</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 md:items-center">
                          <div>
                            <p className="text-sm text-gray-500">Tujuan</p>
                            <p className="font-medium">{order.destination}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="font-medium">{order.total}</p>
                          </div>
                          
                          <Link 
                            href={`/lacak?tracking=${order.id}`}
                            className="text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors inline-flex items-center"
                          >
                            Detail
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Security and privacy content */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Keamanan & Privasi</h2>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4">Ubah Password</h3>
                    <div className="grid grid-cols-1 gap-4 max-w-md">
                      {['current', 'new', 'confirm'].map((passwordType) => (
                        <div key={passwordType}>
                          <label htmlFor={`${passwordType}-password`} className="block text-sm font-medium text-gray-700 mb-1">
                            {passwordType === 'current' ? 'Password Saat Ini' : 
                             passwordType === 'new' ? 'Password Baru' : 'Konfirmasi Password Baru'}
                          </label>
                          <input
                            type="password"
                            id={`${passwordType}-password`}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                            placeholder="••••••••"
                          />
                        </div>
                      ))}
                      
                      <div className="mt-2">
                        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                          Simpan Perubahan
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-base font-medium text-gray-900 mb-4">Preferensi Notifikasi</h3>
                    <div className="space-y-4">
                      {[
                        { id: 'email', label: 'Email Pengiriman', desc: 'Dapatkan update status pengiriman via email', defaultChecked: true },
                        { id: 'sms', label: 'SMS Notifikasi', desc: 'Dapatkan update status pengiriman via SMS', defaultChecked: true },
                        { id: 'promo', label: 'Promosi & Penawaran', desc: 'Dapatkan informasi promosi dan diskon', defaultChecked: false }
                      ].map((notification) => (
                        <div key={notification.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{notification.label}</p>
                            <p className="text-sm text-gray-500">{notification.desc}</p>
                          </div>
                          <div className="relative inline-block w-10 mr-2 align-middle select-none">
                            <input
                              type="checkbox"
                              id={`notification-${notification.id}`}
                              defaultChecked={notification.defaultChecked}
                              className="sr-only"
                            />
                            <label
                              htmlFor={`notification-${notification.id}`}
                              className="toggle-label block h-6 w-11 rounded-full bg-gray-300 cursor-pointer"
                            ></label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .toggle-label {
          transition: background-color 0.2s ease-in;
        }
        .toggle-label:after {
          content: "";
          @apply absolute left-0.5 top-0.5 bg-white h-5 w-5 rounded-full transition-all;
        }
        input:checked + .toggle-label {
          @apply bg-blue-600;
        }
        input:checked + .toggle-label:after {
          @apply transform translate-x-5;
        }
      `}</style>
    </div>
  );
} 