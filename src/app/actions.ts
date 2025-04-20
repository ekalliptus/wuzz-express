"use server";
import { neon } from "@neondatabase/serverless";
import { Shipment, ServiceType } from "@/types";
import * as crypto from 'crypto';
import { createClient } from "@neondatabase/serverless";
import { Client } from "@neondatabase/serverless";

/**
 * Mendapatkan base URL untuk API calls
 */
function getBaseUrl() {
  // Server-side
  if (typeof window === 'undefined') {
    // Gunakan URL dari environment variable jika tersedia
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
    
    // Fallback ke localhost
    return 'http://localhost:3000';
  }
  
  // Client-side - gunakan URL asli (tidak perlu origin)
  return ''; // Gunakan URL relatif untuk hindari masalah CORS
}

/**
 * Fungsi untuk menghash password dengan salt
 */
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  // Gunakan salt yang ada atau buat baru
  const passwordSalt = salt || crypto.randomBytes(16).toString('hex');
  
  // Buat hash dengan SHA-256
  const hash = crypto
    .createHmac('sha256', passwordSalt)
    .update(password)
    .digest('hex');
  
  return { hash, salt: passwordSalt };
}

/**
 * Fungsi untuk verifikasi password
 */
function verifyPassword(password: string, hash: string, salt: string): boolean {
  const passwordData = hashPassword(password, salt);
  return passwordData.hash === hash;
}

/**
 * Fungsi helper untuk mendapatkan token otentikasi dari window.tokenId
 */
function getAuthToken() {
  // Client-side
  if (typeof window !== 'undefined') {
    // Jika window.tokenId masih kosong, coba dapatkan dari localStorage
    if (!(window as any).tokenId) {
      // Cek dari localStorage jika user sudah login
      const storedUser = localStorage.getItem('wuzz_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.id) {
            // Set token di window
            (window as any).tokenId = String(parsedUser.id);
            console.log('Token berhasil diset dari localStorage user:', (window as any).tokenId);
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      // Jika masih kosong, coba dari cookie
      if (!(window as any).tokenId) {
        try {
          // Cek dari cookies
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'auth_token' && value) {
              (window as any).tokenId = value;
              console.log('Token berhasil diset dari cookie:', value);
              break;
            }
          }
        } catch (e) {
          console.error('Error reading cookie:', e);
        }
      }
    }
    
    // Gunakan token yang sudah diset
    const token = (window as any).tokenId || '';
    
    // Log status token
    if (token) {
      console.log('Token ditemukan:', token);
    } else {
      console.log('Token tidak ditemukan di window.tokenId');
    }
    
    return token;
  }
  
  // Server-side - token tidak dapat diakses langsung
  return '';
}

/**
 * Fungsi helper untuk menyiapkan headers dengan token otentikasi
 */
function getAuthHeaders() {
  // Gunakan token dari window.tokenId
  const token = getAuthToken();
  
  console.log(`Token untuk API: ${token ? 'Ada' : 'Tidak ada'}`);
  
  return {
    'Content-Type': 'application/json',
    // Jangan gunakan header Authorization kosong
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// Fungsi helper untuk menambahkan token ke URL query parameter
function addTokenToUrl(url: string): string {
  const token = getAuthToken();
  if (!token) return url;
  
  // Jika URL sudah memiliki parameter
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

/**
 * Mendapatkan semua data pengiriman
 */
export async function getShipments(page = 1, limit = 10, status?: string) {
  try {
    // Initialize the SQL client
    const sql = neon(process.env.DATABASE_URL!);
    
    // Hitung offset untuk pagination
    const offset = (page - 1) * limit;
    
    // Buat query dasar tanpa service_type_id
    let baseQuery = `
      SELECT 
        s.id, s.tracking_number, s.customer_id, s.origin_id, s.destination_address,
        s.destination_city, s.destination_province, s.status, s.created_at,
        s.estimated_delivery, s.driver_id, s.items_count,
        c.name as customer_name,
        d.name as driver_name,
        l.name as origin_name
      FROM shipments s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN drivers d ON s.driver_id = d.id
      LEFT JOIN locations l ON s.origin_id = l.id
    `;
    
    // Tambahkan kondisi WHERE jika ada filter status
    const whereClause = status ? `WHERE s.status = '${status}'` : '';
    
    // Tambahkan ORDER BY dan LIMIT untuk pagination
    const paginationClause = `ORDER BY s.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    
    // Gabungkan query
    const query = `${baseQuery} ${whereClause} ${paginationClause}`;
    
    // Jalankan query utama menggunakan sql client
    const result = await sql.query(query);
    
    // Query untuk menghitung total
    let countQuery = `SELECT COUNT(*) as total FROM shipments s`;
    if (status) {
      countQuery += ` WHERE s.status = '${status}'`;
    }
    
    // Jalankan query count menggunakan sql client
    const countResult = await sql.query(countQuery);
    const total = parseInt(countResult[0].total);
    
    // Transform data untuk frontend
    const transformedData = result.map(row => ({
      id: row.id,
      trackingNumber: row.tracking_number,
      customer: {
        name: row.customer_name,
        id: row.customer_id
      },
      origin: row.origin_name || 'Asal tidak tersedia',
      destination: `${row.destination_address}, ${row.destination_city}, ${row.destination_province}`,
      status: row.status,
      createdAt: row.created_at,
      driverName: row.driver_name,
      estimatedDelivery: row.estimated_delivery,
      items: row.items_count
    }));
    
    return {
      data: transformedData,
      total,
      limit,
      page
    };
  } catch (error) {
    console.error("Error in getShipments:", error);
    throw error;
  }
}

/**
 * Pelacakan pengiriman berdasarkan nomor resi
 */
export async function trackShipment(trackingNumber: string) {
  const sql = neon(process.env.DATABASE_URL!);
  
  // Mendapatkan data pengiriman
  const shipments = await sql`
    SELECT 
      s.*,
      st.name as service_type_name,
      st.code as service_type_code,
      st.description as service_type_description
    FROM shipments s
    JOIN service_types st ON s.service_type_id = st.id
    WHERE s.receipt_number = ${trackingNumber}
  `;
  
  if (shipments.length === 0) {
    return null;
  }
  
  const shipment = shipments[0];
  
  // Mendapatkan history tracking
  const history = await sql`
    SELECT * FROM tracking_history
    WHERE shipment_id = ${shipment.id}
    ORDER BY timestamp DESC
  `;
  
  // Format ulang untuk sesuai dengan tipe data aplikasi
  return {
    id: shipment.id,
    receiptNumber: shipment.receipt_number,
    senderId: shipment.sender_id || '',
    recipientId: shipment.recipient_id || '',
    serviceTypeId: shipment.service_type_id,
    weight: Number(shipment.weight),
    price: Number(shipment.price),
    status: shipment.status,
    description: shipment.description || '',
    items: [],
    courierId: shipment.courier_id || '',
    trackingHistory: history.map(item => ({
      id: item.id,
      shipmentId: item.shipment_id,
      status: item.status,
      description: item.description,
      location: item.location,
      timestamp: item.timestamp,
    })),
    pickupDate: shipment.pickup_date || new Date(),
    estimatedDeliveryDate: shipment.estimated_delivery_date,
    actualDeliveryDate: shipment.actual_delivery_date,
    createdAt: shipment.created_at,
    updatedAt: shipment.updated_at,
    serviceType: {
      id: shipment.service_type_id,
      name: shipment.service_type_name,
      code: shipment.service_type_code || '',
      description: shipment.service_type_description,
      estimatedTime: '',
      pricePerKg: 0
    },
    sender: {
      name: shipment.sender_name,
      address: shipment.sender_address,
      phone: shipment.sender_phone
    },
    recipient: {
      name: shipment.recipient_name,
      address: shipment.recipient_address,
      phone: shipment.recipient_phone
    }
  };
}

/**
 * Menghitung tarif pengiriman
 */
export async function calculateRate(
  originCity: string,
  destinationCity: string,
  weight: number,
  serviceTypeId?: string
) {
  const sql = neon(process.env.DATABASE_URL!);
  
  // Gunakan parameter binding untuk query yang aman
  if (serviceTypeId) {
    const rates = await sql`
      SELECT 
        sr.*,
        st.id as service_type_id,
        st.name,
        st.description,
        st.code,
        st.base_price,
        st.estimation_days
      FROM shipping_rates sr
      JOIN service_types st ON sr.service_type_id = st.id
      WHERE sr.origin_city = ${originCity}
      AND sr.destination_city = ${destinationCity}
      AND sr.service_type_id = ${serviceTypeId}
    `;
    
    // Hitung total biaya untuk tiap jenis layanan
    return rates.map(rate => ({
      serviceType: {
        id: rate.service_type_id,
        name: rate.name,
        description: rate.description,
        code: rate.code || '',
        estimatedTime: rate.estimation_days ? `${rate.estimation_days} hari` : '',
        pricePerKg: Number(rate.base_price)
      },
      price: Number(rate.price_per_kg) * Number(weight),
      estimatedTime: rate.estimated_time
    }));
  } else {
    const rates = await sql`
      SELECT 
        sr.*,
        st.id as service_type_id,
        st.name,
        st.description,
        st.code,
        st.base_price,
        st.estimation_days
      FROM shipping_rates sr
      JOIN service_types st ON sr.service_type_id = st.id
      WHERE sr.origin_city = ${originCity}
      AND sr.destination_city = ${destinationCity}
    `;
    
    // Hitung total biaya untuk tiap jenis layanan
    return rates.map(rate => ({
      serviceType: {
        id: rate.service_type_id,
        name: rate.name,
        description: rate.description,
        code: rate.code || '',
        estimatedTime: rate.estimation_days ? `${rate.estimation_days} hari` : '',
        pricePerKg: Number(rate.base_price)
      },
      price: Number(rate.price_per_kg) * Number(weight),
      estimatedTime: rate.estimated_time
    }));
  }
}

/**
 * Mendapatkan semua jenis layanan
 */
export async function getServiceTypes(): Promise<ServiceType[]> {
  console.log('actions.ts: Memulai getServiceTypes');
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    console.log('actions.ts: Menjalankan SQL query untuk get service types');
    const serviceTypes = await sql`
      SELECT * FROM service_types
      ORDER BY name
    `;
    
    console.log('actions.ts: Hasil SQL query:', serviceTypes);
    
    const formattedTypes = serviceTypes.map(type => ({
      id: type.id,
      code: type.code || '',
      name: type.name,
      description: type.description,
      estimatedTime: type.estimation_days ? `${type.estimation_days} hari` : '',
      pricePerKg: Number(type.base_price),
      basePrice: Number(type.base_price),
      estimationDays: type.estimation_days
    }));
    
    console.log('actions.ts: Mengembalikan hasil yang sudah diformat:', formattedTypes);
    return formattedTypes;
  } catch (error) {
    console.error('actions.ts: Error dalam getServiceTypes:', error);
    throw error;
  }
}

/**
 * Mendapatkan semua pelanggan
 */
export async function getCustomers(page = 1, limit = 10, status?: string) {
  try {
    // Coba dengan API request terlebih dahulu
    try {
      // Buat URL dengan token sebagai parameter query
      let url = `${getBaseUrl()}/api/admin/customers?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      
      // Tambahkan token ke URL
      url = addTokenToUrl(url);
      
      console.log(`Request ke URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      // Jika response tidak OK, lempar error untuk masuk ke fallback
      throw new Error(`API request failed: ${response.statusText}`);
    } catch (apiError) {
      console.log("API request failed, menggunakan direct database access untuk customers");
      
      // Fallback: Akses database langsung
      const sql = neon(process.env.DATABASE_URL!);
      
      // Cek apakah tabel users ada dan struktur kolom
      console.log("Memeriksa struktur tabel users...");
      try {
        const tableInfo = await sql`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_name = 'users'
          ORDER BY ordinal_position;
        `;
        
        console.log("Struktur tabel users:", tableInfo);
        
        if (tableInfo.length === 0) {
          console.log("Tabel users tidak ditemukan atau kosong, menggunakan data dummy");
          // Kembalikan data dummy jika tabel tidak ada
          const dummyCustomers = [
            { id: 1, name: 'John Doe', email: 'john@example.com', phone: '081234567890', address: 'Jakarta', role: 'customer', status: 'active', created_at: new Date(), updated_at: new Date() },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '082345678901', address: 'Bandung', role: 'customer', status: 'active', created_at: new Date(), updated_at: new Date() },
            { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '083456789012', address: 'Surabaya', role: 'customer', status: 'inactive', created_at: new Date(), updated_at: new Date() },
          ];
          
          return {
            data: dummyCustomers,
            total: dummyCustomers.length,
            page,
            limit,
            note: 'Using dummy data - users table not found'
          };
        }
      } catch (err) {
        console.error("Error checking users table:", err);
      }
      
      // Hitung total untuk pagination
      console.log("Mengambil jumlah total customers...");
      try {
        // Coba query sederhana dulu untuk memeriksa akses
        const testQuery = await sql`SELECT 1 as test`;
        console.log("Test query berhasil:", testQuery);
        
        // Sekarang coba query count
        const countResult = await sql`
          SELECT COUNT(*) as total FROM users
          WHERE role = 'customer'
          ${status ? sql`AND status = ${status}` : sql``}
        `;
        
        console.log("Count result:", countResult);
        const total = Number(countResult[0]?.total || 0);
        
        // Jika tidak ada data, kembalikan dummy customers
        if (total === 0) {
          console.log("Tidak ada data customers di database, mengembalikan data dummy");
          const dummyCustomers = [
            { id: 1, name: 'John Doe', email: 'john@example.com', phone: '081234567890', address: 'Jakarta', role: 'customer', status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '082345678901', address: 'Bandung', role: 'customer', status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '083456789012', address: 'Surabaya', role: 'customer', status: 'inactive', createdAt: new Date(), updatedAt: new Date() },
          ];
          
          return {
            data: dummyCustomers,
            total: dummyCustomers.length,
            page,
            limit,
            note: 'Using dummy data - no customers in database'
          };
        }
        
        // Query dengan pagination
        const offset = (page - 1) * limit;
        
        console.log(`Mengambil data customers dengan limit ${limit} offset ${offset}...`);
        const customers = await sql`
          SELECT * FROM users
          WHERE role = 'customer'
          ${status ? sql`AND status = ${status}` : sql``}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        
        console.log(`Data customers berhasil diambil: ${customers.length} records`);
        
        // Jika query berhasil tapi data kosong, kembalikan dummy customers
        if (customers.length === 0) {
          console.log("Query berhasil tapi tidak ada data, mengembalikan data dummy");
          const dummyCustomers = [
            { id: 1, name: 'John Doe', email: 'john@example.com', phone: '081234567890', address: 'Jakarta', role: 'customer', status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '082345678901', address: 'Bandung', role: 'customer', status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '083456789012', address: 'Surabaya', role: 'customer', status: 'inactive', createdAt: new Date(), updatedAt: new Date() },
          ];
          
          return {
            data: dummyCustomers,
            total: dummyCustomers.length,
            page,
            limit,
            note: 'Using dummy data - empty query result'
          };
        }
        
        // Format data untuk sesuai dengan tipe di API
        const formattedCustomers = customers.map(c => ({
          id: c.id,
          name: c.name || '',
          email: c.email || '',
          phone: c.phone || '',
          address: c.address || '',
          role: c.role || 'customer',
          status: c.status || 'active',
          createdAt: c.created_at || new Date(),
          updatedAt: c.updated_at || new Date()
        }));
        
        return {
          data: formattedCustomers,
          total,
          page,
          limit,
          note: 'Data loaded directly from database'
        };
      } catch (dbError) {
        console.error("Database error:", dbError);
        
        // Fallback ke data dummy jika query gagal
        console.log("Query gagal, menggunakan data dummy");
        const dummyCustomers = [
          { id: 1, name: 'John Doe', email: 'john@example.com', phone: '081234567890', address: 'Jakarta', role: 'customer', status: 'active', createdAt: new Date(), updatedAt: new Date() },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '082345678901', address: 'Bandung', role: 'customer', status: 'active', createdAt: new Date(), updatedAt: new Date() },
          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '083456789012', address: 'Surabaya', role: 'customer', status: 'inactive', createdAt: new Date(), updatedAt: new Date() },
        ];
        
        return {
          data: dummyCustomers,
          total: dummyCustomers.length,
          page,
          limit,
          note: 'Using dummy data due to database error'
        };
      }
    }
  } catch (error) {
    console.error("Error in getCustomers:", error);
    // Return empty data instead of throwing error
    return {
      data: [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '081234567890', address: 'Jakarta', role: 'customer', status: 'active', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '082345678901', address: 'Bandung', role: 'customer', status: 'active', createdAt: new Date(), updatedAt: new Date() },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '083456789012', address: 'Surabaya', role: 'customer', status: 'inactive', createdAt: new Date(), updatedAt: new Date() },
      ],
      total: 3,
      page,
      limit,
      note: 'Using fallback dummy data'
    };
  }
}

// Add the missing addCustomer function
export async function addCustomer(customerData: any) {
  try {
    console.log('Adding new customer with data:', customerData);
    
    // Initial validation
    if (!customerData.name || !customerData.phone || !customerData.address) {
      throw new Error('Required fields missing');
    }
    
    // Connect to the database
    const sql = await getDb();
    
    // Insert the new customer
    const result = await sql`
      INSERT INTO customers (
        name, 
        email, 
        phone, 
        category,
        address,
        province,
        city,
        postal_code,
        notes,
        role,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${customerData.name},
        ${customerData.email || null},
        ${customerData.phone},
        ${customerData.category || 'personal'},
        ${customerData.address},
        ${customerData.province},
        ${customerData.city},
        ${customerData.postal_code},
        ${customerData.notes || null},
        ${'customer'},
        ${'active'},
        NOW(),
        NOW()
      ) RETURNING id
    `;
    
    console.log('Customer added successfully:', result);
    
    return {
      success: true,
      message: 'Customer added successfully',
      data: {
        id: result[0]?.id
      }
    };
  } catch (error: any) {
    console.error('Error adding customer:', error);
    throw new Error(`Failed to add customer: ${error.message}`);
  }
}

/**
 * Mendapatkan laporan
 */
export async function getReports(type?: string) {
  try {
    // Coba dengan API request terlebih dahulu
    try {
      // Buat URL dengan token sebagai parameter query
      let url = `${getBaseUrl()}/api/admin/reports`;
      if (type) {
        url += `?type=${type}`;
      }
      
      // Tambahkan token ke URL
      url = addTokenToUrl(url);
      
      console.log(`Request ke URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      // Jika response tidak OK, lempar error untuk masuk ke fallback
      throw new Error(`API request failed: ${response.statusText}`);
    } catch (apiError) {
      console.log("API request failed, menggunakan direct database access");
      
      // Fallback: Akses database langsung
      const sql = neon(process.env.DATABASE_URL!);
      
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
        return { 
          data: formattedShipmentsSummary,
          note: 'Data loaded directly from database' 
        };
      } else if (type === 'trend') {
        return { 
          data: formattedWeeklyTrend,
          note: 'Data loaded directly from database' 
        };
      } else {
        // Return semua data jika type tidak spesifik
        return { 
          statusSummary: formattedShipmentsSummary,
          weeklyTrend: formattedWeeklyTrend,
          note: 'Data loaded directly from database' 
        };
      }
    }
  } catch (error) {
    console.error("Error in getReports:", error);
    // Return default data instead of throwing error
    return {
      statusSummary: [],
      weeklyTrend: [],
      error: "Error fetching reports"
    };
  }
}

/**
 * Location Actions
 */

// Get all locations with pagination and optional search
export async function getLocations(page = 1, limit = 10, searchTerm = '') {
  const offset = (page - 1) * limit;
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    
    // Run count and data queries in parallel for better performance
    const [countResult, dataResult] = await Promise.all([
      // Count query with search applied
      client.query(
        `SELECT COUNT(*) FROM locations 
         WHERE name ILIKE $1 OR 
               address ILIKE $1 OR 
               city ILIKE $1 OR 
               province ILIKE $1`,
        [`%${searchTerm}%`]
      ),
      
      // Data query with pagination and search
      client.query(
        `SELECT id, name, address, city, province, postal_code as "postalCode", 
                is_active as "isActive", created_at as "createdAt", 
                updated_at as "updatedAt"
         FROM locations
         WHERE name ILIKE $1 OR 
               address ILIKE $1 OR 
               city ILIKE $1 OR 
               province ILIKE $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [`%${searchTerm}%`, limit, offset]
      )
    ]);
    
    const totalCount = parseInt(countResult.rows[0].count);
    const locations = dataResult.rows;
    
    return {
      locations,
      totalCount,
      limit,
      currentPage: page
    };
  } catch (error) {
    console.error('Error getting locations:', error);
    throw new Error('Failed to fetch locations');
  } finally {
    await client.end();
  }
}

// Get location by ID
export async function getLocationById(id: string) {
  try {
    // Initialize the SQL client
    const sql = neon(process.env.DATABASE_URL!);
    
    const query = `
      SELECT 
        id, name, address, city, province, postal_code as "postalCode",
        is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      FROM locations
      WHERE id = $1
    `;
    
    const result = await sql.query(query, [id]);
    
    if (result.length === 0) {
      return null;
    }
    
    return result[0];
  } catch (error) {
    console.error('Error fetching location by id:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch location: ${error.message}`);
    } else {
      throw new Error('Failed to fetch location: Unknown error');
    }
  }
}

// Add a new location
export async function addLocation(data: {
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  isActive: boolean;
}) {
  try {
    // Initialize the SQL client
    const sql = neon(process.env.DATABASE_URL!);
    
    const query = `
      INSERT INTO locations (
        name, address, city, province, postal_code, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      )
      RETURNING 
        id, name, address, city, province, postal_code as "postalCode",
        is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await sql.query(query, [
      data.name,
      data.address,
      data.city,
      data.province,
      data.postalCode || null,
      data.isActive
    ]);
    
    return result[0];
  } catch (error) {
    console.error('Error adding location:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to add location: ${error.message}`);
    } else {
      throw new Error('Failed to add location: Unknown error');
    }
  }
}

// Update an existing location
export async function updateLocation(data: {
  id: string;
  name?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  isActive?: boolean;
}) {
  try {
    // Initialize the SQL client
    const sql = neon(process.env.DATABASE_URL!);
    
    // First, check if the location exists
    const locationCheck = await getLocationById(data.id);
    
    if (!locationCheck) {
      throw new Error('Location not found');
    }
    
    // Build the SET part of the query based on provided data
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;
    
    if (data.name !== undefined) {
      updates.push(`name = $${paramCounter++}`);
      values.push(data.name);
    }
    
    if (data.address !== undefined) {
      updates.push(`address = $${paramCounter++}`);
      values.push(data.address);
    }
    
    if (data.city !== undefined) {
      updates.push(`city = $${paramCounter++}`);
      values.push(data.city);
    }
    
    if (data.province !== undefined) {
      updates.push(`province = $${paramCounter++}`);
      values.push(data.province);
    }
    
    if (data.postalCode !== undefined) {
      updates.push(`postal_code = $${paramCounter++}`);
      values.push(data.postalCode);
    }
    
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramCounter++}`);
      values.push(data.isActive);
    }
    
    // Always update the updated_at timestamp
    updates.push(`updated_at = NOW()`);
    
    if (updates.length === 0) {
      return locationCheck; // No updates to make
    }
    
    // Add the ID as the last parameter
    values.push(data.id);
    
    const query = `
      UPDATE locations
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING 
        id, name, address, city, province, postal_code as "postalCode",
        is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await sql.query(query, values);
    
    return result[0];
  } catch (error) {
    console.error('Error updating location:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to update location: ${error.message}`);
    } else {
      throw new Error('Failed to update location: Unknown error');
    }
  }
}

// Delete a location
export async function deleteLocation(id: string) {
  try {
    // Initialize the SQL client
    const sql = neon(process.env.DATABASE_URL!);
    
    // First, check if the location exists
    const locationCheck = await getLocationById(id);
    
    if (!locationCheck) {
      throw new Error('Location not found');
    }
    
    // Delete the location
    const query = `
      DELETE FROM locations
      WHERE id = $1
      RETURNING id
    `;
    
    await sql.query(query, [id]);
    
    return { success: true, message: 'Location deleted successfully' };
  } catch (error) {
    console.error('Error deleting location:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to delete location: ${error.message}`);
    } else {
      throw new Error('Failed to delete location: Unknown error');
    }
  }
}

/**
 * Autentikasi user
 */
export async function authenticateUser(email: string, password: string) {
  console.log("Mencoba autentikasi untuk:", email);
  
  try {
    // Log untuk debugging
    console.log("DATABASE_URL tersedia:", !!process.env.DATABASE_URL);
    console.log("DATABASE_URL dimulai dengan:", process.env.DATABASE_URL?.substring(0, 15) + "...");
    
    const sql = neon(process.env.DATABASE_URL!);
    
    // Tes koneksi database sederhana
    console.log("Melakukan tes koneksi database...");
    const testConnection = await sql`SELECT 1 as test`;
    console.log("Koneksi database berhasil:", testConnection);
    
    // Ambil user berdasarkan email
    console.log("Mencari user dengan email:", email);
    const users = await sql`
      SELECT * FROM users
      WHERE email = ${email}
    `;
    
    console.log("Jumlah user ditemukan:", users.length);
    
    if (users.length === 0) {
      console.log("User tidak ditemukan");
      return { success: false, message: "Email atau password salah" };
    }
    
    const user = users[0];
    console.log("User ditemukan dengan role:", user.role);
    
    // Verifikasi password (asumsi kolom password_hash dan password_salt ada di database)
    // Jika masih menggunakan password biasa, gunakan kondisi ini sementara
    let passwordValid = false;
    
    if (user.password_hash && user.password_salt) {
      // Gunakan verifikasi dengan hash jika tersedia
      console.log("Memverifikasi password dengan hash dan salt");
      passwordValid = verifyPassword(password, user.password_hash, user.password_salt);
    } else {
      // Fallback ke password biasa untuk kompatibilitas
      console.log("Memverifikasi password langsung (tanpa hash)");
      passwordValid = user.password === password;
    }
    
    console.log("Hasil verifikasi password:", passwordValid);
    
    if (!passwordValid) {
      console.log("Password tidak valid");
      return { success: false, message: "Email atau password salah" };
    }
    
    console.log("Login berhasil untuk user:", user.email);
    
    // Jangan mengembalikan password/hash ke client
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      role: user.role
    };
  } catch (error) {
    console.error("Error saat autentikasi:", error);
    return { 
      success: false, 
      message: "Terjadi kesalahan saat login: " + (error instanceof Error ? error.message : String(error))
    };
  }
}

/**
 * Fungsi untuk mendapatkan data dashboard Admin
 */
export async function getDashboardData() {
  const sql = neon(process.env.DATABASE_URL!);
  
  const result: any = {
    recentShipments: [],
    shipmentsByStatus: [],
    totalRevenue: 0,
    userCount: 0,
    locationCount: 0,
    driverCount: 0,
    activeDrivers: [],
    weeklyShipments: []
  };
  
  try {
    // Use Promise.allSettled to run all queries concurrently
    const [
      recentShipmentsResult,
      shipmentsByStatusResult,
      totalRevenueResult,
      userCountResult,
      locationCountResult,
      driverCountResult,
      activeDriversResult,
      weeklyShipmentsResult
    ] = await Promise.allSettled([
      // Get recent shipments
      sql`
        SELECT 
          s.id, 
          s.tracking_number, 
          s.origin_name, 
          s.destination_name, 
          s.status, 
          s.created_at, 
          s.updated_at,
          c.name as customer_name
        FROM shipments s
        LEFT JOIN customers c ON s.customer_id = c.id
        ORDER BY s.created_at DESC 
        LIMIT 5
      `,
      
      // Get shipment counts by status
      sql`
        SELECT status, COUNT(*) as count
        FROM shipments
        GROUP BY status
        ORDER BY count DESC
      `,
      
      // Get total revenue
      sql`
        SELECT COALESCE(SUM(price), 0) as total
        FROM shipments
        WHERE status = 'delivered'
      `,
      
      // Get user count
      sql`SELECT COUNT(*) as count FROM customers`,
      
      // Get location count
      sql`SELECT COUNT(*) as count FROM locations`,
      
      // Get driver count
      sql`SELECT COUNT(*) as count FROM drivers`,
      
      // Get active drivers
      sql`
        SELECT 
          d.id, 
          d.name, 
          d.license_number,
          l.name as location_name,
          (
            SELECT COUNT(*) 
            FROM shipments s 
            WHERE s.driver_id = d.id AND s.status IN ('picked', 'in_transit')
          ) as active_shipments
        FROM drivers d
        LEFT JOIN locations l ON d.location_id = l.id
        WHERE d.is_active = true
        ORDER BY active_shipments DESC, d.name
        LIMIT 10
      `,
      
      // Get weekly shipments for last 8 weeks
      sql`
        SELECT 
          date_trunc('week', created_at) as week,
          COUNT(*) as count
        FROM 
          shipments
        WHERE 
          created_at >= NOW() - INTERVAL '8 weeks'
        GROUP BY 
          date_trunc('week', created_at)
        ORDER BY 
          week ASC
      `
    ]);
    
    // Process results and handle potential errors for each query
    if (recentShipmentsResult.status === 'fulfilled') {
      result.recentShipments = recentShipmentsResult.value;
    }
    
    if (shipmentsByStatusResult.status === 'fulfilled') {
      result.shipmentsByStatus = shipmentsByStatusResult.value;
    }
    
    if (totalRevenueResult.status === 'fulfilled') {
      result.totalRevenue = totalRevenueResult.value[0]?.total || 0;
    }
    
    if (userCountResult.status === 'fulfilled') {
      result.userCount = parseInt(userCountResult.value[0]?.count, 10) || 0;
    }
    
    if (locationCountResult.status === 'fulfilled') {
      result.locationCount = parseInt(locationCountResult.value[0]?.count, 10) || 0;
    }
    
    if (driverCountResult.status === 'fulfilled') {
      result.driverCount = parseInt(driverCountResult.value[0]?.count, 10) || 0;
    }
    
    if (activeDriversResult.status === 'fulfilled') {
      result.activeDrivers = activeDriversResult.value;
    }
    
    if (weeklyShipmentsResult.status === 'fulfilled') {
      result.weeklyShipments = weeklyShipmentsResult.value.map((item: any) => ({
        week: new Date(item.week).toISOString().split('T')[0],
        count: parseInt(item.count, 10)
      }));
    }
    
    return result;
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    // Return partial data instead of throwing to allow dashboard to display what was successfully retrieved
    return result;
  }
}

/**
 * Membuat pengiriman baru
 */
export async function createShipment(data: {
  serviceTypeId: number;
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  originCity: string;
  destinationCity: string;
  weight: number;
  price: number;
  createdBy?: number;
}) {
  const sql = neon(process.env.DATABASE_URL!);
  
  // Generate nomor resi: WZ-YYYYMMDD-XXXX (X = random)
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
  const receiptNumber = `WZ-${dateStr}-${randomStr}`;
  
  // Perkiraan tanggal pengiriman (estimasi 3 hari dari sekarang)
  const estDeliveryDate = new Date();
  estDeliveryDate.setDate(today.getDate() + 3);
  
  // Insert ke database
  const result = await sql`
    INSERT INTO shipments (
      receipt_number, service_type_id, 
      sender_name, sender_address, sender_phone,
      recipient_name, recipient_address, recipient_phone,
      origin_city, destination_city, weight, price,
      status, estimated_delivery_date, created_by
    ) VALUES (
      ${receiptNumber}, ${data.serviceTypeId},
      ${data.senderName}, ${data.senderAddress}, ${data.senderPhone},
      ${data.recipientName}, ${data.recipientAddress}, ${data.recipientPhone},
      ${data.originCity}, ${data.destinationCity}, ${data.weight}, ${data.price},
      'pending', ${estDeliveryDate.toISOString()}, ${data.createdBy || null}
    ) RETURNING id
  `;
  
  const shipmentId = result[0].id;
  
  // Tambahkan entri pertama di tracking history
  await sql`
    INSERT INTO tracking_history (
      shipment_id, status, description, location, created_by
    ) VALUES (
      ${shipmentId}, 'pending', 'Pengiriman dibuat dan menunggu pickup', ${data.originCity}, ${data.createdBy || null}
    )
  `;
  
  return { 
    success: true, 
    receiptNumber, 
    id: shipmentId 
  };
}

/**
 * Update status pengiriman
 */
export async function updateShipmentStatus(
  shipmentId: number, 
  status: string,
  location: string,
  description: string,
  updatedBy?: number
) {
  const sql = neon(process.env.DATABASE_URL!);
  
  // Update status di tabel shipments
  await sql`
    UPDATE shipments
    SET status = ${status}
    WHERE id = ${shipmentId}
  `;
  
  // Tambahkan entri baru di tracking history
  await sql`
    INSERT INTO tracking_history (
      shipment_id, status, description, location, created_by
    ) VALUES (
      ${shipmentId}, ${status}, ${description}, ${location}, ${updatedBy || null}
    )
  `;
  
  return { success: true };
}

/**
 * Mendapatkan data user dari token
 */
export async function getUserByToken(token: string) {
  try {
    // Decode token untuk mendapatkan ID user
    const decoded = atob(token);
    const [userId] = decoded.split(':');
    
    if (!userId) {
      return { success: false, message: 'Token tidak valid' };
    }
    
    const sql = neon(process.env.DATABASE_URL!);
    
    // Ambil data user dari database
    const users = await sql`
      SELECT id, name, email, role, phone, created_at, updated_at
      FROM users
      WHERE id = ${userId}
    `;
    
    if (users.length === 0) {
      return { success: false, message: 'User tidak ditemukan' };
    }
    
    const user = users[0];
    
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    };
  } catch (error) {
    console.error('Error getting user by token:', error);
    return { success: false, message: 'Gagal memverifikasi token' };
  }
}

/**
 * Mengubah password user
 */
export async function changeUserPassword(userId: string, newPassword: string) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // Generate hash dan salt untuk password baru
    const { hash, salt } = hashPassword(newPassword);
    
    // Update password di database
    await sql`
      UPDATE users 
      SET password_hash = ${hash}, 
          password_salt = ${salt},
          updated_at = NOW()
      WHERE id = ${userId}
    `;
    
    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, message: 'Gagal mengubah password' };
  }
}

/**
 * Migrasi password dari plain text ke hash
 * Fungsi ini hanya perlu dijalankan sekali saat migrasi
 */
export async function migrateUserPasswords() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // Ambil semua user yang belum memiliki password_hash
    const users = await sql`
      SELECT id, password
      FROM users
      WHERE (password_hash IS NULL OR password_hash = '') 
      AND password IS NOT NULL
    `;
    
    let migratedCount = 0;
    
    // Update setiap user
    for (const user of users) {
      if (user.password) {
        const { hash, salt } = hashPassword(user.password);
        
        await sql`
          UPDATE users
          SET password_hash = ${hash},
              password_salt = ${salt}
          WHERE id = ${user.id}
        `;
        
        migratedCount++;
      }
    }
    
    return { success: true, migratedCount };
  } catch (error) {
    console.error('Error migrating passwords:', error);
    return { success: false, message: 'Gagal migrasi password' };
  }
}

/**
 * Menambahkan jenis layanan baru
 */
export async function createServiceType(data: {
  code: string;
  name: string;
  description: string;
  estimationDays: number;
  basePrice: number;
}) {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    const result = await sql`
      INSERT INTO service_types (code, name, description, estimation_days, base_price)
      VALUES (
        ${data.code},
        ${data.name}, 
        ${data.description}, 
        ${data.estimationDays}, 
        ${data.basePrice}
      )
      RETURNING id
    `;
    
    return { 
      success: true, 
      id: result[0].id 
    };
  } catch (error) {
    console.error("Error creating service type:", error);
    return { 
      success: false, 
      error: "Gagal menambahkan jenis layanan" 
    };
  }
}

/**
 * Menghapus jenis layanan
 */
export async function deleteServiceType(id: string) {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    await sql`DELETE FROM service_types WHERE id = ${id}`;
    return { success: true };
  } catch (error) {
    console.error("Error deleting service type:", error);
    return { 
      success: false, 
      error: "Gagal menghapus jenis layanan" 
    };
  }
}

// Driver Actions
export async function getDrivers({ 
  page = 1, 
  limit = 10, 
  search = '' 
}: { 
  page?: number; 
  limit?: number; 
  search?: string;
}) {
  try {
    console.log('getDrivers: Initializing with page =', page, 'limit =', limit, 'search =', search);
    const sql = neon(process.env.DATABASE_URL!);
    
    // Log database URL for debugging (partial, for security)
    const dbUrlStart = process.env.DATABASE_URL?.substring(0, 20) || 'not-set';
    console.log('getDrivers: Using database URL starting with:', dbUrlStart + '...');
    
    const offset = (page - 1) * limit;
    
    // Check if drivers table exists and create it if not
    console.log('getDrivers: Creating drivers table if not exists');
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS drivers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          email VARCHAR(255),
          license_number VARCHAR(100) NOT NULL,
          vehicle_type VARCHAR(100) NOT NULL,
          location_id VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('getDrivers: Table creation check complete');
    } catch (createError) {
      console.error('getDrivers: Error creating table:', createError);
      throw new Error('Failed to create drivers table');
    }
    
    // Query to get total count
    console.log('getDrivers: Fetching total count');
    let countResult;
    try {
      if (search) {
        countResult = await sql`
          SELECT COUNT(*) FROM drivers
          WHERE 
            name ILIKE ${`%${search}%`} OR 
            phone ILIKE ${`%${search}%`} OR 
            email ILIKE ${`%${search}%`} OR 
            license_number ILIKE ${`%${search}%`}
        `;
      } else {
        countResult = await sql`SELECT COUNT(*) FROM drivers`;
      }
      console.log('getDrivers: Count result:', countResult);
    } catch (countError) {
      console.error('getDrivers: Error counting drivers:', countError);
      throw new Error('Failed to count drivers');
    }
    
    // Query to get driver data with location names
    console.log('getDrivers: Fetching driver data');
    let driversResult;
    try {
      if (search) {
        driversResult = await sql`
          SELECT d.*, l.name as location_name 
          FROM drivers d
          LEFT JOIN locations l ON d.location_id = l.id
          WHERE 
            d.name ILIKE ${`%${search}%`} OR 
            d.phone ILIKE ${`%${search}%`} OR 
            d.email ILIKE ${`%${search}%`} OR 
            d.license_number ILIKE ${`%${search}%`}
          ORDER BY d.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else {
        driversResult = await sql`
          SELECT d.*, l.name as location_name 
          FROM drivers d
          LEFT JOIN locations l ON d.location_id = l.id
          ORDER BY d.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      }
      console.log(`getDrivers: Found ${driversResult.length} drivers`);
    } catch (fetchError) {
      console.error('getDrivers: Error fetching drivers:', fetchError);
      throw new Error('Failed to fetch drivers data');
    }
    
    const total = parseInt(countResult[0]?.count || '0');
    console.log('getDrivers: Total drivers:', total);
    
    return {
      data: driversResult,
      total,
      limit,
      page
    };
  } catch (error) {
    console.error('Error in getDrivers:', error);
    throw new Error('Failed to fetch drivers: ' + (error instanceof Error ? error.message : String(error)));
  }
}

export async function getDriverById(id: string) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`
      SELECT d.*, l.name as location_name 
      FROM drivers d
      LEFT JOIN locations l ON d.location_id = l.id
      WHERE d.id = ${id}
    `;
    
    if (result.length === 0) {
      return null;
    }
    
    return result[0];
  } catch (error) {
    console.error('Error fetching driver:', error);
    throw new Error('Failed to fetch driver');
  }
}

export async function addDriver({
  name,
  phone,
  email,
  license_number,
  vehicle_type,
  location_id
}: {
  name: string;
  phone: string;
  email: string;
  license_number: string;
  vehicle_type: string;
  location_id: string;
}) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`
      INSERT INTO drivers (
        name, 
        phone, 
        email, 
        license_number, 
        vehicle_type, 
        location_id
      ) VALUES (
        ${name}, 
        ${phone}, 
        ${email}, 
        ${license_number}, 
        ${vehicle_type}, 
        ${location_id}
      )
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error adding driver:', error);
    throw new Error('Failed to add driver');
  }
}

export async function updateDriver({
  id,
  name,
  phone,
  email,
  license_number,
  vehicle_type,
  location_id
}: {
  id: string;
  name: string;
  phone: string;
  email: string;
  license_number: string;
  vehicle_type: string;
  location_id: string;
}) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`
      UPDATE drivers
      SET 
        name = ${name},
        phone = ${phone},
        email = ${email},
        license_number = ${license_number},
        vehicle_type = ${vehicle_type},
        location_id = ${location_id},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      throw new Error('Driver not found');
    }
    
    return result[0];
  } catch (error) {
    console.error('Error updating driver:', error);
    throw new Error('Failed to update driver');
  }
}

export async function deleteDriver(id: string) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`
      DELETE FROM drivers
      WHERE id = ${id}
      RETURNING id
    `;
    
    if (result.length === 0) {
      throw new Error('Driver not found');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting driver:', error);
    throw new Error('Failed to delete driver');
  }
}