'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { trackShipment, updateShipmentStatus } from '@/app/actions';

export default function ShipmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    location: '',
    description: ''
  });

  // Status untuk dropdown
  const statusOptions = [
    { value: 'pending', label: 'Menunggu' },
    { value: 'picked_up', label: 'Diambil' },
    { value: 'in_transit', label: 'Dalam Pengiriman' },
    { value: 'out_for_delivery', label: 'Menuju Alamat' },
    { value: 'delivered', label: 'Terkirim' },
    { value: 'cancelled', label: 'Dibatalkan' }
  ];

  // Load data pengiriman
  useEffect(() => {
    async function loadShipmentData() {
      try {
        setLoading(true);
        // Gunakan nomor ID untuk melacak pengiriman
        const data = await trackShipment(params.id);
        
        if (data) {
          setShipment(data);
          // Set status form ke status saat ini
          setUpdateForm(prev => ({
            ...prev,
            status: data.status || 'pending',
            location: data.trackingHistory && data.trackingHistory.length > 0 
              ? data.trackingHistory[0].location || ''
              : ''
          }));
        } else {
          setError('Pengiriman tidak ditemukan');
        }
      } catch (err) {
        console.error('Error loading shipment:', err);
        setError('Gagal memuat data pengiriman');
      } finally {
        setLoading(false);
      }
    }
    
    if (params.id) {
      loadShipmentData();
    }
  }, [params.id]);

  // Handle perubahan form
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle submit form update status
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!updateForm.status || !updateForm.location || !updateForm.description) {
      toast.error('Semua field harus diisi');
      return;
    }
    
    try {
      setUpdating(true);
      
      const result = await updateShipmentStatus(
        Number(params.id),
        updateForm.status,
        updateForm.location,
        updateForm.description
      );
      
      if (result.success) {
        toast.success('Status pengiriman berhasil diperbarui');
        // Reload data pengiriman
        const updatedData = await trackShipment(params.id);
        setShipment(updatedData);
        // Reset form deskripsi
        setUpdateForm(prev => ({
          ...prev,
          description: ''
        }));
      } else {
        toast.error('Gagal memperbarui status pengiriman');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Terjadi kesalahan saat memperbarui status');
    } finally {
      setUpdating(false);
    }
  };

  // Helper function untuk mendapatkan kelas warna status
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

  // Helper function untuk mendapatkan label status
  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  // Format tanggal lokal Indonesia
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
            <p className="text-black mb-4">{error}</p>
            <button 
              onClick={() => router.back()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold text-black mb-4">Pengiriman Tidak Ditemukan</h2>
            <p className="text-black mb-4">Data pengiriman dengan ID {params.id} tidak tersedia.</p>
            <button 
              onClick={() => router.back()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Detail Pengiriman</h1>
              <p className="text-blue-100">Nomor Resi: {shipment.receiptNumber}</p>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(shipment.status)}`}>
                {getStatusLabel(shipment.status)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Informasi Pengiriman */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Informasi Pengirim</h2>
            <div>
              <p className="text-sm text-black">Nama</p>
              <p className="font-medium">{shipment.senderName}</p>
            </div>
            <div>
              <p className="text-sm text-black">Telepon</p>
              <p className="font-medium">{shipment.senderPhone}</p>
            </div>
            <div>
              <p className="text-sm text-black">Alamat</p>
              <p className="font-medium">{shipment.senderAddress}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Informasi Penerima</h2>
            <div>
              <p className="text-sm text-black">Nama</p>
              <p className="font-medium">{shipment.recipientName}</p>
            </div>
            <div>
              <p className="text-sm text-black">Telepon</p>
              <p className="font-medium">{shipment.recipientPhone}</p>
            </div>
            <div>
              <p className="text-sm text-black">Alamat</p>
              <p className="font-medium">{shipment.recipientAddress}</p>
            </div>
          </div>
        </div>
        
        {/* Detail Pengiriman */}
        <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-md p-3">
            <p className="text-sm text-black">Jenis Layanan</p>
            <p className="font-medium">{shipment.serviceType?.name}</p>
          </div>
          <div className="border rounded-md p-3">
            <p className="text-sm text-black">Rute</p>
            <p className="font-medium">{shipment.originCity} → {shipment.destinationCity}</p>
          </div>
          <div className="border rounded-md p-3">
            <p className="text-sm text-black">Berat / Biaya</p>
            <p className="font-medium">{shipment.weight} kg / Rp {Number(shipment.price).toLocaleString('id-ID')}</p>
          </div>
        </div>
        
        {/* History Tracking */}
        <div className="px-6 pb-6">
          <h2 className="text-lg font-semibold mb-4">History Pengiriman</h2>
          
          <div className="border rounded-md p-4">
            {shipment.trackingHistory && shipment.trackingHistory.length > 0 ? (
              <div className="space-y-6">
                {shipment.trackingHistory.map((history: any, index: number) => (
                  <div key={index} className="relative">
                    {/* Garis penghubung */}
                    {index < shipment.trackingHistory.length - 1 && (
                      <div className="absolute top-6 left-[9px] bottom-0 w-0.5 bg-gray-200"></div>
                    )}
                    
                    <div className="flex items-start">
                      {/* Dot indikator status */}
                      <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-1 z-10 
                        ${index === 0 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      
                      {/* Informasi tracking */}
                      <div className="ml-4">
                        <p className="text-sm text-black">
                          {formatDate(history.timestamp)}
                        </p>
                        <p className="font-medium mb-1">{history.description}</p>
                        <p className="text-sm">{history.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-black text-center py-4">Belum ada riwayat pengiriman</p>
            )}
          </div>
        </div>
        
        {/* Form Update Status */}
        <div className="bg-gray-50 p-6">
          <h2 className="text-lg font-semibold mb-4">Update Status Pengiriman</h2>
          
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-black mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={updateForm.status}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-black mb-1">
                  Lokasi
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={updateForm.location}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Jakarta Pusat"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-black mb-1">
                Deskripsi
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={updateForm.description}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contoh: Paket sedang dalam proses pengiriman"
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              >
                {updating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 