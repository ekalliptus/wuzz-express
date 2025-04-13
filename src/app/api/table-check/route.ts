import { NextResponse, NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('table-check: Memulai pengecekan tabel database');
    const sql = neon(process.env.DATABASE_URL!);
    
    // Daftar tabel yang diharapkan tersedia
    const expectedTables = [
      'users',
      'shipments',
      'service_types',
      'customers',
      'locations',
      'reports'
    ];
    
    // Periksa tabel yang ada dengan query yang lebih sederhana
    console.log('table-check: Mengambil semua tabel dari skema public');
    const tableResult = await sql`
      SELECT table_name, table_schema
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const existingTables = tableResult.map((t: any) => t.table_name);
    console.log('table-check: Tabel yang ditemukan:', existingTables);
    
    // Tabel yang tidak ada
    const missingTables = expectedTables.filter(t => !existingTables.includes(t));
    console.log('table-check: Tabel yang hilang:', missingTables);
    
    // Tabel yang memiliki masalah case sensitivity
    const tablesWrongCase = tableResult
      .filter((t: any) => {
        const lowerName = t.table_name.toLowerCase();
        return expectedTables.includes(lowerName) && t.table_name !== lowerName;
      })
      .map((t: any) => ({
        actual: t.table_name,
        expected: t.table_name.toLowerCase(),
        schema: t.table_schema
      }));
    
    console.log('table-check: Tabel dengan case yang salah:', tablesWrongCase);
    
    // Periksa struktur kolom untuk tabel yang ada
    const tableProblems = [];
    
    // Periksa tabel users
    if (existingTables.includes('users')) {
      try {
        // Daftar kolom yang diharapkan
        const expectedColumns = ['id', 'name', 'email', 'password', 'password_hash', 'password_salt', 'role', 'status', 'created_at', 'updated_at'];
        
        console.log('table-check: Memeriksa kolom tabel users dengan query langsung');
        
        // Gunakan query yang lebih sederhana untuk memeriksa kolom
        let columnResult;
        try {
          columnResult = await sql.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'users'
            AND table_schema = 'public'
          `);
          console.log('table-check: Query kolom users berhasil:', columnResult);
        } catch (queryError) {
          console.error('table-check: Error saat query kolom users:', queryError);
          throw new Error(`Gagal mengambil informasi kolom: ${queryError.message}`);
        }
        
        const existingColumns = columnResult.map((c: any) => c.column_name);
        console.log('table-check: Kolom users yang ditemukan:', existingColumns);
        
        const missingColumns = expectedColumns.filter(c => !existingColumns.includes(c));
        if (missingColumns.length > 0) {
          console.log('table-check: Kolom users yang hilang:', missingColumns);
          tableProblems.push({
            table: 'users',
            problem: 'missing_columns',
            details: missingColumns
          });
        } else {
          console.log('table-check: Semua kolom users yang diharapkan sudah ada');
        }
        
        // Mencoba deteksi masalah persisten dengan kolom tertentu
        console.log('table-check: Memeriksa apakah kolom-kolom penting benar-benar sudah ada dengan query langsung');
        for (const criticalColumn of ['password_hash', 'password_salt', 'status', 'updated_at']) {
          try {
            const checkResult = await sql.query(`
              SELECT '${criticalColumn}' as checked_column, 
                     EXISTS (
                       SELECT 1 
                       FROM information_schema.columns 
                       WHERE table_schema = 'public' 
                       AND table_name = 'users' 
                       AND column_name = '${criticalColumn}'
                     ) as exists
            `);
            console.log(`table-check: Kolom ${criticalColumn} ada:`, checkResult[0]?.exists);
          } catch (checkError) {
            console.error(`table-check: Error saat memeriksa kolom ${criticalColumn}:`, checkError);
          }
        }
      } catch (err) {
        console.error('table-check: Error memeriksa tabel users:', err);
        tableProblems.push({
          table: 'users',
          problem: 'error_checking',
          details: err instanceof Error ? err.message : String(err)
        });
      }
    }
    
    // Periksa tabel lain jika perlu
    for (const table of ['customers', 'reports', 'locations']) {
      if (existingTables.includes(table)) {
        try {
          console.log(`table-check: Verifikasi bahwa tabel ${table} dapat diakses`);
          const testQuery = await sql.query(`SELECT COUNT(*) FROM "${table}"`);
          console.log(`table-check: Tabel ${table} dapat diakses, jumlah baris:`, testQuery);
        } catch (err) {
          console.error(`table-check: Error mengakses tabel ${table}:`, err);
          tableProblems.push({
            table,
            problem: 'error_accessing',
            details: err instanceof Error ? err.message : String(err)
          });
        }
      }
    }
    
    console.log('table-check: Pengecekan selesai');
    console.log('table-check: tableProblems:', tableProblems);
    
    return NextResponse.json({
      is_complete: missingTables.length === 0 && tablesWrongCase.length === 0 && tableProblems.length === 0,
      tables: existingTables,
      missing_tables: missingTables,
      tables_wrong_case: tablesWrongCase,
      table_problems: tableProblems
    });
  } catch (error) {
    console.error('Error checking tables:', error);
    return NextResponse.json(
      { error: 'Error checking database tables', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 