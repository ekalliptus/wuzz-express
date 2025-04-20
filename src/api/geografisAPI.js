/**
 * API client untuk mengakses data geografis dari API endpoints
 */

/**
 * Mendapatkan daftar semua provinsi
 * @returns {Promise<Array>} Promise yang berisi array objek provinsi
 */
export async function fetchProvinces() {
  try {
    const response = await fetch('/api/geografis/provinces');
    const data = await response.json();
    
    if (!data.success) {
      console.error('Error fetching provinces:', data.error);
      return [];
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
}

/**
 * Mendapatkan daftar kabupaten/kota berdasarkan kode provinsi
 * @param {string} provinceCode - Kode provinsi
 * @returns {Promise<Array>} Promise yang berisi array objek kabupaten/kota
 */
export async function fetchRegencies(provinceCode) {
  try {
    const response = await fetch(`/api/geografis/regencies?provinceCode=${provinceCode}`);
    const data = await response.json();
    
    if (!data.success) {
      console.error(`Error fetching regencies for province ${provinceCode}:`, data.error);
      return [];
    }
    
    return data.data;
  } catch (error) {
    console.error(`Error fetching regencies for province ${provinceCode}:`, error);
    return [];
  }
}

/**
 * Mendapatkan daftar kecamatan berdasarkan kode kabupaten/kota
 * @param {string} regencyCode - Kode kabupaten/kota
 * @returns {Promise<Array>} Promise yang berisi array objek kecamatan
 */
export async function fetchDistricts(regencyCode) {
  try {
    const response = await fetch(`/api/geografis/districts?regencyCode=${regencyCode}`);
    const data = await response.json();
    
    if (!data.success) {
      console.error(`Error fetching districts for regency ${regencyCode}:`, data.error);
      return [];
    }
    
    return data.data;
  } catch (error) {
    console.error(`Error fetching districts for regency ${regencyCode}:`, error);
    return [];
  }
}

/**
 * Mendapatkan daftar desa/kelurahan berdasarkan kode kecamatan
 * @param {string} districtCode - Kode kecamatan
 * @returns {Promise<Array>} Promise yang berisi array objek desa/kelurahan
 */
export async function fetchVillages(districtCode) {
  try {
    const response = await fetch(`/api/geografis/villages?districtCode=${districtCode}`);
    const data = await response.json();
    
    if (!data.success) {
      console.error(`Error fetching villages for district ${districtCode}:`, data.error);
      return [];
    }
    
    return data.data;
  } catch (error) {
    console.error(`Error fetching villages for district ${districtCode}:`, error);
    return [];
  }
} 