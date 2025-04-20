import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

// Set this to force-dynamic to prevent caching
export const dynamic = 'force-dynamic';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET handler for retrieving drivers with pagination and search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // Check if table exists and create it if not
    await sql`
      CREATE TABLE IF NOT EXISTS drivers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        license_number VARCHAR(100) NOT NULL,
        vehicle_type VARCHAR(100) NOT NULL,
        vehicle_plate VARCHAR(50) NOT NULL,
        location VARCHAR(255),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Construct the SQL query based on whether search is provided
    let driversResult;
    let countResult;

    if (search) {
      // If search parameter is provided
      driversResult = await sql`
        SELECT * FROM drivers
        WHERE 
          name ILIKE ${`%${search}%`} OR
          phone ILIKE ${`%${search}%`} OR
          email ILIKE ${`%${search}%`} OR
          license_number ILIKE ${`%${search}%`} OR
          vehicle_plate ILIKE ${`%${search}%`}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      countResult = await sql`
        SELECT COUNT(*) FROM drivers
        WHERE 
          name ILIKE ${`%${search}%`} OR
          phone ILIKE ${`%${search}%`} OR
          email ILIKE ${`%${search}%`} OR
          license_number ILIKE ${`%${search}%`} OR
          vehicle_plate ILIKE ${`%${search}%`}
      `;
    } else {
      // If no search parameter is provided
      driversResult = await sql`
        SELECT * FROM drivers
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      countResult = await sql`
        SELECT COUNT(*) FROM drivers
      `;
    }

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        data: driversResult.rows,
        total,
        page,
        limit,
        totalPages,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST handler for creating a new driver
export async function POST(request: Request) {
  try {
    const { name, phone, email, licenseNumber, vehicleType, vehiclePlate, location, status } = await request.json();

    // Validate required fields
    if (!name || !phone || !licenseNumber || !vehicleType || !vehiclePlate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if table exists and create it if not
    await sql`
      CREATE TABLE IF NOT EXISTS drivers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        license_number VARCHAR(100) NOT NULL,
        vehicle_type VARCHAR(100) NOT NULL,
        vehicle_plate VARCHAR(50) NOT NULL,
        location VARCHAR(255),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert the new driver
    const result = await sql`
      INSERT INTO drivers (
        name, phone, email, license_number, vehicle_type, vehicle_plate, location, status
      ) VALUES (
        ${name}, ${phone}, ${email || null}, ${licenseNumber}, ${vehicleType}, ${vehiclePlate}, ${location || null}, ${status || 'active'}
      )
      RETURNING *
    `;

    return NextResponse.json(
      {
        message: 'Driver created successfully',
        data: result.rows[0],
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error creating driver:', error);
    return NextResponse.json(
      { error: 'Failed to create driver' },
      { status: 500, headers: corsHeaders }
    );
  }
} 