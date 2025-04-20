import { NextResponse, NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';

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

// POST method untuk membuat pelanggan baru
export async function POST(request: NextRequest) {
  console.log('POST /api/customers request received');
  
  try {
    // Ambil data dari request body
    const body = await request.json();
    console.log('Received customer data:', body);
    
    // Validasi data
    if (!body.name || !body.email || !body.phone || !body.address || !body.city || 
        !body.province || !body.postalCode || !body.category) {
      console.log('Validation failed, missing fields');
      return addCorsHeaders(NextResponse.json(
        { error: 'Semua field wajib diisi' }, 
        { status: 400 }
      ));
    }
    
    // Inisialisasi koneksi database
    console.log('Connecting to database...');
    const sql = neon(process.env.DATABASE_URL!);
    
    // Tambahkan data pelanggan baru
    try {
      // Test database connection
      const testResult = await sql.query('SELECT 1 as test');
      console.log('Database connection test:', testResult);
      
      // Check if table exists
      const tableCheck = await sql.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'customers'
        ) as exists
      `);
      console.log('Customers table exists:', tableCheck);
      
      // Create table if not exists
      if (!tableCheck[0]?.exists) {
        console.log('Creating customers table...');
        await sql.query(`
          CREATE TABLE IF NOT EXISTS customers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(50),
            address TEXT,
            status VARCHAR(50) DEFAULT 'active',
            category VARCHAR(50),
            city VARCHAR(100),
            province VARCHAR(100),
            postal_code VARCHAR(10),
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('Customers table created');
      } else {
        // Buat ALTER TABLE untuk menambahkan kolom baru jika belum ada
        console.log('Adding missing columns if needed...');
        await sql.query(`
          ALTER TABLE customers 
          ADD COLUMN IF NOT EXISTS category VARCHAR(50),
          ADD COLUMN IF NOT EXISTS city VARCHAR(100),
          ADD COLUMN IF NOT EXISTS province VARCHAR(100),
          ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10),
          ADD COLUMN IF NOT EXISTS notes TEXT
        `);
      }
      
      // Insert ke database
      console.log('Inserting new customer...');
      const result = await sql.query(`
        INSERT INTO customers (
          name, email, phone, address, category, city, province, postal_code, notes, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, 'active'
        ) RETURNING id
      `, [
        body.name,
        body.email,
        body.phone,
        body.address,
        body.category,
        body.city,
        body.province,
        body.postalCode,
        body.notes || ''
      ]);
      
      // Dapatkan ID dari customer yang baru dibuat
      const newCustomerId = result[0]?.id;
      console.log('Customer created with ID:', newCustomerId);
      
      // Return response sukses
      return addCorsHeaders(NextResponse.json({
        success: true,
        message: 'Pelanggan berhasil ditambahkan',
        data: { 
          id: newCustomerId,
          ...body,
          status: 'active',
          created_at: new Date().toISOString()
        }
      }, { status: 201 }));
    } catch (error) {
      console.error('Error creating customer:', error);
      
      // Cek apakah error unique constraint violation (email sudah ada)
      if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
        return addCorsHeaders(NextResponse.json({
          error: 'Email sudah terdaftar. Gunakan email lain.',
        }, { status: 409 }));
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error in customer creation:', error);
    return addCorsHeaders(NextResponse.json({
      error: 'Terjadi kesalahan saat membuat pelanggan baru',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 }));
  }
}

// GET method untuk mengambil semua pelanggan
export async function GET(request: NextRequest) {
  console.log('GET /api/customers request received');
  
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    
    console.log('Fetching customers with params:', { page, limit, status });
    
    // Inisialisasi koneksi database
    console.log('Connecting to database...');
    const sql = neon(process.env.DATABASE_URL!);
    const offset = (page - 1) * limit;
    
    // Test database connection
    const testResult = await sql.query('SELECT 1 as test');
    console.log('Database connection test:', testResult);
    
    // Check if table exists
    const tableCheck = await sql.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customers'
      ) as exists
    `);
    console.log('Customers table exists:', tableCheck);
    
    if (!tableCheck[0]?.exists) {
      console.log('Creating customers table since it does not exist');
      await sql.query(`
        CREATE TABLE IF NOT EXISTS customers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(50),
          address TEXT,
          status VARCHAR(50) DEFAULT 'active',
          category VARCHAR(50),
          city VARCHAR(100),
          province VARCHAR(100),
          postal_code VARCHAR(10),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Return empty data when table was just created
      return addCorsHeaders(NextResponse.json({
        data: [],
        total: 0,
        page,
        limit,
        message: 'Customers table created. No records yet.'
      }));
    }
    
    // Jika tabel ada, ambil data dari database
    console.log('Customers table exists, fetching data...');
    
    let customersQuery = `
      SELECT * FROM customers
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total FROM customers
    `;
    
    if (status) {
      customersQuery += ` WHERE status = $1`;
      countQuery += ` WHERE status = $1`;
    }
    
    customersQuery += ` ORDER BY created_at DESC LIMIT $${status ? 2 : 1} OFFSET $${status ? 3 : 2}`;
    
    // Execute count query
    const countParams = status ? [status] : [];
    const countResult = await sql.query(countQuery, countParams);
    console.log('Count result:', countResult);
    
    // Execute customers query
    const queryParams = status 
      ? [status, limit, offset] 
      : [limit, offset];
    
    const customers = await sql.query(customersQuery, queryParams);
    console.log(`Found ${customers.length} customers`);
    
    return addCorsHeaders(NextResponse.json({
      data: customers || [],
      total: Number(countResult[0]?.total || 0),
      page,
      limit
    }));
  } catch (error) {
    console.error('Error fetching customers:', error);
    return addCorsHeaders(NextResponse.json({
      error: 'Terjadi kesalahan saat mengambil data pelanggan',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 }));
  }
} 