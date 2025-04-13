import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { injectAuthHeaderFromCookie, isAuthenticated, logRequestHeaders } from '@/lib/authHelpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('GET /api/admin/locations request received');
  
  // Perbaiki request dengan menambahkan auth header dari cookie jika perlu
  request = injectAuthHeaderFromCookie(request);
  
  // Log headers dan cookies
  logRequestHeaders(request);
  console.log('Route: Semua cookies yang diterima:', Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value])));
  
  // Cek token dari parameter URL
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('token');
  if (queryToken) {
    console.log('Token ditemukan di parameter URL:', queryToken.substring(0, 3) + '...');
    
    // Tambahkan token ke header jika dari query parameter
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Authorization', `Bearer ${queryToken}`);
    
    // Buat request baru dengan header yang diperbarui
    request = new NextRequest(request.url, {
      method: request.method,
      headers: newHeaders,
      body: request.body
    });
  } else {
    console.log('Token tidak ditemukan di parameter URL');
  }
  
  // CORS headers
  const origin = request.headers.get('origin') || '';
  const headers = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control'
  };
  
  // Untuk OPTIONS request (preflight)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }
  
  // Periksa autentikasi
  if (!isAuthenticated(request)) {
    console.log('Authentication failed');
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401, headers }
    );
  }

  console.log('Authentication successful');
  
  try {
    const type = request.nextUrl.searchParams.get('type');
    const sql = neon(process.env.DATABASE_URL!);
    
    // Cek apakah tabel locations ada
    const tablesResult = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'locations'
      ) as exists
    `;
    
    const locationsExist = tablesResult[0]?.exists;
    
    // Jika tabel belum ada, berikan data dummy untuk development
    if (!locationsExist) {
      const dummyLocations = [
        { id: 1, name: 'Jakarta Pusat', address: 'Jl. Merdeka No. 1, Jakarta Pusat', type: 'hub', capacity: 100, status: 'active' },
        { id: 2, name: 'Bandung', address: 'Jl. Asia Afrika No. 15, Bandung', type: 'branch', capacity: 50, status: 'active' },
        { id: 3, name: 'Surabaya', address: 'Jl. Panglima Sudirman No. 10, Surabaya', type: 'hub', capacity: 80, status: 'active' },
        { id: 4, name: 'Medan', address: 'Jl. Diponegoro No. 5, Medan', type: 'branch', capacity: 40, status: 'active' },
        { id: 5, name: 'Makassar', address: 'Jl. Urip Sumoharjo No. 7, Makassar', type: 'branch', capacity: 30, status: 'inactive' },
      ];

      const filteredLocations = type 
        ? dummyLocations.filter(loc => loc.type === type) 
        : dummyLocations;
        
      return NextResponse.json(
        { 
          locations: filteredLocations,
          total: filteredLocations.length,
          note: 'Using dummy data as locations table does not exist'
        }, 
        { status: 200, headers }
      );
    }
    
    // Query database jika tabel ada
    let query = sql`SELECT * FROM locations`;
    
    if (type) {
      query = sql`SELECT * FROM locations WHERE type = ${type}`;
    }
    
    const locations = await query;
    
    return NextResponse.json(
      { 
        locations, 
        total: locations.length 
      }, 
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error fetching locations:', error);
    
    // Jika terjadi error, berikan data dummy
    const dummyLocations = [
      { id: 1, name: 'Jakarta Pusat', address: 'Jl. Merdeka No. 1, Jakarta Pusat', type: 'hub', capacity: 100, status: 'active' },
      { id: 2, name: 'Bandung', address: 'Jl. Asia Afrika No. 15, Bandung', type: 'branch', capacity: 50, status: 'active' },
      { id: 3, name: 'Surabaya', address: 'Jl. Panglima Sudirman No. 10, Surabaya', type: 'hub', capacity: 80, status: 'active' },
    ];
    
    return NextResponse.json(
      { 
        locations: dummyLocations, 
        total: dummyLocations.length,
        error: 'Error fetching data, using fallback dummy data'
      }, 
      { status: 200, headers }
    );
  }
} 