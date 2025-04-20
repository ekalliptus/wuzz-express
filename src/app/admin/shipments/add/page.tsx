'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { getCustomers, getLocations, getServiceTypes } from '@/app/actions';

// Sample data for drivers
const drivers = [
  { id: '1', name: 'Budi Santoso' },
  { id: '2', name: 'Ahmad Setiawan' },
  { id: '3', name: 'Dimas Prayoga' },
];

const shipmentStatuses = [
  { id: 'pending', name: 'Tertunda' },
  { id: 'confirmed', name: 'Terkonfirmasi' },
  { id: 'pickup', name: 'Pengambilan' },
  { id: 'transit', name: 'Dalam Perjalanan' },
  { id: 'delivered', name: 'Terkirim' },
  { id: 'completed', name: 'Selesai' },
  { id: 'cancelled', name: 'Dibatalkan' },
];

export default function AddShipment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  
  const [formData, setFormData] = useState({
    trackingNumber: '',
    customerId: '',
    driverId: '',
    pickupLocationId: '',
    deliveryLocationId: '',
    serviceTypeId: '',
    status: 'pending',
    pickupDate: '',
    pickupTime: '',
    deliveryDate: '',
    deliveryTime: '',
    weight: '',
    dimensions: '',
    items: '',
    notes: '',
    price: '',
  });
  
  const [errors, setErrors] = useState({
    trackingNumber: false,
    customerId: false,
    pickupLocationId: false,
    deliveryLocationId: false,
    serviceTypeId: false,
    pickupDate: false,
    weight: false,
    price: false,
  });

  // Load data from database
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        // Fetch customers
        const customersResult = await getCustomers();
        if (customersResult && Array.isArray(customersResult.data)) {
          setCustomers(customersResult.data);
        }
        
        // Fetch locations
        const locationsResult = await getLocations();
        if (locationsResult && Array.isArray(locationsResult)) {
          setLocations(locationsResult);
        }
        
        // Fetch service types
        const serviceTypesResult = await getServiceTypes();
        if (serviceTypesResult && Array.isArray(serviceTypesResult)) {
          setServiceTypes(serviceTypesResult);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Generate random tracking number
  const generateTrackingNumber = () => {
    const prefix = 'WUZZ';
    const randomNum = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    const timestamp = new Date().getTime().toString().slice(-4);
    return `${prefix}-${randomNum}-${timestamp}`;
  };

  // Set tracking number on initial load
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      trackingNumber: generateTrackingNumber()
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      trackingNumber: !formData.trackingNumber,
      customerId: !formData.customerId,
      pickupLocationId: !formData.pickupLocationId,
      deliveryLocationId: !formData.deliveryLocationId,
      serviceTypeId: !formData.serviceTypeId,
      pickupDate: !formData.pickupDate,
      weight: !formData.weight,
      price: !formData.price,
    };
    
    // Check if pickup and delivery locations are the same
    if (formData.pickupLocationId && formData.deliveryLocationId && 
        formData.pickupLocationId === formData.deliveryLocationId) {
      newErrors.deliveryLocationId = true;
      alert('Lokasi pengambilan dan pengiriman tidak boleh sama');
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Here you would normally send data to your API
      console.log('Submitting shipment data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to shipments list on success
      router.push('/admin/shipments');
    } catch (error) {
      console.error('Error adding shipment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link href="/admin/shipments" className="text-gray-600 hover:text-gray-900">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-800 ml-4">Tambah Pengiriman Baru</h1>
        </div>
        
        {dataLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tracking Number */}
            <div>
              <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700">
                Nomor Tracking <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  id="trackingNumber"
                  name="trackingNumber"
                  value={formData.trackingNumber}
                  onChange={handleChange}
                  className={`block w-full p-2 border ${errors.trackingNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="WUZZ-0000000-0000"
                  readOnly
                />
                {errors.trackingNumber && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.trackingNumber && <p className="mt-1 text-sm text-red-500">Nomor tracking tidak boleh kosong</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer */}
              <div>
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                  Pelanggan <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <select
                    id="customerId"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleChange}
                    className={`block w-full p-2 border ${errors.customerId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Pilih pelanggan</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                  {errors.customerId && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.customerId && <p className="mt-1 text-sm text-red-500">Pelanggan harus dipilih</p>}
              </div>
              
              {/* Driver */}
              <div>
                <label htmlFor="driverId" className="block text-sm font-medium text-gray-700">
                  Supir
                </label>
                <div className="mt-1">
                  <select
                    id="driverId"
                    name="driverId"
                    value={formData.driverId}
                    onChange={handleChange}
                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pilih supir</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>{driver.name}</option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">Opsional: dapat ditambahkan nanti</p>
              </div>
              
              {/* Pickup Location */}
              <div>
                <label htmlFor="pickupLocationId" className="block text-sm font-medium text-gray-700">
                  Lokasi Pengambilan <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <select
                    id="pickupLocationId"
                    name="pickupLocationId"
                    value={formData.pickupLocationId}
                    onChange={handleChange}
                    className={`block w-full p-2 border ${errors.pickupLocationId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Pilih lokasi pengambilan</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                  {errors.pickupLocationId && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.pickupLocationId && <p className="mt-1 text-sm text-red-500">Lokasi pengambilan harus dipilih</p>}
              </div>
              
              {/* Delivery Location */}
              <div>
                <label htmlFor="deliveryLocationId" className="block text-sm font-medium text-gray-700">
                  Lokasi Pengiriman <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <select
                    id="deliveryLocationId"
                    name="deliveryLocationId"
                    value={formData.deliveryLocationId}
                    onChange={handleChange}
                    className={`block w-full p-2 border ${errors.deliveryLocationId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Pilih lokasi pengiriman</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                  {errors.deliveryLocationId && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.deliveryLocationId && <p className="mt-1 text-sm text-red-500">Lokasi pengiriman harus dipilih</p>}
              </div>
              
              {/* Service Type */}
              <div>
                <label htmlFor="serviceTypeId" className="block text-sm font-medium text-gray-700">
                  Jenis Layanan <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <select
                    id="serviceTypeId"
                    name="serviceTypeId"
                    value={formData.serviceTypeId}
                    onChange={handleChange}
                    className={`block w-full p-2 border ${errors.serviceTypeId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Pilih jenis layanan</option>
                    {serviceTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  {errors.serviceTypeId && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.serviceTypeId && <p className="mt-1 text-sm text-red-500">Jenis layanan harus dipilih</p>}
              </div>
              
              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {shipmentStatuses.map(status => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Pickup Date and Time */}
              <div>
                <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700">
                  Tanggal Pengambilan <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type="date"
                    id="pickupDate"
                    name="pickupDate"
                    value={formData.pickupDate}
                    onChange={handleChange}
                    className={`block w-full p-2 border ${errors.pickupDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.pickupDate && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.pickupDate && <p className="mt-1 text-sm text-red-500">Tanggal pengambilan harus diisi</p>}
              </div>
              
              <div>
                <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700">
                  Waktu Pengambilan
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    id="pickupTime"
                    name="pickupTime"
                    value={formData.pickupTime}
                    onChange={handleChange}
                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Delivery Date and Time */}
              <div>
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700">
                  Tanggal Pengiriman
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="deliveryDate"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700">
                  Waktu Pengiriman
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    id="deliveryTime"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleChange}
                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Shipment Details */}
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                  Berat (kg) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className={`block w-full p-2 border ${errors.weight ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  {errors.weight && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.weight && <p className="mt-1 text-sm text-red-500">Berat harus diisi</p>}
              </div>
              
              <div>
                <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">
                  Dimensi (cm)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="dimensions"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleChange}
                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="P x L x T (40x30x20)"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Harga (Rp) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`block w-full p-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.price && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-500">Harga harus diisi</p>}
              </div>
            </div>
            
            {/* Items */}
            <div>
              <label htmlFor="items" className="block text-sm font-medium text-gray-700">
                Daftar Barang
              </label>
              <div className="mt-1">
                <textarea
                  id="items"
                  name="items"
                  rows={3}
                  value={formData.items}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Deskripsi barang yang dikirim"
                />
              </div>
            </div>
            
            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Catatan
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Catatan tambahan untuk pengiriman"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-5">
              <Link 
                href="/admin/shipments" 
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 