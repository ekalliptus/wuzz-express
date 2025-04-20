import { NextResponse } from 'next/server';

// MOCK_REGENCIES provides fallback data when geografis module fails
const MOCK_REGENCIES = {
  '31': [ // DKI Jakarta
    { code: '3171', name: 'Jakarta Pusat' },
    { code: '3172', name: 'Jakarta Utara' },
    { code: '3173', name: 'Jakarta Barat' },
    { code: '3174', name: 'Jakarta Selatan' },
    { code: '3175', name: 'Jakarta Timur' },
    { code: '3101', name: 'Kepulauan Seribu' }
  ],
  '32': [ // Jawa Barat
    { code: '3201', name: 'Kabupaten Bogor' },
    { code: '3202', name: 'Kabupaten Sukabumi' },
    { code: '3203', name: 'Kabupaten Cianjur' },
    { code: '3204', name: 'Kabupaten Bandung' },
    { code: '3205', name: 'Kabupaten Garut' },
    { code: '3271', name: 'Kota Bogor' },
    { code: '3272', name: 'Kota Sukabumi' },
    { code: '3273', name: 'Kota Bandung' },
    { code: '3274', name: 'Kota Cimahi' },
    { code: '3275', name: 'Kota Bekasi' },
    { code: '3276', name: 'Kota Depok' }
  ],
  '51': [ // Bali
    { code: '5101', name: 'Kabupaten Jembrana' },
    { code: '5102', name: 'Kabupaten Tabanan' },
    { code: '5103', name: 'Kabupaten Badung' },
    { code: '5104', name: 'Kabupaten Gianyar' },
    { code: '5105', name: 'Kabupaten Klungkung' },
    { code: '5106', name: 'Kabupaten Bangli' },
    { code: '5107', name: 'Kabupaten Karangasem' },
    { code: '5108', name: 'Kabupaten Buleleng' },
    { code: '5171', name: 'Kota Denpasar' }
  ],
  '35': [ // Jawa Timur
    { code: '3501', name: 'Kabupaten Pacitan' },
    { code: '3502', name: 'Kabupaten Ponorogo' },
    { code: '3503', name: 'Kabupaten Trenggalek' },
    { code: '3504', name: 'Kabupaten Tulungagung' },
    { code: '3571', name: 'Kota Kediri' },
    { code: '3578', name: 'Kota Surabaya' },
    { code: '3579', name: 'Kota Batu' }
  ]
};

// Generate generic regencies when province not in mock data
function generateGenericRegencies(provinceCode) {
  const regencies = [];
  
  // Generate some generic regency names for this province
  for (let i = 1; i <= 5; i++) {
    const regencyCode = `${provinceCode}${i.toString().padStart(2, '0')}`;
    regencies.push({ 
      code: regencyCode, 
      name: `Kabupaten ${i} (${provinceCode})` 
    });
  }
  
  // Add a city
  regencies.push({ 
    code: `${provinceCode}71`, 
    name: `Kota Utama (${provinceCode})` 
  });
  
  return regencies;
}

export async function GET(request) {
  // Get province code from URL search params
  const { searchParams } = new URL(request.url);
  const provinceCode = searchParams.get('provinceCode');
  
  if (!provinceCode) {
    return NextResponse.json({
      success: false,
      message: 'Province code is required',
      data: []
    }, { status: 400 });
  }

  try {
    // The geografis package has been removed, so we'll always use mock data
    console.log(`Using mock regencies data for province ${provinceCode}`);
    
    // Get mock data for the requested province code or generate generic data
    const mockData = MOCK_REGENCIES[provinceCode] || generateGenericRegencies(provinceCode);
    
    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'Regencies data retrieved from mock source'
    });
  } catch (error) {
    console.error(`Error providing regencies for province ${provinceCode}:`, error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve regencies data'
    }, { status: 500 });
  }
} 