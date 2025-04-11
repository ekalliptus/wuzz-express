'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { User } from '@/types';
import { authenticateUser } from '@/app/actions';

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
    const storedUser = localStorage.getItem('wuzz_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Validasi bahwa parsedUser memiliki properti yang diperlukan
        if (parsedUser && parsedUser.id && parsedUser.role) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          console.error('Stored user data invalid:', parsedUser);
          localStorage.removeItem('wuzz_user'); // Hapus data tidak valid
        }
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        localStorage.removeItem('wuzz_user'); // Hapus data corrupt
      }
    }
    setLoading(false);
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
          console.log('User authenticated with role:', parsedUser.role);
          return true;
        } else {
          console.error('Invalid user data in localStorage:', parsedUser);
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('wuzz_user');
          return false;
        }
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('wuzz_user');
        return false;
      }
    }
    setIsAuthenticated(false);
    return false;
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
        localStorage.setItem('wuzz_user', JSON.stringify(result.user));
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
   * Logout user dan hapus data sesi
   */
  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('wuzz_user');
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