'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapPinIcon, TruckIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { useShipment } from '@/hooks/useShipment';
import { useSearchParams } from 'next/navigation';

// Fungsi helper untuk format tanggal - di luar komponen untuk mencegah re-definisi saat render
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Objek konstanta untuk status pengiriman
const STATUS_CONFIG = {
  pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Menunggu Pickup' },
  processing: { color: 'bg-blue-100 text-blue-800', text: 'Diproses' },
  in_transit: { color: 'bg-indigo-100 text-indigo-800', text: 'Dalam Perjalanan' },
  delivered: { color: 'bg-green-100 text-green-800', text: 'Terkirim' },
  returned: { color: 'bg-red-100 text-red-800', text: 'Dikembalikan' },
  cancelled: { color: 'bg-gray-100 text-gray-800', text: 'Dibatalkan' },
  default: { color: 'bg-gray-100 text-gray-800', text: '' }
};

// Komponen StatusBadge dioptimalkan
const StatusBadge = ({ status }: { status: string }) => {
  // Menggunakan useMemo untuk menghindari perhitungan berulang
  const config = useMemo(() => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || 
           { ...STATUS_CONFIG.default, text: status };
  }, [status]);
  
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

// Komponen ShipmentDetail terpisah untuk menampilkan detail pengiriman
const ShipmentDetail = ({ shipment }: { shipment: any }) => {
  if (!shipment) return null;
  
  return (
    <div className="mt-8 overflow-hidden rounded-lg bg-white border border-gray-200">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Nomor Resi: {shipment.receiptNumber}
          </h3>
          <StatusBadge status={shipment.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-gray-200">
        <div className="px-6 py-5 border-b sm:border-b-0 sm:border-r border-gray-200">
          <h4 className="text-xs font-medium text-gray-500">Pengirim</h4>
          <p className="mt-1 text-sm font-medium text-gray-900">{shipment.sender?.name}</p>
          <p className="mt-1 text-sm text-gray-500">{shipment.sender?.address}</p>
          <p className="mt-1 text-sm text-gray-500">{shipment.sender?.phone}</p>
        </div>
        <div className="px-6 py-5">
          <h4 className="text-xs font-medium text-gray-500">Penerima</h4>
          <p className="mt-1 text-sm font-medium text-gray-900">{shipment.recipient?.name}</p>
          <p className="mt-1 text-sm text-gray-500">{shipment.recipient?.address}</p>
          <p className="mt-1 text-sm text-gray-500">{shipment.recipient?.phone}</p>
        </div>
      </div>

      <div className="px-6 py-5 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <h4 className="text-xs font-medium text-gray-500">Layanan</h4>
            <p className="text-sm font-medium text-gray-900">{shipment.serviceType?.name}</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-gray-500">Berat</h4>
            <p className="text-sm font-medium text-gray-900">{shipment.weight} kg</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-gray-500">Perkiraan Tiba</h4>
            <p className="text-sm font-medium text-gray-900">
              {shipment.estimatedDeliveryDate ? 
                formatDate(shipment.estimatedDeliveryDate.toString()) : 
                '-'}
            </p>
          </div>
        </div>
      </div>

      <TrackingHistory history={shipment.trackingHistory} />
    </div>
  );
};

// Komponen TrackingHistory terpisah untuk daftar riwayat tracking
const TrackingHistory = ({ history }: { history: any[] }) => {
  return (
    <div className="px-6 py-5">
      <h4 className="text-xs font-medium text-gray-500 mb-4">Riwayat Pengiriman</h4>
      <ol className="relative border-l border-gray-200">
        {history.map((event, index) => (
          <TrackingHistoryItem 
            key={index} 
            event={event} 
            index={index} 
            isLatest={index === 0}
            isLast={index === history.length - 1} 
          />
        ))}
      </ol>
    </div>
  );
};

// Komponen item riwayat tracking
const TrackingHistoryItem = ({ 
  event, 
  index, 
  isLatest,
  isLast 
}: { 
  event: any; 
  index: number; 
  isLatest: boolean;
  isLast: boolean;
}) => {
  // Menentukan icon berdasarkan posisi
  const icon = useMemo(() => {
    if (isLatest) return <ClockIcon className="w-4 h-4 text-blue-800" />;
    if (isLast) return <CheckCircleIcon className="w-4 h-4 text-blue-800" />;
    return <TruckIcon className="w-4 h-4 text-blue-800" />;
  }, [isLatest, isLast]);

  return (
    <li className="mb-10 ml-6">
      <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
        {icon}
      </span>
      <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">
        {event.status}
        {isLatest && (
          <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded ml-3">
            Terbaru
          </span>
        )}
      </h3>
      <time className="block mb-2 text-sm font-normal leading-none text-gray-400">
        {formatDate(event.timestamp.toString())}
      </time>
      <p className="mb-4 text-base font-normal text-gray-500">
        {event.description} ({event.location})
      </p>
    </li>
  );
};

// Komponen utama yang dioptimalkan
export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const { currentShipment, loading, error, trackShipment } = useShipment();
  const searchParams = useSearchParams();

  // Jika ada parameter tracking di URL, lacak otomatis - dioptimalkan dengan useEffect
  useEffect(() => {
    const tracking = searchParams.get('tracking');
    if (tracking) {
      setTrackingNumber(tracking);
      trackShipment(tracking);
    }
  }, [searchParams, trackShipment]);

  // Handler untuk input tracking number - dioptimalkan dengan useCallback
  const handleTrackingNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTrackingNumber(e.target.value);
  }, []);

  // Handler untuk submit form - dioptimalkan dengan useCallback
  const handleTrack = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      await trackShipment(trackingNumber);
    }
  }, [trackingNumber, trackShipment]);

  // Komponen header - dioptimalkan dengan useMemo
  const pageHeader = useMemo(() => (
    <div className="relative bg-blue-700">
      <div className="absolute inset-0">
        <img
          className="h-full w-full object-cover opacity-30"
          src="https://images.unsplash.com/photo-1563986768711-b3bde3dc821e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
          alt="Pengiriman Cepat"
        />
      </div>
      <div className="relative mx-auto max-w-7xl py-24 px-6 sm:py-32 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
          Lacak Kiriman
        </h1>
        <p className="mt-6 max-w-3xl text-xl text-blue-50">
          Cek status pengiriman barang Anda secara real-time dengan memasukkan nomor resi
        </p>
      </div>
    </div>
  ), []);

  // Komponen form tracking - dioptimalkan dengan useMemo
  const trackingForm = useMemo(() => (
    <form onSubmit={handleTrack} className="mt-6">
      <div className="flex rounded-md shadow-sm">
        <div className="relative flex flex-grow items-stretch focus-within:z-10">
          <input
            type="text"
            name="tracking-number"
            id="tracking-number"
            className="block w-full rounded-none rounded-l-md border-0 py-3.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-lg sm:leading-6"
            placeholder="Masukkan nomor resi"
            value={trackingNumber}
            onChange={handleTrackingNumberChange}
          />
        </div>
        <button
          type="submit"
          className="relative -ml-px inline-flex items-center gap-x-2 rounded-r-md px-6 py-3.5 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:z-10"
          disabled={loading}
        >
          {loading ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin text-white" />
          ) : (
            <TruckIcon className="h-5 w-5 text-white" />
          )}
          Lacak
        </button>
      </div>
    </form>
  ), [trackingNumber, handleTrackingNumberChange, handleTrack, loading]);

  // Komponen error message - dioptimalkan dengan useMemo
  const errorMessage = useMemo(() => {
    if (!error) return null;
    
    return (
      <div className="mt-8 rounded-md bg-red-50 p-4">
        <div className="flex">
          <div>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }, [error]);

  return (
    <div className="bg-white">
      {pageHeader}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {trackingForm}
          {errorMessage}
          {currentShipment && <ShipmentDetail shipment={currentShipment} />}
        </div>
      </div>
    </div>
  );
} 