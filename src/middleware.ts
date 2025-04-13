import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths yang memerlukan otentikasi
const PROTECTED_PATHS = [
  '/admin',
  '/staff',
  '/api/admin',
  '/api/staff'
];

// Jalur-jalur yang dikecualikan dari autentikasi
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/public',
  '/_next',
  '/favicon.ico',
  '/api/auth'
];

// Memeriksa apakah path termasuk dalam jalur terlindungi
function isProtectedPath(path: string): boolean {
  return PROTECTED_PATHS.some(prefix => path.startsWith(prefix));
}

// Memeriksa apakah path termasuk dalam jalur publik
function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some(prefix => path.startsWith(prefix));
}

// Fungsi middleware yang akan dieksekusi pada setiap request
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const origin = request.headers.get('origin') || '';
  
  // Siapkan CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Token, X-CSRF-Token, Cache-Control'
  };
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  // Jika path adalah jalur publik, biarkan dilanjutkan
  if (isPublicPath(path)) {
    // Tambahkan CORS headers untuk publik request
    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
  
  // Jika path adalah jalur terlindungi, periksa otorisasi
  if (isProtectedPath(path)) {
    // Cek token dari query parameter URL (penting untuk API requests)
    const url = new URL(request.url);
    const queryToken = url.searchParams.get('token') || '';
    
    // Memeriksa token dari cookie
    const authCookie = request.cookies.get('auth_token');
    const cookieToken = authCookie?.value || '';
    
    // Mengambil token dari header Authorization
    const authHeader = request.headers.get('Authorization');
    let headerToken = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      headerToken = authHeader.split(' ')[1];
    }
    
    // Cek X-Auth-Token sebagai fallback
    const xAuthToken = request.headers.get('X-Auth-Token') || '';
    
    // Untuk debugging
    console.log(`Middleware: Path ${path} memerlukan otentikasi`);

    // Log untuk params token dengan prioritas tertinggi
    if (queryToken) {
      const queryTokenPreview = typeof queryToken === 'string' && queryToken.length > 5
        ? `${queryToken.substring(0, 5)}...`
        : 'ditemukan';
      console.log(`Middleware: Query token ${queryTokenPreview}`);
    } else {
      console.log('Middleware: Query token tidak ditemukan');
    }
    
    // Log untuk cookie token
    if (authCookie) {
      const tokenPreview = typeof cookieToken === 'string' && cookieToken.length > 5 
        ? `${cookieToken.substring(0, 5)}...` 
        : 'ditemukan';
      console.log(`Middleware: Auth cookie ${tokenPreview}`);
    } else {
      console.log('Middleware: Auth cookie tidak ditemukan');
    }

    // Log untuk header token
    if (authHeader) {
      const headerPreview = typeof headerToken === 'string' && headerToken.length > 5
        ? `${headerToken.substring(0, 5)}...`
        : headerToken ? 'ditemukan' : 'kosong';
      console.log(`Middleware: Auth header ${headerPreview}`);
    } else {
      console.log('Middleware: Auth header tidak ditemukan');
    }
    
    // Log untuk X-Auth-Token
    if (xAuthToken) {
      const xTokenPreview = typeof xAuthToken === 'string' && xAuthToken.length > 5
        ? `${xAuthToken.substring(0, 5)}...`
        : 'ditemukan';
      console.log(`Middleware: X-Auth-Token ${xTokenPreview}`);
    }
    
    // Gunakan token dari berbagai sumber, dengan prioritas yang benar
    const token = queryToken || headerToken || xAuthToken || cookieToken;
    
    // Jika tidak ada token, kembalikan ke halaman login
    if (!token) {
      // Untuk API route, kembalikan respons JSON
      if (path.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized - Token tidak ditemukan' },
          { status: 401, headers: corsHeaders }
        );
      }
      
      // Untuk jalur UI, redirect ke halaman login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      
      const response = NextResponse.redirect(loginUrl);
      
      // Tambahkan CORS headers ke response
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    }
    
    // Untuk semua request terproteksi (API dan non-API)
    // Selalu buat header baru dengan token yang valid
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('Authorization', `Bearer ${token}`);
    requestHeaders.set('X-Auth-Token', token);
    
    // Buat response dengan header yang diperbarui
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
    // Tambahkan atau perbarui cookie token di response jika belum ada atau berbeda
    if (!cookieToken || cookieToken !== token) {
      response.cookies.set('auth_token', token, {
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 hari
        sameSite: 'lax',  // Ubah ke 'lax' untuk meningkatkan kompatibilitas
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false  // Izinkan akses dari JavaScript
      });
      console.log('Middleware: Cookie token diperbarui/ditambahkan');
    }
    
    // Pastikan cache control diatur dengan benar untuk API request
    if (path.startsWith('/api/')) {
      response.headers.set('Cache-Control', 'no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    }
    
    // Tambahkan CORS headers ke response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
  
  // Untuk semua jalur lain, lanjutkan tanpa modifikasi
  const response = NextResponse.next();
  
  // Tambahkan CORS headers ke response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// Konfigurasi middleware hanya untuk jalur tertentu
export const config = {
  matcher: [
    /*
     * Match semua request paths kecuali yang dimulai dengan:
     * - _next/static (file statis)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 