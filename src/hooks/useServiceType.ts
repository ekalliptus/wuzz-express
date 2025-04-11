'use client';

import { useState, useCallback } from 'react';
import { ServiceType } from '@/types';
import { 
  getServiceTypes, 
  calculateRate as calculateRateAction,
  createServiceType as createServiceTypeAction,
  deleteServiceType as deleteServiceTypeAction
} from '@/app/actions';

interface RateResult {
  serviceType: ServiceType;
  price: number;
  estimatedTime: string;
}

interface UseServiceTypeReturn {
  serviceTypes: ServiceType[];
  rates: RateResult[];
  loading: boolean;
  error: string | null;
  fetchServiceTypes: () => Promise<ServiceType[]>;
  calculateRate: (
    originCity: string,
    destinationCity: string,
    weight: number,
    serviceTypeId?: string
  ) => Promise<RateResult[]>;
  createServiceType: (data: {
    code: string;
    name: string;
    description: string;
    estimationDays: number;
    basePrice: number;
  }) => Promise<{ success: boolean; id?: string; error?: string }>;
  deleteServiceType: (id: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Custom hook untuk mengelola jenis layanan dan perhitungan tarif
 */
export function useServiceType(): UseServiceTypeReturn {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [rates, setRates] = useState<RateResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Mengambil daftar jenis layanan dari API
   */
  const fetchServiceTypes = useCallback(async (): Promise<ServiceType[]> => {
    setLoading(true);
    setError(null);

    console.log('useServiceType: Mulai mengambil jenis layanan');
    try {
      // Coba gunakan server action dulu
      console.log('useServiceType: Memanggil getServiceTypes()');
      try {
        const types = await getServiceTypes();
        console.log('useServiceType: Hasil getServiceTypes():', types);
        
        if (types && types.length >= 0) {
          setServiceTypes(types);
          return types;
        }
      } catch (serverActionError) {
        console.error('useServiceType: Error dengan server action, coba API endpoint:', serverActionError);
      }
      
      // Jika server action gagal, gunakan API endpoint
      console.log('useServiceType: Menggunakan API endpoint sebagai fallback');
      const response = await fetch('/api/service-types');
      if (!response.ok) {
        throw new Error(`Error fetching from API: ${response.statusText}`);
      }
      
      const types = await response.json();
      console.log('useServiceType: Hasil dari API endpoint:', types);
      
      setServiceTypes(types);
      return types;
    } catch (err: any) {
      console.error('useServiceType: Error fetching service types:', err);
      setError(err.message || 'Gagal memuat jenis layanan');
      return [];
    } finally {
      console.log('useServiceType: Selesai mengambil jenis layanan');
      setLoading(false);
    }
  }, []);

  /**
   * Menghitung tarif pengiriman berdasarkan kota asal, tujuan, dan berat
   */
  const calculateRate = useCallback(
    async (
      originCity: string,
      destinationCity: string,
      weight: number,
      serviceTypeId?: string
    ): Promise<RateResult[]> => {
      setLoading(true);
      setError(null);

      try {
        const calculatedRates = await calculateRateAction(
          originCity,
          destinationCity,
          weight,
          serviceTypeId
        );
        
        setRates(calculatedRates);
        return calculatedRates;
      } catch (err: any) {
        setError(err.message || 'Gagal menghitung tarif pengiriman');
        console.error('Error calculating rates:', err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Membuat jenis layanan baru
   */
  const createServiceType = useCallback(async (data: {
    code: string;
    name: string;
    description: string;
    estimationDays: number;
    basePrice: number;
  }): Promise<{ success: boolean; id?: string; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const result = await createServiceTypeAction(data);
      
      if (result.success) {
        // Refresh daftar jenis layanan
        await fetchServiceTypes();
      }
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Gagal membuat jenis layanan');
      console.error('Error creating service type:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchServiceTypes]);

  /**
   * Menghapus jenis layanan
   */
  const deleteServiceType = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteServiceTypeAction(id);
      
      if (result.success) {
        // Refresh daftar jenis layanan
        await fetchServiceTypes();
      }
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus jenis layanan');
      console.error('Error deleting service type:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchServiceTypes]);

  return {
    serviceTypes,
    rates,
    loading,
    error,
    fetchServiceTypes,
    calculateRate,
    createServiceType,
    deleteServiceType
  };
} 