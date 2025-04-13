"use server";
import { neon } from "@neondatabase/serverless";
import { Shipment, ServiceType } from "@/types";
import * as crypto from 'crypto';

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
    // Coba dengan API request terlebih dahulu
    try {
      // Buat URL dengan token sebagai parameter query
      let url = `${getBaseUrl()}/api/admin/shipments?page=${page}&limit=${limit}`;
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
      console.log("API request failed, menggunakan direct database access");
      
      // Fallback: Akses database langsung
      const sql = neon(process.env.DATABASE_URL!);
      
      // Hitung total untuk pagination
      const countResult = await sql`
        SELECT COUNT(*) as total FROM shipments
        ${status ? sql`WHERE status = ${status}` : sql``}
      `;
      
      const total = Number(countResult[0]?.total || 0);
      
      // Query dengan pagination
      const offset = (page - 1) * limit;
      
      const shipments = await sql`
        SELECT 
          s.*,
          st.name as service_type_name,
          st.code as service_type_code,
          st.description as service_type_description
        FROM shipments s
        LEFT JOIN service_types st ON s.service_type_id = st.id
        ${status ? sql`WHERE s.status = ${status}` : sql``}
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      // Format data untuk sesuai dengan tipe di API
      const formattedShipments = shipments.map(s => ({
        id: s.id,
        receiptNumber: s.receipt_number,
        receipt_number: s.receipt_number,
        senderId: s.sender_id,
        recipientId: s.recipient_id,
        serviceTypeId: s.service_type_id,
        weight: Number(s.weight),
        price: Number(s.price),
        status: s.status,
        description: s.description,
        items: [],
        pickupDate: s.pickup_date,
        estimatedDeliveryDate: s.estimated_delivery_date,
        actualDeliveryDate: s.actual_delivery_date,
        createdAt: s.created_at,
        created_at: s.created_at,
        updatedAt: s.updated_at,
        serviceType: {
          id: s.service_type_id,
          name: s.service_type_name,
          code: s.service_type_code || '',
          description: s.service_type_description || '',
          estimatedTime: '',
          pricePerKg: 0
        },
        sender: {
          name: s.sender_name,
        },
        sender_name: s.sender_name,
        recipient: {
          name: s.recipient_name,
        },
        recipient_name: s.recipient_name,
        destination_city: s.destination_city || s.recipient_address,
      }));
      
      return {
        data: formattedShipments,
        total,
        page,
        limit,
        note: 'Data loaded directly from database'
      };
    }
  } catch (error) {
    console.error("Error fetching shipments:", error);
    // Return empty data instead of throwing error
    return {
      data: [],
      total: 0,
      page,
      limit,
      error: "Error fetching shipments"
    };
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
 * Mendapatkan data lokasi/cabang
 */
export async function getLocations(type?: string) {
  try {
    // Coba dengan API request terlebih dahulu
    try {
      // Buat URL dengan token sebagai parameter query
      let url = `${getBaseUrl()}/api/admin/locations`;
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
      
      // Cek apakah tabel locations ada
      const tablesResult = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'locations'
        ) as exists
      `;
      
      const locationsExist = tablesResult[0]?.exists;
      
      // Jika tabel belum ada, berikan data dummy
      if (!locationsExist) {
        const dummyLocations = [
          { id: 1, name: 'Jakarta Pusat', address: 'Jl. Merdeka No. 1, Jakarta Pusat', type: 'hub', capacity: 100, status: 'active' },
          { id: 2, name: 'Bandung', address: 'Jl. Asia Afrika No. 15, Bandung', type: 'branch', capacity: 50, status: 'active' },
          { id: 3, name: 'Surabaya', address: 'Jl. Panglima Sudirman No. 10, Surabaya', type: 'hub', capacity: 80, status: 'active' },
          { id: 4, name: 'Medan', address: 'Jl. Diponegoro No. 5, Medan', type: 'branch', capacity: 40, status: 'active' },
          { id: 5, name: 'Makassar', address: 'Jl. Urip Sumoharjo No. 7, Makassar', type: 'branch', capacity: 30, status: 'inactive' },
        ];

        const filteredLocations = type 
          ? dummyLocations.filter(loc => loc.type === type) 
          : dummyLocations;
          
        return { 
          locations: filteredLocations,
          total: filteredLocations.length,
          note: 'Using dummy data as locations table does not exist'
        };
      }
      
      // Query database jika tabel ada
      let query;
      if (type) {
        query = await sql`SELECT * FROM locations WHERE type = ${type}`;
      } else {
        query = await sql`SELECT * FROM locations`;
      }
      
      return { 
        locations: query, 
        total: query.length,
        note: 'Data loaded directly from database'
      };
    }
  } catch (error) {
    console.error("Error in getLocations:", error);
    // Return empty data instead of throwing error
    const dummyLocations = [
      { id: 1, name: 'Jakarta Pusat', address: 'Jl. Merdeka No. 1, Jakarta Pusat', type: 'hub', capacity: 100, status: 'active' },
      { id: 2, name: 'Bandung', address: 'Jl. Asia Afrika No. 15, Bandung', type: 'branch', capacity: 50, status: 'active' },
      { id: 3, name: 'Surabaya', address: 'Jl. Panglima Sudirman No. 10, Surabaya', type: 'hub', capacity: 80, status: 'active' },
    ];
    
    return { 
      locations: dummyLocations, 
      total: dummyLocations.length,
      error: 'Error fetching locations, returning dummy data'
    };
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
 * Mendapatkan data dashboard untuk admin/staff
 */
export async function getDashboardData() {
  try {
    console.log('actions.ts: Memulai getDashboardData');
    
    // Periksa DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error('actions.ts: DATABASE_URL tidak ditemukan');
      return {
        shipmentsByStatus: [],
        recentShipments: [],
        revenue: 0,
        userCount: 0,
        locationCount: 0,
        error: 'Konfigurasi database tidak lengkap'
      };
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Gunakan pendekatan yang lebih langsung untuk memeriksa tabel
    try {
      console.log('actions.ts: Memeriksa keberadaan tabel dengan metode alternatif');
      
      // Ambil semua tabel di skema public
      const allTablesResult = await sql.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      // Transformasi ke array nama tabel
      const allTables = allTablesResult.map((row: any) => row.table_name);
      console.log('actions.ts: Semua tabel yang ditemukan:', allTables);
      
      // Periksa tabel yang diperlukan (termasuk customers dan reports)
      const requiredTables = ['shipments', 'service_types', 'users', 'locations', 'customers', 'reports'];
      const missingTables = requiredTables.filter(table => !allTables.includes(table));
      
      if (missingTables.length > 0) {
        console.log('actions.ts: Tabel tidak ditemukan:', missingTables);
        // Data dummy untuk dashboard
        return {
          shipmentsByStatus: [
            { status: 'pending', count: 15 },
            { status: 'in_transit', count: 42 },
            { status: 'delivered', count: 87 },
            { status: 'cancelled', count: 5 }
          ],
          recentShipments: Array(10).fill(0).map((_, i) => ({
            id: i + 1,
            receipt_number: `WZ-${String(2023000 + i + 1).padStart(8, '0')}`,
            sender_name: `Pengirim ${i + 1}`,
            recipient_name: `Penerima ${i + 1}`,
            origin_city: 'Jakarta',
            destination_city: ['Surabaya', 'Bandung', 'Semarang', 'Yogyakarta', 'Denpasar'][i % 5],
            weight: Math.floor(Math.random() * 10) + 1,
            price: Math.floor(Math.random() * 100000) + 50000,
            status: ['pending', 'in_transit', 'delivered', 'delivered', 'cancelled'][i % 5],
            created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
            service_type: ['Reguler', 'Express', 'Same Day', 'Ekonomi'][i % 4]
          })),
          revenue: 5245000,
          userCount: 12,
          locationCount: 8,
          error: `Tabel tidak lengkap. Klik tombol "Perbaiki Struktur Tabel Database" untuk memperbaiki.`,
          note: `Tabel yang tidak ditemukan: ${missingTables.join(', ')}`
        };
      }
      
      // Periksa kolom penting di tabel users
      let missingUserColumns = [];
      try {
        console.log('actions.ts: Memeriksa kolom tabel users dengan query langsung');
        const userColumnsResult = await sql.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'users'
        `);
        console.log('actions.ts: Hasil query kolom users:', userColumnsResult);
        
        const existingUserColumns = userColumnsResult.map((row: any) => row.column_name);
        const requiredUserColumns = ['password_hash', 'password_salt', 'status', 'updated_at'];
        missingUserColumns = requiredUserColumns.filter(col => !existingUserColumns.includes(col));

        if (missingUserColumns.length > 0) {
          console.warn('actions.ts: Kolom tabel users tidak lengkap:', missingUserColumns);
          
          // Memeriksa kolom-kolom secara individual
          console.log('actions.ts: Memeriksa kolom-kolom secara individual:');
          for (const col of requiredUserColumns) {
            try {
              const checkResult = await sql.query(`
                SELECT EXISTS (
                  SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'users' 
                  AND column_name = '${col}'
                ) as exists
              `);
              console.log(`actions.ts: Kolom ${col} ada:`, checkResult[0]?.exists);
            } catch (e) {
              console.error(`actions.ts: Error saat memeriksa kolom ${col}:`, e);
            }
          }
          
          // Kembalikan data dummy dengan pesan spesifik
          return {
            shipmentsByStatus: [
              { status: 'pending', count: 10 },
              { status: 'in_transit', count: 20 },
              { status: 'delivered', count: 30 }
            ],
            recentShipments: [],
            revenue: 0,
            userCount: 0,
            locationCount: 0,
            error: `Kolom tabel users tidak lengkap. Klik tombol "Perbaiki Struktur Tabel Database" untuk memperbaiki.`,
            note: `Kolom yang tidak ditemukan: ${missingUserColumns.join(', ')}. Tolong periksa console untuk informasi debug lebih lanjut.`,
            missing_columns: missingUserColumns
          };
        }
        console.log('actions.ts: Kolom tabel users sudah lengkap.');
      } catch (checkError: any) {
         console.error('actions.ts: Gagal memeriksa kolom tabel users:', checkError);
         // Kembalikan data dummy jika pemeriksaan gagal
         return {
            shipmentsByStatus: [
              { status: 'pending', count: 5 },
              { status: 'in_transit', count: 15 },
              { status: 'delivered', count: 25 }
            ],
            recentShipments: [],
            revenue: 0,
            userCount: 0,
            locationCount: 0,
            error: `Gagal memeriksa struktur tabel. Klik tombol "Perbaiki Struktur Tabel Database" untuk memperbaiki.`,
            note: `Error: ${checkError.message}. Silakan periksa logs untuk informasi lebih lanjut.`,
            error_details: checkError instanceof Error ? checkError.message : String(checkError)
          };
      }

      // Verifikasi data di tabel (opsional, bisa dihapus jika tidak perlu)
      try {
        // Coba query sederhana untuk setiap tabel
        const testQuery1 = await sql`SELECT COUNT(*) FROM shipments`;
        const testQuery2 = await sql`SELECT COUNT(*) FROM service_types`;
        console.log('actions.ts: Verifikasi tabel shipments:', testQuery1, 'service_types:', testQuery2);
      } catch (verifyError) {
        console.error('actions.ts: Error saat verifikasi tabel:', verifyError);
        // Tetap lanjutkan meskipun verifikasi gagal
      }
      
      // Tabel ada, ambil data dari database
      console.log('actions.ts: Semua tabel ditemukan, mengambil data dari database');
      
      // Jumlah pengiriman berdasarkan status
      let shipmentsByStatus = [];
      try {
        shipmentsByStatus = await sql`
          SELECT status, COUNT(*) as count
          FROM shipments
          GROUP BY status
        `;
        console.log('actions.ts: Hasil query shipmentsByStatus:', shipmentsByStatus);
      } catch (err) {
        console.error('actions.ts: Error query shipmentsByStatus:', err);
        shipmentsByStatus = [
          { status: 'pending', count: 0 },
          { status: 'in_transit', count: 0 },
          { status: 'delivered', count: 0 }
        ];
      }
      
      // Pengiriman terbaru
      let recentShipments = [];
      try {
        recentShipments = await sql`
          SELECT s.*, st.name as service_type
          FROM shipments s
          LEFT JOIN service_types st ON s.service_type_id = st.id
          ORDER BY s.created_at DESC
          LIMIT 10
        `;
        console.log('actions.ts: Jumlah recentShipments:', recentShipments.length);
      } catch (err) {
        console.error('actions.ts: Error query recentShipments:', err);
        // Fallback ke array kosong yang sudah didefinisikan
      }
      
      // Total pendapatan
      let revenue = 0;
      try {
        const revenueResult = await sql`
          SELECT COALESCE(SUM(price), 0) as total
          FROM shipments
          WHERE status != 'cancelled'
        `;
        revenue = Number(revenueResult[0]?.total || 0);
        console.log('actions.ts: Revenue result:', revenue);
      } catch (err) {
        console.error('actions.ts: Error query revenue:', err);
        // Fallback ke 0 yang sudah didefinisikan
      }
      
      // Jumlah pengguna
      let userCount = 0;
      try {
        const userCountResult = await sql`SELECT COUNT(*) as total FROM users`;
        userCount = Number(userCountResult[0]?.total || 0);
        console.log('actions.ts: User count:', userCount);
      } catch (err) {
        console.error('actions.ts: Error query userCount:', err);
        // Fallback ke 0 yang sudah didefinisikan
      }
      
      // Jumlah lokasi
      let locationCount = 0;
      try {
        const locationCountResult = await sql`SELECT COUNT(*) as total FROM locations`;
        locationCount = Number(locationCountResult[0]?.total || 0);
        console.log('actions.ts: Location count:', locationCount);
      } catch (err) {
        console.error('actions.ts: Error query locationCount:', err);
        // Fallback ke 0 yang sudah didefinisikan
      }
      
      const formattedShipmentsByStatus = shipmentsByStatus.map((item: any) => ({
        status: item.status,
        count: Number(item.count)
      }));
      
      const dashboardData = {
        shipmentsByStatus: formattedShipmentsByStatus.length > 0 ? formattedShipmentsByStatus : [
          { status: 'pending', count: 0 },
          { status: 'in_transit', count: 0 },
          { status: 'delivered', count: 0 }
        ],
        recentShipments,
        revenue,
        userCount,
        locationCount,
        timestamp: new Date().toISOString(), // Tambahkan timestamp untuk menghindari cache
        dataSource: 'database'
      };
      
      console.log('actions.ts: Mengembalikan data dashboard:', dashboardData);
      return dashboardData;
    } catch (error) {
      console.error('actions.ts: Error saat memeriksa tabel:', error);
      throw error;
    }
  } catch (error) {
    console.error('actions.ts: Error fetching dashboard data:', error);
    
    // Data dummy untuk fallback
    return {
      shipmentsByStatus: [
        { status: 'pending', count: 15 },
        { status: 'in_transit', count: 42 },
        { status: 'delivered', count: 87 },
        { status: 'cancelled', count: 5 }
      ],
      recentShipments: Array(10).fill(0).map((_, i) => ({
        id: i + 1,
        receipt_number: `WZ-${String(2023000 + i + 1).padStart(8, '0')}`,
        sender_name: `Pengirim ${i + 1}`,
        recipient_name: `Penerima ${i + 1}`,
        origin_city: 'Jakarta',
        destination_city: ['Surabaya', 'Bandung', 'Semarang', 'Yogyakarta', 'Denpasar'][i % 5],
        weight: Math.floor(Math.random() * 10) + 1,
        price: Math.floor(Math.random() * 100000) + 50000,
        status: ['pending', 'in_transit', 'delivered', 'delivered', 'cancelled'][i % 5],
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        service_type: ['Reguler', 'Express', 'Same Day', 'Ekonomi'][i % 4]
      })),
      revenue: 5245000,
      userCount: 12,
      locationCount: 8,
      error: 'Using fallback data due to error',
      details: error instanceof Error ? error.message : String(error)
    };
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