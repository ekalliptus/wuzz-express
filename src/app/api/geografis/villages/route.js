import { NextResponse } from 'next/server';

// MOCK_VILLAGES provides fallback data when geografis module fails
const MOCK_VILLAGES = {
  '317401': [ // Tebet (Jakarta Selatan)
    { code: '3174011001', name: 'Tebet Barat', postal_code: '12810' },
    { code: '3174011002', name: 'Tebet Timur', postal_code: '12820' },
    { code: '3174011003', name: 'Kebon Baru', postal_code: '12830' },
    { code: '3174011004', name: 'Bukit Duri', postal_code: '12840' },
    { code: '3174011005', name: 'Manggarai', postal_code: '12850' }
  ],
  '317304': [ // Grogol Petamburan (Jakarta Barat)
    { code: '3173041001', name: 'Grogol', postal_code: '11450' },
    { code: '3173041002', name: 'Jelambar', postal_code: '11460' },
    { code: '3173041003', name: 'Jelambar Baru', postal_code: '11460' },
    { code: '3173041004', name: 'Wijaya Kusuma', postal_code: '11460' },
    { code: '3173041005', name: 'Tanjung Duren Utara', postal_code: '11470' }
  ],
  '327301': [ // Coblong (Kota Bandung)
    { code: '3273011001', name: 'Cipaganti', postal_code: '40131' },
    { code: '3273011002', name: 'Lebak Gede', postal_code: '40132' },
    { code: '3273011003', name: 'Sadang Serang', postal_code: '40133' },
    { code: '3273011004', name: 'Dago', postal_code: '40135' },
    { code: '3273011005', name: 'Sekeloa', postal_code: '40134' }
  ],
  '510302': [ // Kuta (Kabupaten Badung)
    { code: '5103021001', name: 'Kuta', postal_code: '80361' },
    { code: '5103021002', name: 'Legian', postal_code: '80361' },
    { code: '5103021003', name: 'Seminyak', postal_code: '80361' },
    { code: '5103021004', name: 'Tuban', postal_code: '80363' }
  ]
};

// Generate generic village data with postal codes when district not in mock data
function generateGenericVillages(districtCode) {
  const villages = [];
  const basePostalCode = Math.floor(Math.random() * 90000) + 10000; // 5-digit random number
  
  // Village name styles
  const prefixes = ['Desa', 'Kelurahan', 'Kampung', 'Pekon'];
  const suffixes = ['Indah', 'Jaya', 'Makmur', 'Sejahtera', 'Baru'];
  const directions = ['Utara', 'Selatan', 'Timur', 'Barat', 'Tengah'];
  
  for (let i = 1; i <= 5; i++) {
    // Create more realistic village names by alternating patterns
    let name;
    const namePattern = i % 3;
    
    switch(namePattern) {
      case 0:
        name = `${prefixes[i % prefixes.length]} ${directions[i % directions.length]}`;
        break;
      case 1:
        name = `${prefixes[i % prefixes.length]} ${suffixes[i % suffixes.length]}`;
        break;
      case 2:
        name = `${prefixes[i % prefixes.length]} ${i}`;
        break;
    }
    
    villages.push({
      code: `${districtCode}${i.toString().padStart(4, '0')}`,
      name: name,
      postal_code: `${basePostalCode}`
    });
  }
  
  return villages;
}

export async function GET(request) {
  // Get district code from URL search params
  const { searchParams } = new URL(request.url);
  const districtCode = searchParams.get('districtCode');
  
  if (!districtCode) {
    return NextResponse.json({
      success: false,
      message: 'District code is required',
      data: []
    }, { status: 400 });
  }

  try {
    // The geografis package has been removed, so we'll always use mock data
    console.log(`Using mock villages data for district ${districtCode}`);
    
    // Get mock data for the requested district code or generate generic data
    const mockData = MOCK_VILLAGES[districtCode] || generateGenericVillages(districtCode);
    
    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'Villages data retrieved from mock source'
    });
  } catch (error) {
    console.error(`Error providing villages for district ${districtCode}:`, error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve villages data'
    }, { status: 500 });
  }
} 