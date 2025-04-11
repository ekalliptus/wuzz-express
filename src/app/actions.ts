"use server";
import { neon } from "@neondatabase/serverless";
import { Shipment, ServiceType } from "@/types";
import * as crypto from 'crypto';

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
 * Mendapatkan semua data pengiriman
 */
export async function getShipments(page = 1, limit = 10, status?: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const offset = (page - 1) * limit;
  
  try {
    let shipments;
    let countResult;
    
    if (status) {
      // Gunakan parameter binding yang benar
      shipments = await sql`
        SELECT s.*, st.name as service_type_name 
        FROM shipments s
        JOIN service_types st ON s.service_type_id = st.id
        WHERE s.status = ${status}
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      countResult = await sql`
        SELECT COUNT(*) as total 
        FROM shipments 
        WHERE status = ${status}
      `;
    } else {
      shipments = await sql`
        SELECT s.*, st.name as service_type_name 
        FROM shipments s
        JOIN service_types st ON s.service_type_id = st.id
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      countResult = await sql`
        SELECT COUNT(*) as total FROM shipments
      `;
    }
    
    return {
      data: shipments,
      total: Number(countResult[0].total),
      page,
      limit
    };
  } catch (error) {
    console.error("Error fetching shipments:", error);
    throw new Error("Gagal mengambil data pengiriman");
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
  const sql = neon(process.env.DATABASE_URL!);
  
  const serviceTypes = await sql`
    SELECT * FROM service_types
    ORDER BY name
  `;
  
  return serviceTypes.map(type => ({
    id: type.id,
    code: type.code || '',
    name: type.name,
    description: type.description,
    estimatedTime: type.estimation_days ? `${type.estimation_days} hari` : '',
    pricePerKg: Number(type.base_price),
    basePrice: Number(type.base_price),
    estimationDays: type.estimation_days
  }));
}

/**
 * Mendapatkan data lokasi/cabang
 */
export async function getLocations() {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    const locations = await sql`
      SELECT * FROM locations
      ORDER BY province, city, name
    `;
    
    // Transformasi data sesuai dengan struktur yang diharapkan oleh komponen
    const formattedLocations = locations.map(loc => ({
      id: loc.id || '',
      name: loc.name || '',
      address: loc.address || '',
      city: loc.city || '',
      province: loc.province || '',
      phone: loc.phone || '',
      email: loc.email || '',
      maps_url: loc.maps_url || undefined
    }));
    
    return { locations: formattedLocations };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch locations data.');
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
  const sql = neon(process.env.DATABASE_URL!);
  
  // Jumlah pengiriman berdasarkan status
  const shipmentsByStatus = await sql`
    SELECT status, COUNT(*) as count
    FROM shipments
    GROUP BY status
  `;
  
  // Pengiriman terbaru
  const recentShipments = await sql`
    SELECT s.*, st.name as service_type
    FROM shipments s
    JOIN service_types st ON s.service_type_id = st.id
    ORDER BY s.created_at DESC
    LIMIT 10
  `;
  
  // Total pendapatan
  const revenue = await sql`
    SELECT SUM(price) as total
    FROM shipments
    WHERE status != 'cancelled'
  `;
  
  return {
    shipmentsByStatus,
    recentShipments,
    revenue: revenue[0]?.total || 0
  };
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