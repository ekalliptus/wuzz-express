// db.ts - File konfigurasi database
import { Pool } from 'pg';

// Buat koneksi pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? 
    { rejectUnauthorized: false } 
    : false,
});

// Wrapper untuk query database dengan error handling
export const query = async (text: string, params?: any[]) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query', error);
    throw error;
  }
};

const db = {
  query
};

export default db; 