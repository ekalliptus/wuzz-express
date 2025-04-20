// Menggunakan pendekatan isomorphic (server/client)
// Di sisi server, geografis akan diimport secara normal
// Di sisi browser, akan menggunakan dynamic import atau mock implementasi

// Penggunaan try-catch untuk menangkap error saat geografis tidak tersedia di browser
let geografis;

try {
  // Ini akan berfungsi di Node.js/server-side
  geografis = require('geografis');
} catch (error) {
  console.warn('Geografis package not available in browser environment, using mock data');
  // Fallback implementation untuk browser
  geografis = {
    getProvinces: () => [],
    getProvince: () => null,
    getCity: () => null, 
    getDistrict: () => null,
    getVillage: () => null,
    search: () => ({ count: 0, limit: 10, offset: 0, data: [] })
  };
}

/**
 * Mendapatkan daftar semua provinsi
 * @returns {Array} Array berisi objek provinsi dengan format yang sudah dimodifikasi untuk dropdown
 */
function getProvinces() {
  try {
    const provinces = geografis.getProvinces();
    // Mengubah format ke format yang dibutuhkan oleh dropdown
    return provinces.map(province => ({
      code: province.code,
      name: province.province || province.name
    }));
  } catch (error) {
    console.error('Error fetching provinces from geografis:', error);
    return [];
  }
}

/**
 * Mendapatkan daftar kabupaten/kota berdasarkan kode provinsi
 * @param {string} provinceCode - Kode provinsi
 * @returns {Array} Array berisi objek kabupaten/kota dengan format yang sudah dimodifikasi untuk dropdown
 */
function getRegencies(provinceCode) {
  try {
    // Dapatkan detail provinsi
    const province = geografis.getProvince(provinceCode);
    if (!province || !province.cities) {
      return [];
    }
    
    // Format data untuk dropdown
    return province.cities.map(city => ({
      code: city.code,
      name: city.city || city.name,
      province_code: provinceCode
    }));
  } catch (error) {
    console.error(`Error fetching regencies for province ${provinceCode} from geografis:`, error);
    return [];
  }
}

/**
 * Mendapatkan daftar kecamatan berdasarkan kode kabupaten/kota
 * @param {string} regencyCode - Kode kabupaten/kota
 * @returns {Array} Array berisi objek kecamatan dengan format yang sudah dimodifikasi untuk dropdown
 */
function getDistricts(regencyCode) {
  try {
    // Dapatkan detail kabupaten/kota
    const city = geografis.getCity(regencyCode);
    if (!city || !city.districts) {
      return [];
    }
    
    // Format data untuk dropdown
    return city.districts.map(district => ({
      code: district.code,
      name: district.district || district.name,
      regency_code: regencyCode
    }));
  } catch (error) {
    console.error(`Error fetching districts for regency ${regencyCode} from geografis:`, error);
    return [];
  }
}

/**
 * Mendapatkan daftar desa/kelurahan berdasarkan kode kecamatan
 * @param {string} districtCode - Kode kecamatan
 * @returns {Array} Array berisi objek desa/kelurahan dengan format yang sudah dimodifikasi untuk dropdown
 */
function getVillages(districtCode) {
  try {
    // Dapatkan detail kecamatan
    const district = geografis.getDistrict(districtCode);
    if (!district || !district.villages) {
      return [];
    }
    
    // Format data untuk dropdown
    return district.villages.map(village => ({
      code: village.code,
      name: village.village || village.name,
      district_code: districtCode,
      postal_code: village.postal
    }));
  } catch (error) {
    console.error(`Error fetching villages for district ${districtCode} from geografis:`, error);
    return [];
  }
}

/**
 * Mencari lokasi berdasarkan kata kunci
 * @param {string} query - Kata kunci pencarian
 * @param {number} limit - Jumlah hasil yang ingin ditampilkan
 * @param {number} offset - Offset untuk pagination
 * @returns {Object} Hasil pencarian dengan format yang sudah distandarisasi
 */
function searchLocation(query, limit = 10, offset = 0) {
  try {
    const result = geografis.search(query, limit, offset);
    return result;
  } catch (error) {
    console.error(`Error searching location with query "${query}" from geografis:`, error);
    return { count: 0, limit, offset, data: [] };
  }
}

module.exports = {
  getProvinces,
  getRegencies,
  getDistricts,
  getVillages,
  searchLocation,
  
  // Eksport raw functions jika diperlukan untuk kasus khusus
  raw: geografis
}; 