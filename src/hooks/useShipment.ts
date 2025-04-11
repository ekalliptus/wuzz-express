'use client';

import { useState, useCallback, useMemo } from 'react';
import { Shipment } from '@/types';
import { trackShipment as trackShipmentAction } from '@/app/actions';

interface UseShipmentReturn {
  currentShipment: Shipment | null;
  loading: boolean;
  error: string | null;
  trackShipment: (trackingNumber: string) => Promise<void>;
}

/**
 * Custom hook yang dioptimalkan untuk mengelola pencarian dan pelacakan pengiriman
 * Menggunakan useCallback untuk meminimalisir pembuatan fungsi berulang
 * dan useMemo untuk membuat return value yang konsisten
 */
export function useShipment(): UseShipmentReturn {
  const [currentShipment, setCurrentShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Melacak pengiriman berdasarkan nomor resi
   * Dioptimalkan dengan useCallback agar tidak dibuat ulang saat komponen render
   */
  const trackShipment = useCallback(async (trackingNumber: string): Promise<void> => {
    if (!trackingNumber) {
      setError('Nomor resi tidak boleh kosong');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await trackShipmentAction(trackingNumber);
      
      if (!result) {
        setError('Nomor resi tidak ditemukan');
        setCurrentShipment(null);
      } else {
        setCurrentShipment(result as unknown as Shipment);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal melacak pengiriman');
      setCurrentShipment(null);
      console.error('Error tracking shipment:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Menggunakan useMemo untuk return value agar object reference stabil
   * dan tidak menyebabkan re-render yang tidak perlu
   */
  return useMemo(() => ({
    currentShipment,
    loading,
    error,
    trackShipment,
  }), [currentShipment, loading, error, trackShipment]);
} 