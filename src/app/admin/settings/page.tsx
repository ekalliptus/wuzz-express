'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { 
  CogIcon, 
  UserCircleIcon,
  ShieldCheckIcon,
  BellIcon,
  EnvelopeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();

  // Dummy form state untuk demo
  const [accountForm, setAccountForm] = useState({
    name: 'Admin Wuzz',
    email: 'admin@wuzz.co.id',
    phone: '081234567890'
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [companyForm, setCompanyForm] = useState({
    company_name: 'PT Wuzz Express Indonesia',
    company_address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    company_phone: '021-5551234',
    company_email: 'info@wuzz.co.id',
    tax_id: '123.456.789.0-000.000'
  });

  const [notificationForm, setNotificationForm] = useState({
    email_notifications: true,
    sms_notifications: false,
    marketing_email: false,
    shipment_updates: true,
    security_alerts: true
  });

  // Redirect jika bukan admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleAccountFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanyFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (field: string) => {
    setNotificationForm(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulasi proses penyimpanan
    setTimeout(() => {
      setLoading(false);
      setSuccess('Pengaturan berhasil disimpan');
      
      // Menghilangkan pesan sukses setelah 3 detik
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    }, 1000);
  };

  const handleResetForm = () => {
    if (activeTab === 'account') {
      setAccountForm({
        name: 'Admin Wuzz',
        email: 'admin@wuzz.co.id',
        phone: '081234567890'
      });
    } else if (activeTab === 'password') {
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } else if (activeTab === 'company') {
      setCompanyForm({
        company_name: 'PT Wuzz Express Indonesia',
        company_address: 'Jl. Sudirman No. 123, Jakarta Pusat',
        company_phone: '021-5551234',
        company_email: 'info@wuzz.co.id',
        tax_id: '123.456.789.0-000.000'
      });
    }
  };

  // Helper untuk render form berdasarkan tab aktif
  const renderForm = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={accountForm.name}
                onChange={handleAccountFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={accountForm.email}
                onChange={handleAccountFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={accountForm.phone}
                onChange={handleAccountFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );
        
      case 'password':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                Password Saat Ini
              </label>
              <input
                type="password"
                id="current_password"
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePasswordFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                Password Baru
              </label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Password minimal 8 karakter dengan huruf besar, huruf kecil, angka, dan simbol
              </p>
            </div>
            
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );
        
      case 'company':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Perusahaan
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={companyForm.company_name}
                onChange={handleCompanyFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Perusahaan
              </label>
              <input
                type="text"
                id="company_address"
                name="company_address"
                value={companyForm.company_address}
                onChange={handleCompanyFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telepon Perusahaan
                </label>
                <input
                  type="tel"
                  id="company_phone"
                  name="company_phone"
                  value={companyForm.company_phone}
                  onChange={handleCompanyFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="company_email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Perusahaan
                </label>
                <input
                  type="email"
                  id="company_email"
                  name="company_email"
                  value={companyForm.company_email}
                  onChange={handleCompanyFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700 mb-1">
                NPWP
              </label>
              <input
                type="text"
                id="tax_id"
                name="tax_id"
                value={companyForm.tax_id}
                onChange={handleCompanyFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );
        
      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Email Notifikasi</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Notifikasi Email</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notificationForm.email_notifications}
                      onChange={() => handleNotificationToggle('email_notifications')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BellIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Notifikasi SMS</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notificationForm.sms_notifications}
                      onChange={() => handleNotificationToggle('sms_notifications')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Jenis Notifikasi</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Notifikasi Keamanan</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notificationForm.security_alerts}
                      onChange={() => handleNotificationToggle('security_alerts')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Update Pengiriman</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notificationForm.shipment_updates}
                      onChange={() => handleNotificationToggle('shipment_updates')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Email Marketing</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notificationForm.marketing_email}
                      onChange={() => handleNotificationToggle('marketing_email')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Helper untuk mendapatkan icon berdasarkan tab
  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'account':
        return <UserCircleIcon className="w-5 h-5" />;
      case 'password':
        return <ShieldCheckIcon className="w-5 h-5" />;
      case 'company':
        return <BuildingOfficeIcon className="w-5 h-5" />;
      case 'notifications':
        return <BellIcon className="w-5 h-5" />;
      case 'billing':
        return <CurrencyDollarIcon className="w-5 h-5" />;
      case 'timezone':
        return <ClockIcon className="w-5 h-5" />;
      default:
        return <CogIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pengaturan</h1>
        <p className="text-gray-600">Kelola pengaturan akun, perusahaan, dan preferensi aplikasi Anda</p>
      </div>

      {/* Success/Error Notification */}
      {success && (
        <div className="mb-4 p-3 border border-green-300 bg-green-50 text-green-800 rounded-lg">
          <p className="font-medium">{success}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-800 rounded-lg">
          <p className="font-medium">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-1 text-sm font-medium text-red-600 hover:text-red-800"
          >
            Tutup
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200">
            <nav className="p-4">
              <ul className="space-y-1">
                {['account', 'password', 'company', 'notifications'].map((tab) => (
                  <li key={tab}>
                    <button
                      onClick={() => setActiveTab(tab)}
                      className={classNames(
                        "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md",
                        activeTab === tab
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <span className={classNames(
                        "mr-3",
                        activeTab === tab ? "text-blue-500" : "text-gray-400"
                      )}>
                        {getTabIcon(tab)}
                      </span>
                      <span className="capitalize">
                        {tab === 'account' ? 'Akun' : 
                         tab === 'password' ? 'Password' :
                         tab === 'company' ? 'Perusahaan' :
                         tab === 'notifications' ? 'Notifikasi' : tab}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              
              <div className="border-t mt-5 pt-5 border-gray-200">
                <ul className="space-y-1">
                  {['billing', 'timezone'].map((tab) => (
                    <li key={tab}>
                      <button
                        onClick={() => setActiveTab(tab)}
                        className={classNames(
                          "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md",
                          activeTab === tab
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <span className={classNames(
                          "mr-3",
                          activeTab === tab ? "text-blue-500" : "text-gray-400"
                        )}>
                          {getTabIcon(tab)}
                        </span>
                        <span className="capitalize">
                          {tab === 'billing' ? 'Penagihan' : 
                           tab === 'timezone' ? 'Zona Waktu' : tab}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="mb-5">
              <h2 className="text-lg font-medium text-gray-900 capitalize">
                {activeTab === 'account' ? 'Pengaturan Akun' : 
                 activeTab === 'password' ? 'Ubah Password' :
                 activeTab === 'company' ? 'Informasi Perusahaan' :
                 activeTab === 'notifications' ? 'Pengaturan Notifikasi' :
                 activeTab === 'billing' ? 'Pengaturan Penagihan' :
                 activeTab === 'timezone' ? 'Pengaturan Zona Waktu' : activeTab}
              </h2>
              {(activeTab === 'billing' || activeTab === 'timezone') && (
                <p className="text-sm text-gray-500 mt-1">
                  Fitur ini akan segera tersedia.
                </p>
              )}
            </div>
            
            <form onSubmit={handleSubmit}>
              {!['billing', 'timezone'].includes(activeTab) ? (
                <>
                  {renderForm()}
                  
                  <div className="mt-6 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className={classNames(
                        "inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        loading ? "opacity-70 cursor-not-allowed" : ""
                      )}
                      disabled={loading}
                    >
                      {loading && (
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Simpan Perubahan
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <CogIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Pengembangan Berlangsung</h3>
                  <p className="text-gray-500 mb-5">
                    Fitur ini sedang dalam pengembangan dan akan segera tersedia.
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onClick={() => setActiveTab('account')}
                  >
                    Kembali ke Pengaturan Akun
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 