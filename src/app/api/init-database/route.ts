import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

// Fungsi untuk mengeksekusi SQL dengan error handling yang lebih baik
async function executeSql(sql, statement, description) {
  try {
    console.log(`init-database: Menjalankan ${description}...`);
    await sql.query(statement);
    console.log(`init-database: ${description} berhasil dijalankan`);
    return true;
  } catch (error) {
    console.error(`init-database: Error saat ${description}:`, error);
    return false;
  }
}

export async function POST() {
  try {
    console.log('init-database: Memulai proses inisialisasi database');
    
    // Periksa DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error('init-database: DATABASE_URL tidak ditemukan dalam env');
      return NextResponse.json(
        { success: false, error: 'Konfigurasi database tidak lengkap' },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);
    
    // Uji koneksi database
    try {
      console.log('init-database: Menguji koneksi database...');
      const testResult = await sql.query(`SELECT 1 as test`);
      console.log('init-database: Koneksi database berhasil:', testResult);
    } catch (connError) {
      console.error('init-database: Koneksi database gagal:', connError);
      return NextResponse.json(
        { success: false, error: `Koneksi database gagal: ${connError.message}` },
        { status: 500 }
      );
    }

    // 1. Perbaiki tabel users
    console.log('init-database: Perbaiki kolom yang hilang di tabel users');
    
    // Tambahkan kolom password_hash
    await executeSql(sql, 
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`,
      'menambahkan kolom password_hash'
    );
    
    // Tambahkan kolom password_salt
    await executeSql(sql, 
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_salt VARCHAR(255)`,
      'menambahkan kolom password_salt'
    );
    
    // Tambahkan kolom status
    await executeSql(sql, 
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'`,
      'menambahkan kolom status'
    );
    
    // Tambahkan kolom updated_at
    await executeSql(sql, 
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      'menambahkan kolom updated_at'
    );
    
    // Update data yang ada
    await executeSql(sql, 
      `UPDATE users SET status = 'active' WHERE status IS NULL`,
      'mengatur nilai default untuk status'
    );
    
    await executeSql(sql, 
      `UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL`,
      'mengatur nilai default untuk updated_at'
    );
    
    // 2. Buat tabel customers jika belum ada
    console.log('init-database: Membuat tabel customers jika belum ada');
    await executeSql(sql, `
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, 'membuat tabel customers');
    
    // Isi data contoh ke customers jika kosong
    const customerCountResult = await sql.query(`SELECT COUNT(*) as count FROM customers`);
    const customerCount = Number(customerCountResult[0]?.count) || 0;
    if (customerCount === 0) {
      await executeSql(sql, `
        INSERT INTO customers (name, email, phone, address, status)
        VALUES 
          ('Pelanggan Satu', 'customer1@example.com', '081234567001', 'Jl. Contoh No. 1, Jakarta', 'active'),
          ('Pelanggan Dua', 'customer2@example.com', '081234567002', 'Jl. Contoh No. 2, Bandung', 'active'),
          ('PT Maju Jaya', 'info@majujaya.com', '021-5551234', 'Jl. Industri No. 15, Jakarta', 'active')
      `, 'mengisi data customers');
    }
    
    // 3. Buat tabel reports jika belum ada
    console.log('init-database: Membuat tabel reports jika belum ada');
    await executeSql(sql, `
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        content TEXT,
        parameters JSONB,
        created_by INTEGER,
        last_generated TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, 'membuat tabel reports');
    
    // Isi data contoh ke reports jika kosong
    const reportCountResult = await sql.query(`SELECT COUNT(*) as count FROM reports`);
    const reportCount = Number(reportCountResult[0]?.count) || 0;
    if (reportCount === 0) {
      await executeSql(sql, `
        INSERT INTO reports (title, type, content, parameters, last_generated)
        VALUES 
          ('Laporan Pengiriman Bulanan', 'shipment', 'Rangkuman pengiriman bulanan', '{"period": "monthly"}', NOW()),
          ('Laporan Pendapatan', 'revenue', 'Laporan pendapatan perusahaan', '{"period": "quarterly"}', NOW()),
          ('Laporan Kinerja Lokasi', 'location', 'Evaluasi kinerja setiap lokasi', '{"period": "monthly"}', NOW())
      `, 'mengisi data reports');
    }
    
    // 4. Buat tabel locations jika belum ada
    console.log('init-database: Membuat tabel locations jika belum ada');
    await executeSql(sql, `
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        type VARCHAR(50),
        capacity INTEGER,
        coordinates POINT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, 'membuat tabel locations');
    
    // Isi data contoh ke locations jika kosong
    const locationCountResult = await sql.query(`SELECT COUNT(*) as count FROM locations`);
    const locationCount = Number(locationCountResult[0]?.count) || 0;
    if (locationCount === 0) {
      await executeSql(sql, `
        INSERT INTO locations (name, address, type, capacity, status)
        VALUES 
          ('Jakarta Pusat', 'Jl. Merdeka No. 1, Jakarta Pusat', 'hub', 100, 'active'),
          ('Bandung', 'Jl. Asia Afrika No. 15, Bandung', 'branch', 50, 'active'),
          ('Surabaya', 'Jl. Panglima Sudirman No. 10, Surabaya', 'hub', 80, 'active')
      `, 'mengisi data locations');
    }
    
    // Ambil daftar tabel yang ada setelah proses
    console.log('init-database: Mengambil daftar tabel setelah inisialisasi');
    const tablesResult = await sql.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.map((row: any) => row.table_name);
    console.log('init-database: Tabel yang ada di database:', tables);
    
    // Verifikasi kolom users
    console.log('init-database: Verifikasi kolom di tabel users');
    const userColumns = await sql.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    const columnNames = userColumns.map((row: any) => row.column_name);
    console.log('init-database: Kolom di tabel users:', columnNames);
    
    // Cek kolom yang dibutuhkan
    const requiredColumns = ['password_hash', 'password_salt', 'status', 'updated_at'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.warn('init-database: Masih ada kolom yang belum berhasil ditambahkan:', missingColumns);
      return NextResponse.json({
        success: false,
        error: `Beberapa kolom masih belum berhasil ditambahkan: ${missingColumns.join(', ')}`,
        tables,
        missing_columns: missingColumns
      });
    }
    
    // Tambahkan kode VACUUM (analisis) untuk memastikan statistik database diperbarui
    try {
      console.log('init-database: Menjalankan ANALYZE untuk memperbarui statistik database...');
      await sql.query(`ANALYZE`);
      console.log('init-database: ANALYZE berhasil dijalankan');
    } catch (analyzeError) {
      console.error('init-database: Error saat menjalankan ANALYZE:', analyzeError);
      // Tetap lanjutkan meskipun ANALYZE gagal
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database berhasil diinisialisasi dengan data contoh. Silakan refresh halaman untuk melihat perubahan.',
      tables,
      refreshNeeded: true
    });
  } catch (error) {
    console.error('init-database: Error saat inisialisasi database:', error);
    return NextResponse.json(
      { success: false, error: `Terjadi kesalahan: ${error.message}` },
      { status: 500 }
    );
  }
} 