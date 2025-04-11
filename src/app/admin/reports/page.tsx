'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  DocumentTextIcon, 
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  TruckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// Data dummy untuk laporan
const DUMMY_REPORTS = [
  {
    id: 'rep001',
    title: 'Laporan Pengiriman Bulanan',
    description: 'Menampilkan statistik pengiriman dalam periode satu bulan',
    type: 'shipping',
    format: 'excel',
    last_generated: '2023-08-15T14:30:00Z',
    period: 'Agustus 2023'
  },
  {
    id: 'rep002',
    title: 'Laporan Pendapatan Harian',
    description: 'Menampilkan pendapatan harian dari semua pengiriman',
    type: 'financial',
    format: 'pdf',
    last_generated: '2023-08-20T09:15:00Z',
    period: '20 Agustus 2023'
  },
  {
    id: 'rep003',
    title: 'Laporan Status Pengiriman',
    description: 'Menampilkan statistik status pengiriman saat ini',
    type: 'status',
    format: 'excel',
    last_generated: '2023-08-18T11:45:00Z',
    period: 'Seluruh Waktu'
  },
  {
    id: 'rep004',
    title: 'Laporan Performa Kurir',
    description: 'Menampilkan statistik performa dan efisiensi kurir',
    type: 'performance',
    format: 'pdf',
    last_generated: '2023-08-10T16:20:00Z',
    period: 'Agustus 2023'
  },
  {
    id: 'rep005',
    title: 'Laporan Pengiriman Tahunan',
    description: 'Menampilkan statistik pengiriman dalam periode satu tahun',
    type: 'shipping',
    format: 'excel',
    last_generated: '2023-01-05T10:30:00Z',
    period: '2023'
  }
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Load dummy data untuk demo
  useEffect(() => {
    const fetchReports = () => {
      setLoading(true);
      try {
        // Filter berdasarkan tab aktif
        let filteredReports = [...DUMMY_REPORTS];
        if (activeTab !== 'all') {
          filteredReports = filteredReports.filter(report => report.type === activeTab);
        }
        
        setReports(filteredReports);
      } catch (err: any) {
        setError('Gagal memuat data laporan');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchReports();
    }
  }, [isAuthenticated, user, activeTab]);

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
      <div className="mb-5 border-b border-gray-200">
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
          <p className="font-medium">Error: {error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-1 text-sm font-medium text-red-600 hover:text-red-800"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Laporan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        ) : reports.length > 0 ? (
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
                
                <button className="inline-flex items-center py-1.5 px-3 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Unduh
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-8 rounded-lg border text-center">
            <div className="inline-block p-3 bg-blue-50 rounded-full mb-4">
              <DocumentTextIcon className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tidak ada laporan tersedia</h3>
            <p className="text-gray-500 mb-4">Tidak ada laporan yang tersedia untuk kategori ini</p>
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