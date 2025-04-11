import { NextResponse, NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const status = request.nextUrl.searchParams.get('status');
    
    const sql = neon(process.env.DATABASE_URL!);
    const offset = (page - 1) * limit;
    
    // Cek apakah tabel shipments ada
    try {
      const tablesResult = await sql.unsafe(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'shipments'
        ) as exists
      `);
      
      const shipmentsTableExists = (tablesResult as unknown as any[])?.[0]?.exists;
      
      if (!shipmentsTableExists) {
        // Dummy data untuk demo
        const dummyShipments = Array(10).fill(0).map((_, i) => ({
          id: i + 1,
          receipt_number: `WZ${String(2023000 + i + 1).padStart(8, '0')}`,
          sender_name: `Pengirim ${i + 1}`,
          recipient_name: `Penerima ${i + 1}`,
          origin_city: 'Jakarta',
          destination_city: ['Surabaya', 'Bandung', 'Semarang', 'Yogyakarta', 'Denpasar'][i % 5],
          weight: Math.floor(Math.random() * 10) + 1,
          price: Math.floor(Math.random() * 100000) + 50000,
          status: ['pending', 'processing', 'in_transit', 'delivered', 'cancelled'][i % 5],
          created_at: new Date().toISOString(),
          service_type_name: 'Regular'
        }));
        
        return NextResponse.json({
          data: dummyShipments,
          total: 20,
          page,
          limit,
          note: 'Using dummy data because shipments table does not exist'
        });
      }
      
      // Jika tabel ada, ambil data dari database
      let shipmentsQuery = `
        SELECT s.*, st.name as service_type_name 
        FROM shipments s
        JOIN service_types st ON s.service_type_id = st.id
      `;
      
      let countQuery = `
        SELECT COUNT(*) as total FROM shipments
      `;
      
      if (status) {
        shipmentsQuery += ` WHERE s.status = '${status}'`;
        countQuery += ` WHERE status = '${status}'`;
      }
      
      shipmentsQuery += ` ORDER BY s.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      
      const shipments = await sql.unsafe(shipmentsQuery);
      const countResult = await sql.unsafe(countQuery);
      
      return NextResponse.json({
        data: shipments || [],
        total: Number((countResult as unknown as any[])?.[0]?.total || 0),
        page,
        limit
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error fetching shipments:', error);
    
    // Jika terjadi error, berikan data dummy
    const dummyShipments = Array(10).fill(0).map((_, i) => ({
      id: i + 1,
      receipt_number: `WZ${String(2023000 + i + 1).padStart(8, '0')}`,
      sender_name: `Pengirim ${i + 1}`,
      recipient_name: `Penerima ${i + 1}`,
      origin_city: 'Jakarta',
      destination_city: ['Surabaya', 'Bandung', 'Semarang', 'Yogyakarta', 'Denpasar'][i % 5],
      weight: Math.floor(Math.random() * 10) + 1,
      price: Math.floor(Math.random() * 100000) + 50000,
      status: ['pending', 'processing', 'in_transit', 'delivered', 'cancelled'][i % 5],
      created_at: new Date().toISOString(),
      service_type_name: 'Regular'
    }));
    
    return NextResponse.json({
      data: dummyShipments,
      total: 20,
      page: 1,
      limit: 10,
      error: 'Using fallback dummy data due to error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 