import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Memperbaiki request dengan menambahkan Auth header dari cookie jika diperlukan
 * @param request NextRequest original
 * @returns NextRequest yang sudah diperbaiki
 */
export function injectAuthHeaderFromCookie(request: NextRequest): NextRequest {
  // Periksa apakah sudah ada header Authorization yang valid
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader === 'Bearer ') {
    // Jika tidak ada atau kosong, coba ambil dari cookie
    const authCookie = request.cookies.get('auth_token');
    if (authCookie && authCookie.value) {
      // Buat header baru dengan value dari cookie
      console.log('Menambahkan auth header dari cookie:', 
        typeof authCookie.value === 'string' && authCookie.value.length > 5 
          ? authCookie.value.substring(0, 5) + '...' 
          : 'ditemukan');
      
      // Clone headers dan tambahkan/perbaiki Authorization
      const newHeaders = new Headers(request.headers);
      newHeaders.set('Authorization', `Bearer ${authCookie.value}`);
      
      // Buat request baru dengan header yang diperbarui
      return new NextRequest(request.url, {
        method: request.method,
        headers: newHeaders,
        body: request.body
      });
    }
  }
  
  // Jika tidak perlu perubahan, kembalikan request yang sama
  return request;
}

/**
 * Helper function untuk memeriksa autentikasi request
 * @param request NextRequest object
 * @returns boolean yang menunjukkan apakah request terotentikasi
 */
export function isAuthenticated(request: NextRequest) {
  // 1. Coba dapatkan token dari header Authorization
  const authHeader = request.headers.get('Authorization');
  let token = '';
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    if (typeof token === 'string' && token.length > 5) {
      console.log('Token dari Authorization header:', token.substring(0, 5) + '...');
    } else {
      console.log('Token dari Authorization header: ditemukan');
    }
  } else {
    console.log('Authorization header tidak valid atau kosong');
  }
  
  // 2. Jika token masih kosong atau tidak valid, coba dapatkan dari cookie
  if (!token) {
    try {
      const cookieStore = cookies();
      const authCookie = cookieStore.get('auth_token');
      
      if (authCookie && authCookie.value) {
        token = authCookie.value;
        if (typeof token === 'string' && token.length > 5) {
          console.log('Token dari cookie:', token.substring(0, 5) + '...');
        } else {
          console.log('Token dari cookie: ditemukan');
        }
      }
    } catch (error) {
      console.error('Error saat mengakses cookies:', error);
    }
  }
  
  // 3. Jika token masih kosong, tampilkan log dan return false
  if (!token) {
    console.log('Token tidak ditemukan di header maupun cookie');
    return false;
  }
  
  // 4. Validasi token (untuk implementasi sederhana, kita anggap token valid jika tidak kosong)
  try {
    if (typeof token === 'string' && token.length > 5) {
      console.log('Token valid:', token.substring(0, 5) + '...');
    } else {
      console.log('Token valid: ditemukan');
    }
    return true;
  } catch (error) {
    console.error('Error verifikasi token:', error);
    return false;
  }
}

/**
 * Helper function untuk logging request headers
 * @param request NextRequest object
 */
export function logRequestHeaders(request: NextRequest) {
  const headers: { [key: string]: string } = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  console.log('Request headers:', headers);
} 