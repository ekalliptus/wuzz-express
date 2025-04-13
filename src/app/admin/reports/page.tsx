'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { 
  DocumentTextIcon, 
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  TruckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { getReports } from '@/app/actions';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();

  // Fetch data reports dari database
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching reports data...');
      const result = await getReports(activeTab !== 'all' ? activeTab : undefined);
      console.log('Fetched reports data:', result);
      
      // Cek apakah ada error dari server action
      if (result.error) {
        setError(result.error);
        setReports([]);
        return;
      }
      
      // Handle berbagai format data berdasarkan API atau direct DB access
      if (result.data) {
        // Format dari API response
        setReports(result.data);
      } else if (result.statusSummary || result.weeklyTrend) {
        // Format dari direct DB access - ubah ke format yang diharapkan oleh UI
        const formattedReports = [];
        
        if (activeTab === 'status' || activeTab === 'all') {
          formattedReports.push({
            id: 'status-report',
            title: 'Laporan Status Pengiriman',
            description: 'Ringkasan jumlah pengiriman berdasarkan status',
            type: 'status',
            format: 'pdf',
            period: 'Bulan Ini',
            last_generated: new Date().toISOString(),
            data: result.statusSummary
          });
        }
        
        if (activeTab === 'shipping' || activeTab === 'all') {
          formattedReports.push({
            id: 'shipping-trend',
            title: 'Tren Pengiriman Mingguan',
            description: 'Analisis tren pengiriman dalam 3 bulan terakhir',
            type: 'shipping',
            format: 'pdf',
            period: '3 Bulan Terakhir',
            last_generated: new Date().toISOString(),
            data: result.weeklyTrend
          });
        }
        
        setReports(formattedReports);
      } else {
        // Tidak ada data yang didukung
        setReports([]);
      }
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Gagal memuat data laporan. Silakan coba lagi nanti.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Load data laporan saat komponen dimuat
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchReports();
    }
  }, [isAuthenticated, user, fetchReports, activeTab]);

  // Redirect jika bukan admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

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

  // Dapatkan icon berdasarkan tipe laporan
  const getReportIcon = (type: string) => {
    switch (type) {
      case 'shipping':
        return <TruckIcon className="h-8 w-8 text-blue-500" />;
      case 'financial':
        return <CurrencyDollarIcon className="h-8 w-8 text-green-500" />;
      case 'status':
        return <DocumentChartBarIcon className="h-8 w-8 text-purple-500" />;
      case 'performance':
        return <DocumentChartBarIcon className="h-8 w-8 text-orange-500" />;
      default:
        return <DocumentTextIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Laporan</h1>
        <p className="text-gray-600">Akses dan unduh laporan untuk analisis data bisnis Anda</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('all')}
              className={classNames(
                "inline-block py-2 px-4 text-sm font-medium",
                activeTab === 'all'
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
              )}
            >
              Semua
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('shipping')}
              className={classNames(
                "inline-block py-2 px-4 text-sm font-medium",
                activeTab === 'shipping'
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
              )}
            >
              Pengiriman
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('financial')}
              className={classNames(
                "inline-block py-2 px-4 text-sm font-medium",
                activeTab === 'financial'
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
              )}
            >
              Keuangan
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('status')}
              className={classNames(
                "inline-block py-2 px-4 text-sm font-medium",
                activeTab === 'status'
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
              )}
            >
              Status
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('performance')}
              className={classNames(
                "inline-block py-2 px-4 text-sm font-medium",
                activeTab === 'performance'
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
              )}
            >
              Performa
            </button>
          </li>
        </ul>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-800 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Error:</p>
              <p className="mt-1">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-4 inline-flex items-center p-1.5 bg-red-50 text-red-700 rounded-full hover:bg-red-100"
              aria-label="Tutup"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="mt-3 flex justify-end">
            <button 
              onClick={() => fetchReports()}
              className="text-sm font-medium px-3 py-1.5 bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              Coba Lagi
            </button>
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-sm font-medium px-3 py-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Laporan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-lg border shadow-sm animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-full mb-3"></div>
              <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded mb-6 w-2/3"></div>
              <div className="flex justify-between">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))
        ) : reports && reports.length > 0 ? (
          reports.map((report) => (
            <div key={report.id} className="bg-white p-5 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">
                {getReportIcon(report.type)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{report.description}</p>
              
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>Periode: {report.period}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                <span>Format: {report.format.toUpperCase()}</span>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Terakhir diperbarui: {formatDate(report.last_generated)}
                </span>
                
                <button
                  onClick={() => window.alert(`Unduh laporan ${report.title}`)}
                  className="text-sm flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Unduh
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada laporan</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tidak ada laporan yang tersedia untuk kategori ini saat ini.
            </p>
          </div>
        )}
      </div>

      {/* Buat Laporan Baru */}
      <div className="mt-8 bg-blue-50 p-5 rounded-lg border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Buat Laporan Kustom</h3>
            <p className="text-gray-600 text-sm">Hasilkan laporan khusus berdasarkan parameter yang Anda tentukan</p>
          </div>
          <button className="mt-3 md:mt-0 inline-flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <DocumentChartBarIcon className="h-5 w-5 mr-1" />
            Buat Laporan
          </button>
        </div>
      </div>
    </div>
  );
} 