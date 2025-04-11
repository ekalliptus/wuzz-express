import { NextResponse, NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

// Helper function untuk memeriksa autentikasi
function isAuthenticated(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  // Pada implementasi sebenarnya Anda perlu memverifikasi token dengan benar
  // Namun untuk saat ini, kita hanya memeriksa keberadaan token
  const token = authHeader.split(' ')[1];
  return !!token;
}

export async function GET(request: NextRequest) {
  // Periksa autentikasi
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  try {
    const type = request.nextUrl.searchParams.get('type');
    
    const sql = neon(process.env.DATABASE_URL!);
    
    // Cek apakah tabel reports ada
    try {
      const tablesResult = await sql.unsafe(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'reports'
        ) as exists
      `);
      
      const reportsTableExists = (tablesResult as unknown as any[])?.[0]?.exists;
      
      if (!reportsTableExists) {
        // Dummy data untuk demo
        const dummyReports = [
          {
            id: 1,
            title: 'Laporan Pengiriman Bulanan',
            type: 'shipment',
            format: 'pdf',
            data: JSON.stringify({totalShipments: 240, totalRevenue: 48500000}),
            last_generated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            created_by: 1
          },
          {
            id: 2,
            title: 'Laporan Keuangan Bulanan',
            type: 'finance',
            format: 'excel',
            data: JSON.stringify({revenue: 48500000, expenses: 32400000, profit: 16100000}),
            last_generated: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            created_by: 1
          },
          {
            id: 3,
            title: 'Laporan Performa Kurir',
            type: 'performance',
            format: 'pdf',
            data: JSON.stringify({totalCouriers: 15, avgRating: 4.7, totalDeliveries: 450}),
            last_generated: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
            created_by: 1
          },
          {
            id: 4,
            title: 'Laporan Keluhan Pelanggan',
            type: 'complaint',
            format: 'pdf',
            data: JSON.stringify({totalComplaints: 12, resolvedComplaints: 10, pendingComplaints: 2}),
            last_generated: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
            created_by: 1
          },
          {
            id: 5,
            title: 'Laporan Pengiriman Mingguan',
            type: 'shipment',
            format: 'excel',
            data: JSON.stringify({totalShipments: 75, totalRevenue: 15250000}),
            last_generated: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
            created_by: 1
          }
        ];
        
        // Filter berdasarkan tipe jika diperlukan
        const filteredReports = type && type !== 'all'
          ? dummyReports.filter(report => report.type === type)
          : dummyReports;
        
        return NextResponse.json({
          data: filteredReports,
          total: filteredReports.length,
          note: 'Using dummy data because reports table does not exist'
        });
      }
      
      // Jika tabel ada, ambil data dari database
      let reportsQuery = `
        SELECT * FROM reports
      `;
      
      if (type && type !== 'all') {
        reportsQuery += ` WHERE type = '${type}'`;
      }
      
      reportsQuery += ` ORDER BY last_generated DESC`;
      
      const reports = await sql.unsafe(reportsQuery);
      
      return NextResponse.json({
        data: reports || [],
        total: (reports as unknown as any[])?.length || 0
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
    
    // Jika terjadi error, berikan data dummy
    const dummyReports = [
      {
        id: 1,
        title: 'Laporan Pengiriman Bulanan',
        type: 'shipment',
        format: 'pdf',
        data: JSON.stringify({totalShipments: 240, totalRevenue: 48500000}),
        last_generated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        created_by: 1
      },
      {
        id: 2,
        title: 'Laporan Keuangan Bulanan',
        type: 'finance',
        format: 'excel',
        data: JSON.stringify({revenue: 48500000, expenses: 32400000, profit: 16100000}),
        last_generated: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        created_by: 1
      },
      {
        id: 3,
        title: 'Laporan Performa Kurir',
        type: 'performance',
        format: 'pdf',
        data: JSON.stringify({totalCouriers: 15, avgRating: 4.7, totalDeliveries: 450}),
        last_generated: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        created_by: 1
      }
    ];
    
    // Filter berdasarkan tipe jika diperlukan
    const filteredReports = type && type !== 'all'
      ? dummyReports.filter(report => report.type === type)
      : dummyReports;
    
    return NextResponse.json({
      data: filteredReports,
      total: filteredReports.length,
      error: 'Using fallback dummy data due to error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 