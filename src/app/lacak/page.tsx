'use client';

import { useState } from 'react';
import { MapPinIcon, TruckIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

// Dummy data untuk simulasi tracking
const dummyTrackingData = {
  receiptNumber: 'WUZZ12345678',
  status: 'in_transit',
  sender: {
    name: 'PT Maju Jaya',
    address: 'Jl. Industri No. 123, Jakarta Pusat',
    phone: '021-5551234',
  },
  recipient: {
    name: 'Toko ABC',
    address: 'Jl. Pasar Raya No. 45, Surabaya',
    phone: '031-7778899',
  },
  service: 'Ekspedisi Antar Kota',
  weight: 10.5,
  price: 105000,
  estimatedDelivery: '13 April 2024',
  events: [
    {
      status: 'Paket telah diterima',
      location: 'Jakarta Pusat',
      timestamp: '2024-04-10T10:30:00Z',
      description: 'Paket telah diterima di pusat sortir',
    },
    {
      status: 'Paket sedang dalam perjalanan',
      location: 'Jakarta Pusat',
      timestamp: '2024-04-10T14:45:00Z',
      description: 'Paket telah dikirim dari pusat sortir',
    },
    {
      status: 'Paket sedang transit',
      location: 'Semarang',
      timestamp: '2024-04-11T08:15:00Z',
      description: 'Paket telah tiba di pusat transit',
    },
    {
      status: 'Paket sedang dalam perjalanan',
      location: 'Semarang',
      timestamp: '2024-04-11T13:20:00Z',
      description: 'Paket telah dikirim ke kota tujuan',
    },
  ],
};

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<typeof dummyTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber) {
      setError('Silakan masukkan nomor resi Anda');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Simulasi loading
    setTimeout(() => {
      // Cek apakah tracking number cocok dengan dummy data
      if (trackingNumber.toUpperCase() === dummyTrackingData.receiptNumber) {
        setTrackingResult(dummyTrackingData);
        setError('');
      } else {
        setTrackingResult(null);
        setError('Nomor resi tidak ditemukan. Silakan periksa kembali nomor resi Anda.');
      }
      setIsLoading(false);
    }, 1500);
  };

  // Format tanggal untuk tampilan
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Lacak Kiriman</h1>
          <p className="mt-4 text-lg text-gray-600">
            Masukkan nomor resi untuk melacak status pengiriman Anda
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-8">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <label htmlFor="tracking-number" className="sr-only">
                    Nomor Resi
                  </label>
                  <input
                    type="text"
                    id="tracking-number"
                    name="tracking-number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Masukkan nomor resi Anda, contoh: WUZZ12345678"
                    className="block w-full rounded-md border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                      Mencari...
                    </>
                  ) : (
                    'Lacak'
                  )}
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </form>
          </div>

          {trackingResult && (
            <div className="border-t border-gray-200">
              <div className="px-6 py-5 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500">Nomor Resi</span>
                    <h3 className="text-lg font-bold text-gray-900">{trackingResult.receiptNumber}</h3>
                  </div>
                  <div>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      {trackingResult.status === 'in_transit' ? 'Dalam Pengiriman' : 'Terkirim'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Pengirim</h4>
                    <div className="mt-2">
                      <p className="text-base font-semibold text-gray-900">{trackingResult.sender.name}</p>
                      <p className="text-sm text-gray-600">{trackingResult.sender.address}</p>
                      <p className="text-sm text-gray-600">{trackingResult.sender.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Penerima</h4>
                    <div className="mt-2">
                      <p className="text-base font-semibold text-gray-900">{trackingResult.recipient.name}</p>
                      <p className="text-sm text-gray-600">{trackingResult.recipient.address}</p>
                      <p className="text-sm text-gray-600">{trackingResult.recipient.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Layanan</h4>
                    <p className="text-sm font-medium text-gray-900">{trackingResult.service}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Berat</h4>
                    <p className="text-sm font-medium text-gray-900">{trackingResult.weight} kg</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Perkiraan Tiba</h4>
                    <p className="text-sm font-medium text-gray-900">{trackingResult.estimatedDelivery}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-8">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Riwayat Pengiriman</h3>
                <ol className="relative border-l border-gray-200">
                  {trackingResult.events.map((event, index) => (
                    <li key={index} className="mb-6 ml-6">
                      <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                        <TruckIcon className="w-4 h-4 text-blue-600" />
                      </span>
                      <h3 className="font-semibold text-gray-900">{event.status}</h3>
                      <div className="flex items-center mt-1 mb-1 text-sm font-normal leading-none text-gray-500">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatDate(event.timestamp)}
                      </div>
                      <div className="flex items-center mb-2 text-sm font-normal leading-none text-gray-500">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {event.location}
                      </div>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Bantuan Pelacakan</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex gap-2">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span>Masukkan nomor resi yang terdiri dari kode alfanumerik seperti WUZZ12345678</span>
              </li>
              <li className="flex gap-2">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span>Pastikan nomor resi dimasukkan dengan benar tanpa spasi</span>
              </li>
              <li className="flex gap-2">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span>Jika Anda mengalami masalah, silakan hubungi customer service kami di 021-5551234</span>
              </li>
              <li className="flex gap-2">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span>Atau kirim email ke cs@wuzz.co.id dengan menyertakan nomor resi</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 