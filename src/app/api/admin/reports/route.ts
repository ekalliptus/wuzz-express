import { NextResponse, NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { isAuthenticated, logRequestHeaders, injectAuthHeaderFromCookie } from '@/lib/authHelpers';

export const dynamic = 'force-dynamic';

// CORS Helper
function addCorsHeaders(response: NextResponse) {
  const origin = 'http://localhost:3000';
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

export async function OPTIONS() {
  return addCorsHeaders(NextResponse.json({}, { status: 200 }));
}

export async function GET(request: NextRequest) {
  console.log('GET /api/admin/reports request received');
  
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
    
    // Saat ini hanya implementasi dummy
    // TODO: Implementasi sesuai kebutuhan bisnis
    
    // Mendapatkan ringkasan jumlah shipment berdasarkan status
    const shipmentsSummary = await sql`
      SELECT 
        status, 
        COUNT(*) as count
      FROM shipments
      GROUP BY status
      ORDER BY count DESC
    `;
    
    // Mendapatkan trend pengiriman weekly
    const weeklyTrend = await sql`
      SELECT 
        date_trunc('week', created_at) as week,
        COUNT(*) as shipment_count
      FROM shipments
      WHERE created_at > NOW() - INTERVAL '3 months'
      GROUP BY week
      ORDER BY week
    `;
    
    // Format data untuk response
    const formattedShipmentsSummary = shipmentsSummary.map(item => ({
      status: item.status,
      count: Number(item.count)
    }));
    
    const formattedWeeklyTrend = weeklyTrend.map(item => ({
      week: item.week,
      shipmentCount: Number(item.shipment_count)
    }));
    
    // Response sesuai dengan type yang diminta
    if (type === 'status') {
      return NextResponse.json(
        { data: formattedShipmentsSummary }, 
        { status: 200, headers }
      );
    } else if (type === 'trend') {
      return NextResponse.json(
        { data: formattedWeeklyTrend }, 
        { status: 200, headers }
      );
    } else {
      // Return semua data jika type tidak spesifik
      return NextResponse.json(
        { 
          statusSummary: formattedShipmentsSummary,
          weeklyTrend: formattedWeeklyTrend
        }, 
        { status: 200, headers }
      );
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' }, 
      { status: 500, headers }
    );
  }
} 