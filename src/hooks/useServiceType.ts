'use client';

import { useState, useCallback } from 'react';
import { ServiceType } from '@/types';
import { getServiceTypes, calculateRate as calculateRateAction } from '@/app/actions';

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

    try {
      const types = await getServiceTypes();
      setServiceTypes(types);
      return types;
    } catch (err: any) {
      setError(err.message || 'Gagal memuat jenis layanan');
      console.error('Error fetching service types:', err);
      return [];
    } finally {
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

  return {
    serviceTypes,
    rates,
    loading,
    error,
    fetchServiceTypes,
    calculateRate,
  };
} 