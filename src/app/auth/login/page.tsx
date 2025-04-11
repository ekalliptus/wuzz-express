'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuthContext } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading: authLoading, error: authError } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Menggunakan useCallback untuk fungsi handle submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Redirect berdasarkan peran user
        if (result.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (result.role === 'staff') {
          router.push('/staff/dashboard');
        }
      } else {
        setError('Login gagal. Silakan cek email dan password Anda.');
      }
    } catch (err: any) {
      setError(err.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [email, password, login, router]);

  // Menggunakan useCallback untuk toggle password
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prevState => !prevState);
  }, []);

  // Menggunakan useCallback untuk handle input changes
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  // Menggunakan useMemo untuk UI elements yang statis
  const passwordIcon = useMemo(() => 
    showPassword ? (
      <EyeSlashIcon className="h-5 w-5" />
    ) : (
      <EyeIcon className="h-5 w-5" />
    ), [showPassword]
  );

  const loadingIndicator = useMemo(() => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ), []);

  // Menggunakan authError jika ada
  const displayError = authError || error;
  const isLoading = loading || authLoading;

  return (
    <div className="w-full mx-auto max-w-md">
      <h1 className="text-3xl font-black mb-6 text-center text-gray-900">Masuk ke Akun</h1>
      <p className="text-gray-600 text-center mb-8">Khusus untuk Staf dan Admin Wuzz Express</p>
      
      <form onSubmit={handleSubmit} className="w-full space-y-5">
        {displayError && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
            {displayError}
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-base font-extrabold text-gray-900 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={handleEmailChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
            placeholder="Masukkan email Anda"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-base font-extrabold text-gray-900 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
              placeholder="Masukkan password Anda"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {passwordIcon}
            </button>
          </div>
        </div>
        
        <div className="text-right">
          <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
            Lupa password?
          </a>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex justify-center items-center disabled:opacity-70"
        >
          {isLoading ? loadingIndicator : 'Masuk'}
        </button>
      </form>
    </div>
  );
} 