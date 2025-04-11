import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Shipment, TrackingEvent, ServiceType, User } from '@/types';
import { authenticateUser, getUserByToken } from '@/app/actions';

/**
 * Kelas dasar untuk layanan API
 */
abstract class BaseApiService {
  protected api: AxiosInstance;
  protected baseURL: string = '/api';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => this.handleApiError(error)
    );
  }

  protected handleApiError(error: any): Promise<never> {
    // Implementasi penanganan error yang konsisten
    const errorResponse = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'Terjadi kesalahan pada server',
      data: error.response?.data || null,
    };

    console.error('API Error:', errorResponse);
    return Promise.reject(errorResponse);
  }

  protected get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.get<T>(url, config).then((response) => response.data);
  }

  protected post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.api.post<T>(url, data, config).then((response) => response.data);
  }

  protected put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.api.put<T>(url, data, config).then((response) => response.data);
  }

  protected delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.delete<T>(url, config).then((response) => response.data);
  }
}

/**
 * Layanan untuk pengelolaan pengiriman
 */
export class ShipmentService extends BaseApiService {
  /**
   * Mencari pengiriman berdasarkan nomor resi
   */
  public async trackShipment(trackingNumber: string): Promise<Shipment> {
    return this.get<Shipment>(`/shipments/track/${trackingNumber}`);
  }

  /**
   * Mendapatkan daftar pengiriman
   */
  public async getShipments(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ data: Shipment[]; total: number; page: number; limit: number }> {
    return this.get<{ data: Shipment[]; total: number; page: number; limit: number }>(
      '/shipments',
      { params }
    );
  }

  /**
   * Membuat pengiriman baru
   */
  public async createShipment(data: Partial<Shipment>): Promise<Shipment> {
    return this.post<Shipment>('/shipments', data);
  }

  /**
   * Memperbarui status pengiriman
   */
  public async updateShipmentStatus(
    id: string,
    status: string,
    location: string,
    description: string
  ): Promise<Shipment> {
    return this.put<Shipment>(`/shipments/${id}/status`, {
      status,
      location,
      description,
    });
  }
}

/**
 * Layanan untuk jenis-jenis layanan
 */
export class ServiceTypeApi extends BaseApiService {
  /**
   * Mendapatkan daftar jenis layanan
   */
  public async getServiceTypes(): Promise<ServiceType[]> {
    return this.get<ServiceType[]>('/service-types');
  }

  /**
   * Menghitung tarif pengiriman
   */
  public async calculateRate(
    originCity: string,
    destinationCity: string,
    weight: number,
    serviceTypeId?: string
  ): Promise<{ serviceType: ServiceType; price: number; estimatedTime: string }[]> {
    return this.post<{ serviceType: ServiceType; price: number; estimatedTime: string }[]>(
      '/calculate-rate',
      {
        originCity,
        destinationCity,
        weight,
        serviceTypeId,
      }
    );
  }
}

/**
 * Layanan untuk autentikasi
 */
export class AuthService extends BaseApiService {
  /**
   * Login pengguna
   */
  public async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const result = await authenticateUser(email, password);
      
      if (!result.success || !result.user) {
        throw new Error(result.message || 'Email atau password salah');
      }
      
      // Buat token sederhana untuk sesi
      const token = btoa(`${result.user.id}:${result.user.role}:${Date.now()}`);
      
      return {
        user: result.user as User,
        token
      };
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Logout pengguna
   */
  public async logout(): Promise<void> {
    try {
      // Hanya menghapus token dari localStorage
      localStorage.removeItem('token');
      return Promise.resolve();
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Mendapatkan profil pengguna saat ini
   */
  public async getCurrentUser(): Promise<User> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }
      
      // Gunakan server action untuk memverifikasi token
      const result = await getUserByToken(token);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.user as User;
    } catch (error) {
      return this.handleApiError(error);
    }
  }
}

// Export instance layanan untuk digunakan di seluruh aplikasi
export const shipmentService = new ShipmentService();
export const serviceTypeApi = new ServiceTypeApi();
export const authService = new AuthService(); 