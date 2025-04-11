import { NextResponse, NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type');
    
    const sql = neon(process.env.DATABASE_URL!);
    
    // Cek apakah tabel locations ada
    try {
      const tablesResult = await sql.unsafe(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'locations'
        ) as exists
      `);
      
      const locationsTableExists = (tablesResult as unknown as any[])?.[0]?.exists;
      
      if (!locationsTableExists) {
        // Dummy data untuk demo
        const dummyLocations = [
          { id: 1, name: 'Kantor Pusat Jakarta', address: 'Jl. Sudirman No. 123, Jakarta', province: 'DKI Jakarta', city: 'Jakarta Pusat', type: 'hub' },
          { id: 2, name: 'Cabang Surabaya', address: 'Jl. Pemuda No. 45, Surabaya', province: 'Jawa Timur', city: 'Surabaya', type: 'branch' },
          { id: 3, name: 'Cabang Bandung', address: 'Jl. Asia Afrika No. 78, Bandung', province: 'Jawa Barat', city: 'Bandung', type: 'branch' },
          { id: 4, name: 'Agen Semarang', address: 'Jl. Pandanaran No. 33, Semarang', province: 'Jawa Tengah', city: 'Semarang', type: 'agent' },
          { id: 5, name: 'Agen Yogyakarta', address: 'Jl. Malioboro No. 99, Yogyakarta', province: 'DIY', city: 'Yogyakarta', type: 'agent' },
          { id: 6, name: 'Cabang Makassar', address: 'Jl. Urip Sumoharjo No. 55, Makassar', province: 'Sulawesi Selatan', city: 'Makassar', type: 'branch' },
          { id: 7, name: 'Agen Denpasar', address: 'Jl. Diponegoro No. 22, Denpasar', province: 'Bali', city: 'Denpasar', type: 'agent' },
          { id: 8, name: 'Cabang Medan', address: 'Jl. Gatot Subroto No. 77, Medan', province: 'Sumatera Utara', city: 'Medan', type: 'branch' },
          { id: 9, name: 'Agen Palembang', address: 'Jl. Jendral Sudirman No. 101, Palembang', province: 'Sumatera Selatan', city: 'Palembang', type: 'agent' },
          { id: 10, name: 'Cabang Balikpapan', address: 'Jl. Jendral Ahmad Yani No. 12, Balikpapan', province: 'Kalimantan Timur', city: 'Balikpapan', type: 'branch' }
        ];
        
        // Filter berdasarkan tipe jika diperlukan
        const filteredLocations = type ? dummyLocations.filter(loc => loc.type === type) : dummyLocations;
        
        return NextResponse.json({
          locations: filteredLocations,
          total: filteredLocations.length,
          note: 'Using dummy data because locations table does not exist'
        });
      }
      
      // Jika tabel ada, ambil data dari database
      let locationsQuery = `
        SELECT * FROM locations
      `;
      
      if (type) {
        locationsQuery += ` WHERE type = '${type}'`;
      }
      
      locationsQuery += ` ORDER BY province, city, name`;
      
      const locations = await sql.unsafe(locationsQuery);
      
      return NextResponse.json({
        locations: locations || [],
        total: (locations as unknown as any[])?.length || 0
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error fetching locations:', error);
    
    // Jika terjadi error, berikan data dummy
    const dummyLocations = [
      { id: 1, name: 'Kantor Pusat Jakarta', address: 'Jl. Sudirman No. 123, Jakarta', province: 'DKI Jakarta', city: 'Jakarta Pusat', type: 'hub' },
      { id: 2, name: 'Cabang Surabaya', address: 'Jl. Pemuda No. 45, Surabaya', province: 'Jawa Timur', city: 'Surabaya', type: 'branch' },
      { id: 3, name: 'Cabang Bandung', address: 'Jl. Asia Afrika No. 78, Bandung', province: 'Jawa Barat', city: 'Bandung', type: 'branch' },
      { id: 4, name: 'Agen Semarang', address: 'Jl. Pandanaran No. 33, Semarang', province: 'Jawa Tengah', city: 'Semarang', type: 'agent' },
      { id: 5, name: 'Agen Yogyakarta', address: 'Jl. Malioboro No. 99, Yogyakarta', province: 'DIY', city: 'Yogyakarta', type: 'agent' }
    ];
    
    // Filter berdasarkan tipe jika diperlukan
    const filteredLocations = type ? dummyLocations.filter(loc => loc.type === type) : dummyLocations;
    
    return NextResponse.json({
      locations: filteredLocations,
      total: filteredLocations.length,
      error: 'Using fallback dummy data due to error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 