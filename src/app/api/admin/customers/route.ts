import { NextResponse, NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { isAuthenticated, logRequestHeaders, injectAuthHeaderFromCookie } from '@/lib/authHelpers';

export const dynamic = 'force-dynamic';

// Tambahkan CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

export async function OPTIONS() {
  return addCorsHeaders(NextResponse.json({}, { status: 200 }));
}

export async function GET(request: NextRequest) {
  console.log('GET /api/admin/customers request received');
  
  // Perbaiki request dengan menambahkan auth header dari cookie jika perlu
  request = injectAuthHeaderFromCookie(request);
  
  // Log semua headers untuk debugging
  logRequestHeaders(request);
  
  // Log semua cookies untuk debugging
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
  
  // Periksa autentikasi
  if (!isAuthenticated(request)) {
    console.log('Authentication failed');
    return addCorsHeaders(NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    ));
  }

  console.log('Authentication successful');

  try {
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const status = request.nextUrl.searchParams.get('status');
    
    const sql = neon(process.env.DATABASE_URL!);
    const offset = (page - 1) * limit;
    
    // Cek apakah tabel customers ada
    try {
      const tablesResult = await sql.unsafe(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'customers'
        ) as exists
      `);
      
      const customersTableExists = (tablesResult as unknown as any[])?.[0]?.exists;
      
      if (!customersTableExists) {
        // Dummy data untuk demo jika tabel tidak ada
        const dummyCustomers = Array(10).fill(0).map((_, i) => ({
          id: i + 1,
          name: `Pelanggan ${i + 1}`,
          email: `pelanggan${i+1}@example.com`,
          phone: `08123456${String(i+1).padStart(4, '0')}`,
          address: `Alamat Pelanggan ${i+1}, Jakarta`,
          status: ['active', 'inactive'][i % 2],
          created_at: new Date().toISOString()
        }));
        
        return NextResponse.json({
          data: dummyCustomers,
          total: 20,
          page,
          limit,
          note: 'Using dummy data because customers table does not exist'
        });
      }
      
      // Jika tabel ada, ambil data dari database
      let customersQuery = `
        SELECT * FROM customers
      `;
      
      let countQuery = `
        SELECT COUNT(*) as total FROM customers
      `;
      
      if (status) {
        customersQuery += ` WHERE status = '${status}'`;
        countQuery += ` WHERE status = '${status}'`;
      }
      
      customersQuery += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      
      const customers = await sql.unsafe(customersQuery);
      const countResult = await sql.unsafe(countQuery);
      
      return NextResponse.json({
        data: customers || [],
        total: Number((countResult as unknown as any[])?.[0]?.total || 0),
        page,
        limit
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error fetching customers:', error);
    
    // Jika terjadi error, berikan data dummy
    const dummyCustomers = Array(10).fill(0).map((_, i) => ({
      id: i + 1,
      name: `Pelanggan ${i + 1}`,
      email: `pelanggan${i+1}@example.com`,
      phone: `08123456${String(i+1).padStart(4, '0')}`,
      address: `Alamat Pelanggan ${i+1}, Jakarta`,
      status: ['active', 'inactive'][i % 2],
      created_at: new Date().toISOString()
    }));
    
    return NextResponse.json({
      data: dummyCustomers,
      total: 20,
      page: 1,
      limit: 10,
      error: 'Using fallback dummy data due to error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 