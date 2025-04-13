'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { User } from '@/types';
import { authenticateUser } from '@/app/actions';
import Cookies from 'js-cookie';

// Tipe data untuk context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  checkAuthStatus: () => Promise<boolean>;
}

// Membuat context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Inisialisasi state dari local storage saat client mount
  useEffect(() => {
    // Pastikan window.tokenId tersedia secara global
    if (typeof window !== 'undefined') {
      (window as any).tokenId = '';
    }

    const storedUser = localStorage.getItem('wuzz_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Validasi bahwa parsedUser memiliki properti yang diperlukan
        if (parsedUser && parsedUser.id && parsedUser.role) {
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          // Set token di window object
          const userId = String(parsedUser.id);
          if (typeof window !== 'undefined') {
            (window as any).tokenId = userId;
            console.log('Token tersedia di window.tokenId:', userId);
          }
          
          // Set cookie
          Cookies.set('auth_token', userId, { 
            expires: 7, 
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
          });
          
          console.log('User diinisialisasi dari localStorage:', parsedUser.role);
        } else {
          console.error('Stored user data invalid:', parsedUser);
          localStorage.removeItem('wuzz_user');
          if (typeof window !== 'undefined') {
            (window as any).tokenId = '';
          }
          Cookies.remove('auth_token');
        }
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        localStorage.removeItem('wuzz_user');
        if (typeof window !== 'undefined') {
          (window as any).tokenId = '';
        }
        Cookies.remove('auth_token');
      }
    } else {
      // Cek apakah ada token di cookies
      const cookieToken = Cookies.get('auth_token');
      if (cookieToken) {
        if (typeof window !== 'undefined') {
          (window as any).tokenId = cookieToken;
          console.log('Token tersedia di window.tokenId dari cookie:', cookieToken);
        }
      }
    }
    setLoading(false);
  }, []);

  /**
   * Autentikasi user dengan email dan password
   */
  const login = useCallback(async (
    email: string, 
    password: string
  ): Promise<{ success: boolean; role?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const result = await authenticateUser(email, password);
      
      if (result.success && result.user) {
        // Validasi bahwa user memiliki role sebelum disimpan
        if (!result.user.role) {
          console.error('User data missing role:', result.user);
          setError('Data pengguna tidak valid');
          return { success: false };
        }
        
        setUser(result.user as User);
        setIsAuthenticated(true);
        
        // Simpan user di localStorage
        localStorage.setItem('wuzz_user', JSON.stringify(result.user));
        
        // Set token ID di window object - PENTING
        const userId = String(result.user.id);
        if (typeof window !== 'undefined') {
          (window as any).tokenId = userId;
          console.log('Token tersedia di window.tokenId:', userId);
        }
        
        // Set cookie
        Cookies.set('auth_token', userId, { 
          expires: 7, 
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        });
        
        console.log('Login berhasil dengan role:', result.role);
        
        return { success: true, role: result.role };
      } else {
        setError(result.message || 'Gagal login');
        return { success: false };
      }
    } catch (err: any) {
      setError(err.message || 'Gagal login');
      console.error('Error during login:', err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Memeriksa status autentikasi pengguna
   */
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    const storedUser = localStorage.getItem('wuzz_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Validasi user memiliki properti yang dibutuhkan
        if (parsedUser && parsedUser.id && parsedUser.role) {
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          // Set token di window object
          const userId = String(parsedUser.id);
          if (typeof window !== 'undefined') {
            (window as any).tokenId = userId;
          }
          
          return true;
        } else {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('wuzz_user');
          if (typeof window !== 'undefined') {
            (window as any).tokenId = '';
          }
          Cookies.remove('auth_token');
          return false;
        }
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('wuzz_user');
        if (typeof window !== 'undefined') {
          (window as any).tokenId = '';
        }
        Cookies.remove('auth_token');
        return false;
      }
    }
    
    // Cek token cookie sebagai fallback
    const cookieToken = Cookies.get('auth_token');
    if (cookieToken) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        (window as any).tokenId = cookieToken;
      }
      return true;
    }
    
    setIsAuthenticated(false);
    return false;
  }, []);

  /**
   * Logout user dan hapus data sesi
   */
  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Hapus data dari localStorage
    localStorage.removeItem('wuzz_user');
    
    // Reset token ID di window
    if (typeof window !== 'undefined') {
      (window as any).tokenId = '';
    }
    
    // Hapus cookie
    Cookies.remove('auth_token', {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    console.log('Logout berhasil, token dan data dihapus');
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    checkAuthStatus,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook untuk menggunakan auth context
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 