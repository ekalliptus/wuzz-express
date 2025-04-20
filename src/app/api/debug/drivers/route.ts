import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('GET /api/debug/drivers request received');
  
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
        AND table_name = 'drivers'
      ) as exists
    `);
    console.log('Drivers table exists:', tableCheck);
    
    if (!tableCheck[0]?.exists) {
      return NextResponse.json({
        message: 'Drivers table does not exist',
        recommendation: 'Add a driver first to create the table'
      }, { status: 404 });
    }
    
    // Get all drivers
    const drivers = await sql.query('SELECT * FROM drivers ORDER BY created_at DESC');
    console.log(`Found ${drivers.length} drivers in database`);
    
    return NextResponse.json({
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json({
      error: 'Failed to fetch drivers',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 