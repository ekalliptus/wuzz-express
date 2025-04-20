const geografis = require('geografis');

// Mendapatkan dan mencetak semua provinsi
console.log('=== PROVINSI ===');
const provinces = geografis.getProvinces();
console.log(`Total provinsi: ${provinces.length}`);
console.log('Contoh data provinsi:');
console.log(provinces[0]);
console.log('');

// Mendapatkan dan mencetak kota/kabupaten untuk provinsi DKI Jakarta (kode 31)
console.log('=== KOTA/KABUPATEN di PROVINSI DKI JAKARTA ===');
const province = geografis.getProvince('31');
if (province && province.cities) {
  console.log(`Total kota/kabupaten: ${province.cities.length}`);
  console.log('Contoh data kota/kabupaten:');
  console.log(province.cities[0]);
} else {
  console.log('Tidak ada data kota/kabupaten yang ditemukan');
}
console.log('');

// Mendapatkan dan mencetak kecamatan untuk Jakarta Pusat (kode 31.71)
console.log('=== KECAMATAN di JAKARTA PUSAT ===');
const city = geografis.getCity('31.71');
if (city && city.districts) {
  console.log(`Total kecamatan: ${city.districts.length}`);
  console.log('Contoh data kecamatan:');
  console.log(city.districts[0]);
} else {
  console.log('Tidak ada data kecamatan yang ditemukan');
}
console.log('');

// Mendapatkan dan mencetak desa/kelurahan untuk Kecamatan Gambir (kode 31.71.01)
console.log('=== DESA/KELURAHAN di KECAMATAN GAMBIR ===');
const district = geografis.getDistrict('31.71.01');
if (district && district.villages) {
  console.log(`Total desa/kelurahan: ${district.villages.length}`);
  console.log('Contoh data desa/kelurahan:');
  console.log(district.villages[0]);
} else {
  console.log('Tidak ada data desa/kelurahan yang ditemukan');
}
console.log('');

// Mencari lokasi dengan kata kunci
console.log('=== PENCARIAN LOKASI ===');
const search = geografis.search('Bandung', 5, 0);
console.log(`Total hasil pencarian: ${search.count}`);
console.log('Contoh hasil pencarian:');
if (search.data && search.data.length > 0) {
  console.log(search.data[0]);
} else {
  console.log('Tidak ada hasil pencarian yang ditemukan');
} 