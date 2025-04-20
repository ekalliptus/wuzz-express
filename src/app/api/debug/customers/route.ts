import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('GET /api/debug/customers request received');
  
  try {
    // Initialize database connection
    console.log('Connecting to database...');
    const sql = neon(process.env.DATABASE_URL!);
    
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
      return NextResponse.json({
        message: 'Customers table does not exist',
        recommendation: 'Add a customer first to create the table'
      }, { status: 404 });
    }
    
    // Get all customers
    const customers = await sql.query('SELECT * FROM customers ORDER BY created_at DESC');
    console.log(`Found ${customers.length} customers in database`);
    
    return NextResponse.json({
      count: customers.length,
      data: customers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({
      error: 'Failed to fetch customers',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 