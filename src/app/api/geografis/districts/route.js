import { NextResponse } from 'next/server';

// MOCK_DISTRICTS provides fallback data when geografis module fails
const MOCK_DISTRICTS = {
  '3173': [ // Jakarta Barat
    { code: '317301', name: 'Kembangan' },
    { code: '317302', name: 'Kebon Jeruk' },
    { code: '317303', name: 'Palmerah' },
    { code: '317304', name: 'Grogol Petamburan' },
    { code: '317305', name: 'Tambora' },
    { code: '317306', name: 'Taman Sari' },
    { code: '317307', name: 'Cengkareng' },
    { code: '317308', name: 'Kalideres' }
  ],
  '3174': [ // Jakarta Selatan
    { code: '317401', name: 'Tebet' },
    { code: '317402', name: 'Setiabudi' },
    { code: '317403', name: 'Mampang Prapatan' },
    { code: '317404', name: 'Pancoran' },
    { code: '317405', name: 'Kebayoran Baru' },
    { code: '317406', name: 'Kebayoran Lama' },
    { code: '317407', name: 'Cilandak' },
    { code: '317408', name: 'Jagakarsa' },
    { code: '317409', name: 'Pesanggrahan' },
    { code: '317410', name: 'Pasar Minggu' }
  ],
  '3273': [ // Kota Bandung
    { code: '327301', name: 'Coblong' },
    { code: '327302', name: 'Sukajadi' },
    { code: '327303', name: 'Cicendo' },
    { code: '327304', name: 'Andir' },
    { code: '327305', name: 'Bandung Wetan' },
    { code: '327306', name: 'Sumur Bandung' },
    { code: '327307', name: 'Cibeunying Kaler' },
    { code: '327308', name: 'Cibeunying Kidul' }
  ],
  '5103': [ // Kabupaten Badung
    { code: '510301', name: 'Kuta Selatan' },
    { code: '510302', name: 'Kuta' },
    { code: '510303', name: 'Kuta Utara' },
    { code: '510304', name: 'Mengwi' },
    { code: '510305', name: 'Abiansemal' },
    { code: '510306', name: 'Petang' }
  ]
};

export async function GET(request) {
  // Get regency code from URL search params
  const { searchParams } = new URL(request.url);
  const regencyCode = searchParams.get('regencyCode');
  
  if (!regencyCode) {
    return NextResponse.json({
      success: false,
      message: 'Regency code is required',
      data: []
    }, { status: 400 });
  }

  try {
    // The geografis package has been removed, so we'll always use mock data
    console.log(`Using mock districts data for regency ${regencyCode}`);
    
    // Get mock data for the requested regency code or return empty array
    const mockData = MOCK_DISTRICTS[regencyCode] || [];
    
    // Generate mock data if we don't have any for this regency code
    if (mockData.length === 0) {
      console.log(`No predefined mock data for regency ${regencyCode}, generating generic districts`);
      // Generate some generic district names for this regency
      const genericDistricts = [
        { code: `${regencyCode}01`, name: `District North ${regencyCode}` },
        { code: `${regencyCode}02`, name: `District South ${regencyCode}` },
        { code: `${regencyCode}03`, name: `District East ${regencyCode}` },
        { code: `${regencyCode}04`, name: `District West ${regencyCode}` },
        { code: `${regencyCode}05`, name: `District Central ${regencyCode}` }
      ];
      
      return NextResponse.json({
        success: true,
        data: genericDistricts,
        message: 'Generated generic districts data'
      });
    }
    
    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'Districts data retrieved from mock source'
    });
  } catch (error) {
    console.error(`Error providing districts for regency ${regencyCode}:`, error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve districts data'
    }, { status: 500 });
  }
} 