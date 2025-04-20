'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { createShipment, getServiceTypes, calculateRate } from '@/app/actions';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FaArrowLeft } from "react-icons/fa";
// Import API client for geografis instead of direct util
import { 
  fetchProvinces, 
  fetchRegencies, 
  fetchDistricts, 
  fetchVillages 
} from '@/api/geografisAPI';

// Location type definitions
interface Province {
  code: string;
  name: string;
}

interface Regency {
  code: string;
  name: string;
  province_code: string;
}

interface District {
  code: string;
  name: string;
  regency_code: string;
}

interface Village {
  code: string;
  name: string;
  district_code: string;
  postal_code?: string;
}

// ShipmentFormData interface
interface ShipmentFormData {
  customerId: string;
  serviceTypeId: string;
  weight: number;
  description: string;
  notes: string;
  price: number;
  
  // Origin location details
  originProvince: string;
  originProvinceCode: string;
  originRegency: string;
  originRegencyCode: string;
  originDistrict: string;
  originDistrictCode: string;
  originVillage: string;
  originVillageCode: string;
  originPostalCode: string;
  originLocation: string;
  
  // Destination location details
  destinationProvince: string;
  destinationProvinceCode: string;
  destinationRegency: string;
  destinationRegencyCode: string;
  destinationDistrict: string;
  destinationDistrictCode: string;
  destinationVillage: string;
  destinationVillageCode: string;
  destinationPostalCode: string;
  destinationLocation: string;
  
  // Sender details
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  
  // Recipient details
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
}

// Mock data providers - separate from API functions for clarity
function getMockProvinces(): Province[] {
  console.log('Providing mock province data');
  return [
    { code: '11', name: 'ACEH' },
    { code: '12', name: 'SUMATERA UTARA' },
    { code: '13', name: 'SUMATERA BARAT' },
    { code: '14', name: 'RIAU' },
    { code: '15', name: 'JAMBI' },
    { code: '16', name: 'SUMATERA SELATAN' },
    { code: '17', name: 'BENGKULU' },
    { code: '18', name: 'LAMPUNG' },
    { code: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
    { code: '21', name: 'KEPULAUAN RIAU' },
    { code: '31', name: 'DKI JAKARTA' },
    { code: '32', name: 'JAWA BARAT' },
    { code: '33', name: 'JAWA TENGAH' },
    { code: '34', name: 'DI YOGYAKARTA' },
    { code: '35', name: 'JAWA TIMUR' },
    { code: '36', name: 'BANTEN' },
    { code: '51', name: 'BALI' },
    { code: '52', name: 'NUSA TENGGARA BARAT' },
    { code: '53', name: 'NUSA TENGGARA TIMUR' },
    { code: '61', name: 'KALIMANTAN BARAT' },
    { code: '62', name: 'KALIMANTAN TENGAH' },
    { code: '63', name: 'KALIMANTAN SELATAN' },
    { code: '64', name: 'KALIMANTAN TIMUR' },
    { code: '65', name: 'KALIMANTAN UTARA' },
    { code: '71', name: 'SULAWESI UTARA' },
    { code: '72', name: 'SULAWESI TENGAH' },
    { code: '73', name: 'SULAWESI SELATAN' },
    { code: '74', name: 'SULAWESI TENGGARA' },
    { code: '75', name: 'GORONTALO' },
    { code: '76', name: 'SULAWESI BARAT' },
    { code: '81', name: 'MALUKU' },
    { code: '82', name: 'MALUKU UTARA' },
    { code: '91', name: 'PAPUA BARAT' },
    { code: '94', name: 'PAPUA' }
  ];
}

// For regencies, we'll use API data
function getMockRegencies(provinceCode: string): Regency[] {
  console.log(`Providing mock regency data for province ${provinceCode}`);
  
  // Sample regency data - in a real implementation, this would be filtered by province
  const MOCK_REGENCIES = [
    { code: '3171', name: 'Kota Jakarta Pusat', province_code: '31' },
    { code: '3172', name: 'Kota Jakarta Utara', province_code: '31' },
    { code: '3173', name: 'Kota Jakarta Barat', province_code: '31' },
    { code: '3174', name: 'Kota Jakarta Selatan', province_code: '31' },
    { code: '3175', name: 'Kota Jakarta Timur', province_code: '31' },
    { code: '3601', name: 'Kabupaten Pandeglang', province_code: '36' },
    { code: '3602', name: 'Kabupaten Lebak', province_code: '36' },
    { code: '3603', name: 'Kabupaten Tangerang', province_code: '36' },
    { code: '3604', name: 'Kabupaten Serang', province_code: '36' },
    { code: '3671', name: 'Kota Tangerang', province_code: '36' },
    { code: '3672', name: 'Kota Cilegon', province_code: '36' },
    { code: '3673', name: 'Kota Serang', province_code: '36' },
    { code: '3674', name: 'Kota Tangerang Selatan', province_code: '36' },
    { code: '3301', name: 'Kabupaten Cilacap', province_code: '33' },
    { code: '3302', name: 'Kabupaten Banyumas', province_code: '33' },
    { code: '3303', name: 'Kabupaten Purbalingga', province_code: '33' },
    { code: '3304', name: 'Kabupaten Banjarnegara', province_code: '33' },
    { code: '3305', name: 'Kabupaten Kebumen', province_code: '33' },
    { code: '3371', name: 'Kota Magelang', province_code: '33' },
    { code: '3372', name: 'Kota Surakarta', province_code: '33' },
    { code: '3373', name: 'Kota Salatiga', province_code: '33' },
    { code: '3374', name: 'Kota Pekalongan', province_code: '33' },
    { code: '3375', name: 'Kota Tegal', province_code: '33' },
    { code: '3376', name: 'Kota Tegal', province_code: '33' },
    { code: '3201', name: 'Kabupaten Bogor', province_code: '32' },
    { code: '3202', name: 'Kabupaten Sukabumi', province_code: '32' },
    { code: '3203', name: 'Kabupaten Cianjur', province_code: '32' },
    { code: '3401', name: 'Kabupaten Kulon Progo', province_code: '34' },
    { code: '3402', name: 'Kabupaten Bantul', province_code: '34' },
    { code: '3403', name: 'Kabupaten Gunung Kidul', province_code: '34' },
    { code: '3404', name: 'Kabupaten Sleman', province_code: '34' },
    { code: '3471', name: 'Kota Yogyakarta', province_code: '34' }
  ];

  // Filter regencies by province
  const filteredRegencies = MOCK_REGENCIES.filter(r => r.province_code === provinceCode);
  
  // If no matching regencies, generate some generic ones
  if (filteredRegencies.length === 0) {
    // Get province name
    let provinceName = "";
    try {
      provinceName = document.getElementById('originProvince')?.querySelector(`option[value="${provinceCode}"]`)?.textContent || "";
    } catch (e) {
      console.error("Error getting province name:", e);
    }

    // Generate generic but more natural names
    const genericNames = [
      { code: `${provinceCode}01`, name: `Kabupaten Utara ${provinceName}`, province_code: provinceCode },
      { code: `${provinceCode}02`, name: `Kabupaten Selatan ${provinceName}`, province_code: provinceCode },
      { code: `${provinceCode}03`, name: `Kabupaten Timur ${provinceName}`, province_code: provinceCode },
      { code: `${provinceCode}04`, name: `Kabupaten Barat ${provinceName}`, province_code: provinceCode },
      { code: `${provinceCode}71`, name: `Kota ${provinceName}`, province_code: provinceCode },
      { code: `${provinceCode}72`, name: `Kota Baru ${provinceName}`, province_code: provinceCode }
    ];
    
    return genericNames;
  }
  
  return filteredRegencies;
}

function getMockDistricts(regencyCode: string): District[] {
  console.log(`Providing mock district data for regency ${regencyCode}`);
  
  // Sample district data
  const MOCK_DISTRICTS = [
    { code: '317101', name: 'Tanah Abang', regency_code: '3171' },
    { code: '317102', name: 'Menteng', regency_code: '3171' },
    { code: '317103', name: 'Senen', regency_code: '3171' },
    { code: '317104', name: 'Johar Baru', regency_code: '3171' },
    { code: '317105', name: 'Cempaka Putih', regency_code: '3171' },
    { code: '317106', name: 'Kemayoran', regency_code: '3171' },
    { code: '317107', name: 'Sawah Besar', regency_code: '3171' },
    { code: '317108', name: 'Gambir', regency_code: '3171' },
    { code: '330101', name: 'Kedungreja', regency_code: '3301' },
    { code: '330102', name: 'Kesugihan', regency_code: '3301' },
    { code: '330103', name: 'Adipala', regency_code: '3301' },
    { code: '330104', name: 'Binangun', regency_code: '3301' },
    { code: '330105', name: 'Nusawungu', regency_code: '3301' },
    { code: '337401', name: 'Semarang Tengah', regency_code: '3374' },
    { code: '337402', name: 'Semarang Utara', regency_code: '3374' },
    { code: '337403', name: 'Semarang Timur', regency_code: '3374' },
    { code: '337404', name: 'Gayamsari', regency_code: '3374' },
    { code: '337405', name: 'Genuk', regency_code: '3374' },
    { code: '337601', name: 'Tegal Selatan', regency_code: '3376' },
    { code: '337602', name: 'Tegal Timur', regency_code: '3376' },
    { code: '337603', name: 'Tegal Barat', regency_code: '3376' },
    { code: '337604', name: 'Margadana', regency_code: '3376' },
    { code: '367101', name: 'Ciledug', regency_code: '3671' },
    { code: '367102', name: 'Larangan', regency_code: '3671' },
    { code: '367103', name: 'Karang Tengah', regency_code: '3671' },
    { code: '367104', name: 'Cipondoh', regency_code: '3671' },
    { code: '367105', name: 'Pinang', regency_code: '3671' },
    { code: '367106', name: 'Tangerang', regency_code: '3671' },
    { code: '367107', name: 'Karawaci', regency_code: '3671' },
    { code: '367108', name: 'Jatiuwung', regency_code: '3671' },
    { code: '347101', name: 'Mantrijeron', regency_code: '3471' },
    { code: '347102', name: 'Kraton', regency_code: '3471' },
    { code: '347103', name: 'Mergangsan', regency_code: '3471' },
    { code: '347104', name: 'Umbulharjo', regency_code: '3471' },
    { code: '347105', name: 'Kotagede', regency_code: '3471' },
    { code: '347106', name: 'Gondokusuman', regency_code: '3471' },
    { code: '347107', name: 'Danurejan', regency_code: '3471' },
    { code: '347108', name: 'Pakualaman', regency_code: '3471' },
    { code: '347109', name: 'Gondomanan', regency_code: '3471' },
    { code: '347110', name: 'Ngampilan', regency_code: '3471' },
    { code: '347111', name: 'Wirobrajan', regency_code: '3471' },
    { code: '347112', name: 'Gedongtengen', regency_code: '3471' },
    { code: '347113', name: 'Jetis', regency_code: '3471' },
    { code: '347114', name: 'Tegalrejo', regency_code: '3471' }
  ];

  // Filter districts by regency
  const filteredDistricts = MOCK_DISTRICTS.filter(d => d.regency_code === regencyCode);
  
  // If no matching districts, generate some generic ones
  if (filteredDistricts.length === 0) {
    // Generate districts with natural sounding names
    const districtTypes = ['Utara', 'Selatan', 'Timur', 'Barat', 'Tengah', 'Indah', 'Baru', 'Lama'];
    const prefixes = ['Suka', 'Marga', 'Tegal', 'Bandar', 'Karang', 'Jaya', 'Cipta', 'Rejo'];
    const suffixes = ['wangi', 'mulya', 'jaya', 'asih', 'makmur', 'sari', 'warna', 'sejati'];
    
    return Array.from({ length: 6 }, (_, i) => {
      const nameType = i % 3;
      let name;
      
      switch (nameType) {
        case 0:
          name = `${prefixes[i % prefixes.length]}${suffixes[i % suffixes.length]}`;
          break;
        case 1:
          name = `${districtTypes[i % districtTypes.length]}`;
          break;
        case 2:
          name = `${prefixes[i % prefixes.length]} ${districtTypes[i % districtTypes.length]}`;
          break;
        default:
          name = `Kecamatan ${i + 1}`;
      }
      
      return {
        code: `${regencyCode}${(i+1).toString().padStart(3, '0')}`,
        name: name,
        regency_code: regencyCode
      };
    });
  }
  
  return filteredDistricts;
}

function getMockVillages(districtCode: string): Village[] {
  console.log(`Providing mock village data for district ${districtCode}`);
  
  // Sample village data
  const MOCK_VILLAGES = [
    { code: '3171011001', name: 'Kebon Melati', district_code: '317101', postal_code: '10230' },
    { code: '3171011002', name: 'Kebon Kacang', district_code: '317101', postal_code: '10240' },
    { code: '3171011003', name: 'Kampung Bali', district_code: '317101', postal_code: '10250' },
    { code: '3171011004', name: 'Petamburan', district_code: '317101', postal_code: '10260' },
    { code: '3171011005', name: 'Bendungan Hilir', district_code: '317101', postal_code: '10210' },
    { code: '3171021001', name: 'Menteng', district_code: '317102', postal_code: '10310' },
    { code: '3171021002', name: 'Pegangsaan', district_code: '317102', postal_code: '10320' },
    { code: '3171021003', name: 'Cikini', district_code: '317102', postal_code: '10330' },
    { code: '3171021004', name: 'Kebon Sirih', district_code: '317102', postal_code: '10340' },
    { code: '3301011001', name: 'Tambaksari', district_code: '330101', postal_code: '53263' },
    { code: '3301011002', name: 'Rejamulya', district_code: '330101', postal_code: '53263' },
    { code: '3301011003', name: 'Kedungreja', district_code: '330101', postal_code: '53263' },
    { code: '3301011004', name: 'Ciklatan', district_code: '330101', postal_code: '53263' },
    { code: '3376011001', name: 'Bandung', district_code: '337601', postal_code: '52137' },
    { code: '3376011002', name: 'Kalinyamat Wetan', district_code: '337601', postal_code: '52137' },
    { code: '3376011003', name: 'Debong Kidul', district_code: '337601', postal_code: '52137' },
    { code: '3376011004', name: 'Tunon', district_code: '337601', postal_code: '52136' },
    { code: '3376011005', name: 'Keturen', district_code: '337601', postal_code: '52136' },
    { code: '3376011006', name: 'Debong Kulon', district_code: '337601', postal_code: '52133' },
    { code: '3376011007', name: 'Debong Tengah', district_code: '337601', postal_code: '52133' },
    { code: '3376011008', name: 'Randugunting', district_code: '337601', postal_code: '52131' },
    { code: '3376021001', name: 'Kejambon', district_code: '337602', postal_code: '52124' },
    { code: '3376021002', name: 'Slerok', district_code: '337602', postal_code: '52126' },
    { code: '3376021003', name: 'Panggung', district_code: '337602', postal_code: '52122' },
    { code: '3376021004', name: 'Mangkukusuman', district_code: '337602', postal_code: '52121' },
    { code: '3376021005', name: 'Mintaragen', district_code: '337602', postal_code: '52121' },
    { code: '3376031001', name: 'Pesurungan Kidul', district_code: '337603', postal_code: '52147' },
    { code: '3376031002', name: 'Debong Lor', district_code: '337603', postal_code: '52147' },
    { code: '3376031003', name: 'Kemandungan', district_code: '337603', postal_code: '52144' },
    { code: '3376031004', name: 'Pekauman', district_code: '337603', postal_code: '52144' },
    { code: '3376031005', name: 'Kraton', district_code: '337603', postal_code: '52142' },
    { code: '3376031006', name: 'Tegalsari', district_code: '337603', postal_code: '52111' },
    { code: '3376031007', name: 'Muarareja', district_code: '337603', postal_code: '52117' },
    { code: '3376041001', name: 'Kaligangsa', district_code: '337604', postal_code: '52147' },
    { code: '3376041002', name: 'Krandon', district_code: '337604', postal_code: '52147' },
    { code: '3376041003', name: 'Cabawan', district_code: '337604', postal_code: '52146' },
    { code: '3376041004', name: 'Margadana', district_code: '337604', postal_code: '52143' },
    { code: '3376041005', name: 'Kalinyamat Kulon', district_code: '337604', postal_code: '52146' },
    { code: '3376041006', name: 'Sumurpanggang', district_code: '337604', postal_code: '52147' },
    { code: '3376041007', name: 'Pesurungan Lor', district_code: '337604', postal_code: '52147' },
    
    { code: '3671011001', name: 'Sudimara Barat', district_code: '367101', postal_code: '15151' },
    { code: '3671011002', name: 'Sudimara Timur', district_code: '367101', postal_code: '15151' },
    { code: '3671011003', name: 'Sudimara Selatan', district_code: '367101', postal_code: '15151' },
    { code: '3671011004', name: 'Parung Serab', district_code: '367101', postal_code: '15153' },
    { code: '3671011005', name: 'Paninggilan', district_code: '367101', postal_code: '15153' },
    { code: '3471011001', name: 'Gedongkiwo', district_code: '347101', postal_code: '55142' },
    { code: '3471011002', name: 'Suryodiningratan', district_code: '347101', postal_code: '55141' },
    { code: '3471011003', name: 'Mantrijeron', district_code: '347101', postal_code: '55143' },
    { code: '3471021001', name: 'Patehan', district_code: '347102', postal_code: '55133' },
    { code: '3471021002', name: 'Panembahan', district_code: '347102', postal_code: '55131' },
    { code: '3471021003', name: 'Kadipaten', district_code: '347102', postal_code: '55132' }
  ];

  // Filter villages by district
  const filteredVillages = MOCK_VILLAGES.filter(v => v.district_code === districtCode);
  
  // If no matching villages, generate some generic ones
  if (filteredVillages.length === 0) {
    // Generate villages with natural sounding names
    const basePostalCode = Math.floor(Math.random() * 90000) + 10000; // 5-digit random number
    const prefixes = ['Suka', 'Marga', 'Tegal', 'Bandar', 'Karang', 'Jaya', 'Cipta', 'Rejo', 'Bumi', 'Cinta'];
    const suffixes = ['wangi', 'mulya', 'jaya', 'asih', 'makmur', 'sari', 'warna', 'sejati', 'indah', 'raya'];
    const kelurahanPrefixes = ['Kelurahan', 'Desa', 'Kampung'];
    
    return Array.from({ length: 5 }, (_, i) => {
      const nameType = i % 3;
      let name;
      
      switch (nameType) {
        case 0:
          name = `${prefixes[i % prefixes.length]}${suffixes[i % suffixes.length]}`;
          break;
        case 1:
          name = `${prefixes[i % prefixes.length]} ${suffixes[i % suffixes.length]}`;
          break;
        case 2:
          // Use one of the kelurahan prefixes with random name
          name = `${kelurahanPrefixes[i % kelurahanPrefixes.length]} ${prefixes[(i+2) % prefixes.length]}`;
          break;
        default:
          name = `Desa ${i + 1}`;
      }
      
      return {
        code: `${districtCode}${(i+1).toString().padStart(4, '0')}`,
        name: name,
        district_code: districtCode,
        postal_code: `${basePostalCode}`
      };
    });
  }
  
  return filteredVillages;
}

// Tambahkan state untuk cache lokasi
export default function AdminCreateShipmentPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [isWarehousePickup, setIsWarehousePickup] = useState(false);
  
  // Form handling
  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<ShipmentFormData>({
    defaultValues: {
      customerId: '',
      serviceTypeId: '',
      weight: 1,
      description: '',
      notes: '',
      price: 0,
      originProvince: '',
      originProvinceCode: '',
      originRegency: '',
      originRegencyCode: '',
      originDistrict: '',
      originDistrictCode: '',
      originVillage: '',
      originVillageCode: '',
      originPostalCode: '',
      originLocation: '',
      destinationProvince: '',
      destinationProvinceCode: '',
      destinationRegency: '',
      destinationRegencyCode: '',
      destinationDistrict: '',
      destinationDistrictCode: '',
      destinationVillage: '',
      destinationVillageCode: '',
      destinationPostalCode: '',
      destinationLocation: '',
      senderName: '',
      senderPhone: '',
      senderAddress: '',
      recipientName: '',
      recipientPhone: '',
      recipientAddress: ''
    }
  });
  
  // Watch fields for cascading dropdowns - pindahkan ke sini sebelum hooks lain
  const watchOriginProvinceCode = watch('originProvinceCode');
  const watchOriginRegencyCode = watch('originRegencyCode');
  const watchOriginDistrictCode = watch('originDistrictCode');

  const watchDestinationProvinceCode = watch('destinationProvinceCode');
  const watchDestinationRegencyCode = watch('destinationRegencyCode');
  const watchDestinationDistrictCode = watch('destinationDistrictCode');

  // Watch fields for price calculation
  const watchWeight = watch('weight');
  const watchServiceTypeId = watch('serviceTypeId');
  
  // Create a ref to track loading timeouts
  const loadingTimer = useRef<NodeJS.Timeout>();
  
  // Cache untuk data lokasi
  const [locationCache, setLocationCache] = useState<{
    provinces: any[];
    regencies: Record<string, any[]>;
    districts: Record<string, any[]>;
    villages: Record<string, any[]>;
  }>({
    provinces: [],
    regencies: {},
    districts: {},
    villages: {}
  });
  
  // API loading states
  const [loadingOriginRegencies, setLoadingOriginRegencies] = useState(false);
  const [loadingOriginDistricts, setLoadingOriginDistricts] = useState(false);
  const [loadingOriginVillages, setLoadingOriginVillages] = useState(false);
  const [loadingDestRegencies, setLoadingDestRegencies] = useState(false);
  const [loadingDestDistricts, setLoadingDestDistricts] = useState(false);
  const [loadingDestVillages, setLoadingDestVillages] = useState(false);
  
  // Location data states
  const [provinces, setProvinces] = useState<any[]>([]);
  
  // Origin location states
  const [originRegencies, setOriginRegencies] = useState<any[]>([]);
  const [originDistricts, setOriginDistricts] = useState<any[]>([]);
  const [originVillages, setOriginVillages] = useState<any[]>([]);
  
  // Destination location states
  const [destinationRegencies, setDestinationRegencies] = useState<any[]>([]);
  const [destinationDistricts, setDestinationDistricts] = useState<any[]>([]);
  const [destinationVillages, setDestinationVillages] = useState<any[]>([]);
  
  // Fungsi untuk memvalidasi API key GoAPI.io
  const validateGoAPIKey = async () => {
    try {
      console.log('Validating GoAPI key...');
      
      // Coba mengakses endpoint sederhana untuk verifikasi
      const response = await fetch(`${GOAPI_BASE_URL}/status`, {
        method: 'GET',
        headers: {
          'x-api-key': GOAPI_KEY
        }
      });
      
      if (response.ok) {
        console.log('GoAPI key is valid!');
        return true;
      } else {
        const errorText = await response.text();
        console.error(`GoAPI key validation failed: ${response.status} - ${errorText}`);
        return false;
      }
    } catch (error) {
      console.error('GoAPI key validation error:', error);
      return false;
    }
  };
  
  // Redirect jika bukan admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, user, router]);
  
  // Tambahkan cek API key dan load data saat komponen dimuat
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Validasi GoAPI key
        const isValid = await validateGoAPIKey();
        if (!isValid) {
          console.warn('GoAPI key is invalid or has issues. Will use fallback APIs.');
          toast.warning('API GoAPI tidak valid atau kadaluwarsa, menggunakan API alternatif');
        } else {
          console.log('GoAPI is ready to use');
        }
        
        // Load service types
        const serviceTypesData = await getServiceTypes();
        setServiceTypes(serviceTypesData);
        console.log('Service types loaded:', serviceTypesData);
        
        // Load provinces - PERBAIKI UNTUK MEMASTIKAN DATA PROVINSI DIMUAT
        try {
          const provincesData = await fetchProvincesData();
          console.log('Provinces loaded:', provincesData);
          if (provincesData && provincesData.length > 0) {
            setProvinces(provincesData);
            
            // Simpan dalam cache
            setLocationCache(prev => ({...prev, provinces: provincesData}));
          } else {
            toast.error('Tidak dapat memuat data provinsi. Silakan refresh halaman.');
            // Fallback ke data statis jika API gagal
            const mockProvinces = getMockProvinces();
            setProvinces(mockProvinces);
          }
        } catch (provinceError) {
          console.error('Error loading provinces:', provinceError);
          toast.error('Gagal memuat data provinsi, menggunakan data sementara');
          // Fallback ke data statis
          const mockProvinces = getMockProvinces();
          setProvinces(mockProvinces);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Gagal memuat data. Silakan refresh halaman.');
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, [isAuthenticated, user]);
  
  // Tambahkan opsi menu provinsi saat komponen dimuat
  useEffect(() => {
    // Load data provinsi langsung saat komponen dimuat, pastikan selalu tersedia
    const loadProvinces = async () => {
      try {
        console.log('Loading provinces on component mount');
        setLoading(true);
        
        // Cek apakah sudah ada data di cache
        if (locationCache.provinces.length > 0) {
          console.log('Using cached provinces data, length:', locationCache.provinces.length);
          setProvinces(locationCache.provinces);
          setLoading(false);
          return;
        }
        
        // Gunakan data mock sebagai fallback awal sementara API loading
        if (provinces.length === 0) {
          console.log('Setting initial mock provinces while API loads');
          const mockProvinces = getMockProvinces();
          setProvinces(mockProvinces);
        }
        
        // Coba muat data dari API
        try {
          const provincesData = await fetchProvincesData();
          if (provincesData && provincesData.length > 0) {
            console.log('Successfully loaded provinces from API:', provincesData.length);
            setProvinces(provincesData);
            
            // Simpan di cache untuk penggunaan selanjutnya
            setLocationCache(prev => ({...prev, provinces: provincesData}));
          }
        } catch (apiError) {
          console.error('Error loading provinces from API:', apiError);
          toast.error('Gagal memuat data provinsi dari API, menggunakan data offline');
          
          // Pastikan tetap ada data provinsi dengan menggunakan data mock
          const mockProvinces = getMockProvinces();
          setProvinces(mockProvinces);
          setLocationCache(prev => ({...prev, provinces: mockProvinces}));
        }
      } catch (error) {
        console.error('Province loading error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProvinces();
  }, []);  // Empty dependency array ensures this runs once on mount
  
  // Tambahkan useEffect untuk memuat kabupaten/kota saat provinsi berubah
  useEffect(() => {
    // Clear function untuk membatalkan debounce jika component unmount
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const loadOriginRegencies = async () => {
      // Hanya jalankan jika ada kode provinsi yang valid
      if (!watchOriginProvinceCode) return;
      
      // Tampilkan loading indicator dengan debounce untuk mencegah flicker
      timeoutId = setTimeout(() => {
        if (isMounted) setLoadingOriginRegencies(true);
      }, 100);
      
      console.log(`Origin province changed to ${watchOriginProvinceCode}, loading regencies...`);
      
      try {
        // Cari nama provinsi dari kode yang dipilih
        const provinceName = provinces.find(p => p.code === watchOriginProvinceCode)?.name || '';
        if (isMounted) setValue('originProvince', provinceName);
        
        // Reset dropdown kabupaten/kota dan yang di bawahnya
        if (isMounted) {
          setValue('originRegencyCode', '');
          setValue('originRegency', '');
          setValue('originDistrictCode', '');
          setValue('originDistrict', '');
          setValue('originVillageCode', '');
          setValue('originVillage', '');
          setValue('originPostalCode', '');
          
          setOriginDistricts([]);
          setOriginVillages([]);
        }
        
        // Cek cache dulu untuk kabupaten/kota
        if (locationCache.regencies[watchOriginProvinceCode]?.length > 0) {
          console.log('Using cached regencies data for province:', watchOriginProvinceCode);
          if (isMounted) {
            setOriginRegencies(locationCache.regencies[watchOriginProvinceCode]);
            clearTimeout(timeoutId);
            setLoadingOriginRegencies(false);
            return;
          }
        }
        
        // Ambil data kabupaten/kota dari API
        const regenciesData = await fetchRegenciesData(watchOriginProvinceCode);
        console.log(`Loaded ${regenciesData.length} regencies for province ${watchOriginProvinceCode}`);
        
        // Update state hanya jika komponen masih mounted
        if (isMounted) {
          // Pastikan data berhasil dimuat
          if (regenciesData && regenciesData.length > 0) {
            setOriginRegencies(regenciesData);
            
            // Simpan di cache
            setLocationCache(prev => ({
              ...prev, 
              regencies: {...prev.regencies, [watchOriginProvinceCode]: regenciesData}
            }));
          } else {
            // Jika tidak ada data, gunakan mock data
            console.log('No regencies data returned, using mock data');
            const mockData = getMockRegencies(watchOriginProvinceCode);
            setOriginRegencies(mockData);
            
            // Simpan mock data di cache juga
            setLocationCache(prev => ({
              ...prev, 
              regencies: {...prev.regencies, [watchOriginProvinceCode]: mockData}
            }));
          }
        }
      } catch (error) {
        console.error('Error loading origin regencies:', error);
        if (isMounted) {
          toast.error('Gagal memuat data kabupaten/kota, menggunakan data offline');
          // Gunakan data mock sebagai fallback
          const mockData = getMockRegencies(watchOriginProvinceCode);
          setOriginRegencies(mockData);
          
          // Simpan mock data di cache
          setLocationCache(prev => ({
            ...prev, 
            regencies: {...prev.regencies, [watchOriginProvinceCode]: mockData}
          }));
        }
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoadingOriginRegencies(false);
        }
      }
    };
    
    if (watchOriginProvinceCode) {
      loadOriginRegencies();
    }
    
    // Cleanup function untuk mencegah memory leak
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [watchOriginProvinceCode, provinces, setValue]); // Hapus locationCache.regencies untuk mencegah render berlebihan
  
  // Handler untuk kabupaten/kota origin dan district
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const loadOriginDistricts = async () => {
      if (!watchOriginRegencyCode) return;
      
      // Debounce loading indicator
      timeoutId = setTimeout(() => {
        if (isMounted) setLoadingOriginDistricts(true);
      }, 100);
      
      try {
        // Cari nama kabupaten/kota dari kode
        const regencyName = originRegencies.find(r => r.code === watchOriginRegencyCode)?.name || '';
        if (isMounted) setValue('originRegency', regencyName);
        
        // Reset dropdown district dan village
        if (isMounted) {
          setValue('originDistrictCode', '');
          setValue('originDistrict', '');
          setValue('originVillageCode', '');
          setValue('originVillage', '');
          setValue('originPostalCode', '');
          setOriginVillages([]);
        }
        
        // Cek cache untuk districts
        if (locationCache.districts[watchOriginRegencyCode]?.length > 0) {
          console.log('Using cached districts for regency:', watchOriginRegencyCode);
          if (isMounted) {
            setOriginDistricts(locationCache.districts[watchOriginRegencyCode]);
            clearTimeout(timeoutId);
            setLoadingOriginDistricts(false);
            return;
          }
        }
        
        // Fetch districts data
        const districtsData = await fetchDistrictsData(watchOriginRegencyCode);
        
        if (isMounted) {
          if (districtsData && districtsData.length > 0) {
            setOriginDistricts(districtsData);
            
            // Cache the data
            setLocationCache(prev => ({
              ...prev,
              districts: {...prev.districts, [watchOriginRegencyCode]: districtsData}
            }));
          } else {
            // Use mock data as fallback
            const mockData = getMockDistricts(watchOriginRegencyCode);
            setOriginDistricts(mockData);
            
            // Cache mock data
            setLocationCache(prev => ({
              ...prev,
              districts: {...prev.districts, [watchOriginRegencyCode]: mockData}
            }));
          }
        }
      } catch (error) {
        console.error('Error loading districts:', error);
        if (isMounted) {
          toast.error('Gagal memuat data kecamatan');
          // Use mock data
          const mockData = getMockDistricts(watchOriginRegencyCode);
          setOriginDistricts(mockData);
        }
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoadingOriginDistricts(false);
        }
      }
    };
    
    if (watchOriginRegencyCode) {
      loadOriginDistricts();
    }
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [watchOriginRegencyCode, originRegencies, setValue]); // Hapus locationCache.districts
  
  // Handler for villages
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const loadOriginVillages = async () => {
      if (!watchOriginDistrictCode) return;
      
      // Debounce loading indicator
      timeoutId = setTimeout(() => {
        if (isMounted) setLoadingOriginVillages(true);
      }, 100);
      
      try {
        // Get district name
        const districtName = originDistricts.find(d => d.code === watchOriginDistrictCode)?.name || '';
        if (isMounted) setValue('originDistrict', districtName);
        
        // Reset village fields
        if (isMounted) {
          setValue('originVillageCode', '');
          setValue('originVillage', '');
          setValue('originPostalCode', '');
        }
        
        // Check cache
        if (locationCache.villages[watchOriginDistrictCode]?.length > 0) {
          console.log('Using cached villages for district:', watchOriginDistrictCode);
          if (isMounted) {
            setOriginVillages(locationCache.villages[watchOriginDistrictCode]);
            clearTimeout(timeoutId);
            setLoadingOriginVillages(false);
            return;
          }
        }
        
        // Fetch villages
        const villagesData = await fetchVillagesData(watchOriginDistrictCode);
        
        if (isMounted) {
          if (villagesData && villagesData.length > 0) {
            setOriginVillages(villagesData);
            
            // Cache the data
            setLocationCache(prev => ({
              ...prev,
              villages: {...prev.villages, [watchOriginDistrictCode]: villagesData}
            }));
          } else {
            // Fallback to mock data
            const mockData = getMockVillages(watchOriginDistrictCode);
            setOriginVillages(mockData);
            
            // Cache mock data
            setLocationCache(prev => ({
              ...prev,
              villages: {...prev.villages, [watchOriginDistrictCode]: mockData}
            }));
          }
        }
      } catch (error) {
        console.error('Error loading villages:', error);
        if (isMounted) {
          toast.error('Gagal memuat data kelurahan/desa');
          // Fallback to mock data
          const mockData = getMockVillages(watchOriginDistrictCode);
          setOriginVillages(mockData);
        }
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoadingOriginVillages(false);
        }
      }
    };
    
    if (watchOriginDistrictCode) {
      loadOriginVillages();
    }
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [watchOriginDistrictCode, originDistricts, setValue]); // Hapus locationCache.villages dari dependency
  
  // Tambahkan useEffect untuk memuat kabupaten/kota tujuan saat provinsi tujuan berubah
  useEffect(() => {
    const loadDestinationRegencies = async () => {
      // Hanya jalankan jika ada kode provinsi yang valid
      if (!watchDestinationProvinceCode) return;
      
      setLoadingDestRegencies(true);
      console.log(`Destination province changed to ${watchDestinationProvinceCode}, loading regencies...`);
      
      try {
        // Reset dropdown kabupaten/kota dan yang di bawahnya
        setValue('destinationRegency', '');
        setValue('destinationRegencyCode', '');
        setValue('destinationDistrict', '');
        setValue('destinationDistrictCode', '');
        setValue('destinationVillage', '');
        setValue('destinationVillageCode', '');
        setValue('destinationPostalCode', '');
        
        setDestinationDistricts([]);
        setDestinationVillages([]);
        
        // Ambil data kabupaten/kota dari API
        const regenciesData = await fetchRegenciesData(watchDestinationProvinceCode);
        console.log(`Loaded ${regenciesData.length} regencies for province ${watchDestinationProvinceCode}`);
        
        // Pastikan data berhasil dimuat
        if (regenciesData && regenciesData.length > 0) {
          setDestinationRegencies(regenciesData);
        } else {
          // Jika tidak ada data, gunakan mock data
          console.log('No destination regencies data returned, using mock data');
          setDestinationRegencies(getMockRegencies(watchDestinationProvinceCode));
        }
      } catch (error) {
        console.error('Error loading destination regencies:', error);
        toast.error('Gagal memuat data kabupaten/kota tujuan');
        // Gunakan data mock sebagai fallback
        setDestinationRegencies(getMockRegencies(watchDestinationProvinceCode));
      } finally {
        setLoadingDestRegencies(false);
      }
    };
    
    loadDestinationRegencies();
  }, [watchDestinationProvinceCode, setValue]);
  
  // Handler for origin province change
  const handleOriginProvinceChange = async (provinceCode: string) => {
    if (!provinceCode) {
      setOriginRegencies([]);
      setOriginDistricts([]);
      setOriginVillages([]);
      return;
    }
    
    // Set loading state langsung
    setLoadingOriginRegencies(true);
    
    try {
      // Find the province name from the selected code
      const provinceName = provinces.find(p => p.code === provinceCode)?.name || '';
      setValue('originProvince', provinceName);
      
      // Reset child dropdowns
      setValue('originRegencyCode', '');
      setValue('originRegency', '');
      setValue('originDistrictCode', '');
      setValue('originDistrict', '');
      setValue('originVillageCode', '');
      setValue('originVillage', '');
      setValue('originPostalCode', '');
      
      setOriginDistricts([]);
      setOriginVillages([]);
      
      // Cek cache dulu
      if (locationCache.regencies[provinceCode]?.length > 0) {
        setOriginRegencies(locationCache.regencies[provinceCode]);
        setLoadingOriginRegencies(false);
        return;
      }
      
      // Ambil data dari API dengan timeout
      const regenciesData = await fetchRegenciesData(provinceCode);
      
      if (regenciesData && regenciesData.length > 0) {
        setOriginRegencies(regenciesData);
        
        // Cache the data
        setLocationCache(prev => ({
          ...prev,
          regencies: { ...prev.regencies, [provinceCode]: regenciesData }
        }));
      } else {
        console.warn('No regencies data returned, using mock data');
        const mockData = getMockRegencies(provinceCode);
        setOriginRegencies(mockData);
        
        // Cache the mock data
        setLocationCache(prev => ({
          ...prev,
          regencies: { ...prev.regencies, [provinceCode]: mockData }
        }));
      }
    } catch (error) {
      console.error('Error loading origin regencies:', error);
      toast.error('Gagal memuat data kabupaten/kota. Menggunakan data offline.');
      
      // Use mock data as fallback
      const mockData = getMockRegencies(provinceCode);
      setOriginRegencies(mockData);
      
      // Cache the mock data
      setLocationCache(prev => ({
        ...prev,
        regencies: { ...prev.regencies, [provinceCode]: mockData }
      }));
    } finally {
      setLoadingOriginRegencies(false);
    }
  };
  
  // Handler for origin regency change
  const handleOriginRegencyChange = async (regencyCode: string) => {
    if (!regencyCode) {
      setOriginDistricts([]);
      setOriginVillages([]);
      return;
    }
    
    // Find the regency name from the selected code
    const regencyName = originRegencies.find(r => r.code === regencyCode)?.name || '';
    setValue('originRegency', regencyName);
    
    // Reset child dropdowns
    setValue('originDistrictCode', '');
    setValue('originDistrict', '');
    setValue('originVillageCode', '');
    setValue('originVillage', '');
    setValue('originPostalCode', '');
    
    setOriginVillages([]);
    
    // Fetch districts for the selected regency
    setLoadingOriginDistricts(true);
    try {
      const districtsData = await fetchDistrictsData(regencyCode);
      setOriginDistricts(districtsData);
    } catch (error) {
      console.error('Error fetching origin districts:', error);
      toast.error('Gagal memuat data kecamatan');
    } finally {
      setLoadingOriginDistricts(false);
    }
  };
  
  // Handler for origin district change
  const handleOriginDistrictChange = async (districtCode: string) => {
    if (!districtCode) {
      setOriginVillages([]);
      return;
    }
    
    // Find the district name from the selected code
    const districtName = originDistricts.find(d => d.code === districtCode)?.name || '';
    setValue('originDistrict', districtName);
    
    // Reset child dropdowns
    setValue('originVillageCode', '');
    setValue('originVillage', '');
    setValue('originPostalCode', '');
    
    // Fetch villages for the selected district
    setLoadingOriginVillages(true);
    try {
      const villagesData = await fetchVillagesData(districtCode);
      setOriginVillages(villagesData);
    } catch (error) {
      console.error('Error fetching origin villages:', error);
      toast.error('Gagal memuat data kelurahan/desa');
    } finally {
      setLoadingOriginVillages(false);
    }
  };
  
  // Handler for origin village change
  const handleOriginVillageChange = (villageCode: string) => {
    if (!villageCode) return;
    
    // Find the village from the selected code
    const selectedVillage = originVillages.find(v => v.code === villageCode);
    if (selectedVillage) {
      setValue('originVillage', selectedVillage.name);
      
      // Set postal code if available
      if (selectedVillage.postal_code) {
        setValue('originPostalCode', selectedVillage.postal_code);
      } else {
        const generatedPostalCode = generatePostalCode(watchOriginDistrictCode);
        setValue('originPostalCode', generatedPostalCode);
      }
    }
  };
  
  // Handler for destination province change
  const handleDestinationProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceName = e.target.value;
    if (!provinceName) {
      setDestinationRegencies([]);
      setDestinationDistricts([]);
      setDestinationVillages([]);
      return;
    }
    
    // Find the province code from the selected name
    const provinceCode = provinces.find(p => p.name === provinceName)?.code || '';
    setValue('destinationProvinceCode', provinceCode);
    
    if (!provinceCode) {
      console.error('Could not find province code for name:', provinceName);
      toast.error('Kode provinsi tidak ditemukan');
      return;
    }
    
    // Reset child dropdowns
    setValue('destinationRegency', '');
    setValue('destinationRegencyCode', '');
    setValue('destinationDistrict', '');
    setValue('destinationDistrictCode', '');
    setValue('destinationVillage', '');
    setValue('destinationVillageCode', '');
    setValue('destinationPostalCode', '');
    
    setDestinationDistricts([]);
    setDestinationVillages([]);
    
    // Check if we have this in cache
    if (locationCache.regencies[provinceCode]?.length > 0) {
      console.log('Using cached regencies for destination province:', provinceCode);
      setDestinationRegencies(locationCache.regencies[provinceCode]);
      return;
    }
    
    // Fetch regencies for the selected province
    setLoadingDestRegencies(true);
    try {
      const regenciesData = await fetchRegenciesData(provinceCode);
      if (regenciesData && regenciesData.length > 0) {
        setDestinationRegencies(regenciesData);
        
        // Cache the result
        setLocationCache(prev => ({
          ...prev,
          regencies: {...prev.regencies, [provinceCode]: regenciesData}
        }));
      } else {
        toast.error('Tidak ada data kabupaten/kota untuk provinsi ini');
        // Fallback to mock data
        const mockData = getMockRegencies(provinceCode);
        setDestinationRegencies(mockData);
        
        // Cache mock data
        setLocationCache(prev => ({
          ...prev,
          regencies: {...prev.regencies, [provinceCode]: mockData}
        }));
      }
    } catch (error) {
      console.error('Error fetching destination regencies:', error);
      toast.error('Gagal memuat data kabupaten/kota tujuan');
      // Fallback to mock data
      const mockData = getMockRegencies(provinceCode);
      setDestinationRegencies(mockData);
    } finally {
      setLoadingDestRegencies(false);
    }
  };
  
  // Handler untuk Destination Regency Change
  const handleDestinationRegencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regencyName = e.target.value;
    if (!regencyName) {
      setDestinationDistricts([]);
      setDestinationVillages([]);
      setValue('destinationRegencyCode', '');
      setValue('destinationDistrictCode', '');
      setValue('destinationVillageCode', '');
      setValue('destinationDistrict', '');
      setValue('destinationVillage', '');
      setValue('destinationPostalCode', '');
      return;
    }
    
    // Cari regency code berdasarkan nama
    const regencyCode = destinationRegencies.find(r => r.name === regencyName)?.code || '';
    setValue('destinationRegencyCode', regencyCode);
    
    if (!regencyCode) {
      console.error('Could not find regency code for name:', regencyName);
      toast.error('Kode kabupaten/kota tidak ditemukan');
      return;
    }
    
    // Reset child dropdowns
    setValue('destinationDistrict', '');
    setValue('destinationDistrictCode', '');
    setValue('destinationVillage', '');
    setValue('destinationVillageCode', '');
    setValue('destinationPostalCode', '');
    setDestinationVillages([]);
    
    // Cek cache untuk districts
    if (locationCache.districts[regencyCode]?.length > 0) {
      console.log('Using cached districts for regency:', regencyCode);
      setDestinationDistricts(locationCache.districts[regencyCode]);
      return;
    }
    
    // Fetch districts
    let loadingIndicatorTimer = setTimeout(() => setLoadingDestDistricts(true), 100);
    try {
      const districtsData = await fetchDistrictsData(regencyCode);
      if (districtsData && districtsData.length > 0) {
        setDestinationDistricts(districtsData);
        
        // Cache the data
        setLocationCache(prev => ({
          ...prev,
          districts: {...prev.districts, [regencyCode]: districtsData}
        }));
      } else {
        toast.info('Tidak ada data kecamatan untuk kabupaten/kota ini, menggunakan data default');
        // Fallback to mock data
        const mockData = getMockDistricts(regencyCode);
        setDestinationDistricts(mockData);
        
        // Cache mock data
        setLocationCache(prev => ({
          ...prev,
          districts: {...prev.districts, [regencyCode]: mockData}
        }));
      }
    } catch (error) {
      console.error('Error loading districts:', error);
      toast.error('Gagal memuat data kecamatan tujuan');
      // Fallback to mock data
      const mockData = getMockDistricts(regencyCode);
      setDestinationDistricts(mockData);
    } finally {
      clearTimeout(loadingIndicatorTimer);
      setLoadingDestDistricts(false);
    }
  };
  
  // Handler untuk Destination District Change
  const handleDestinationDistrictChange = async (districtCode: string) => {
    if (!districtCode) {
      setDestinationVillages([]);
      setValue('destinationDistrict', '');
      setValue('destinationVillage', '');
      setValue('destinationVillageCode', '');
      setValue('destinationPostalCode', '');
      return;
    }
    
    // Cari district name berdasarkan code
    const districtName = destinationDistricts.find(d => d.code === districtCode)?.name || '';
    setValue('destinationDistrict', districtName);
    
    // Reset village fields
    setValue('destinationVillage', '');
    setValue('destinationVillageCode', '');
    setValue('destinationPostalCode', '');
    
    // Cek cache untuk villages
    if (locationCache.villages[districtCode]?.length > 0) {
      console.log('Using cached villages for district:', districtCode);
      setDestinationVillages(locationCache.villages[districtCode]);
      return;
    }
    
    // Fetch villages
    let loadingIndicatorTimer = setTimeout(() => setLoadingDestVillages(true), 100);
    try {
      const villagesData = await fetchVillagesData(districtCode);
      if (villagesData && villagesData.length > 0) {
        setDestinationVillages(villagesData);
        
        // Cache the data
        setLocationCache(prev => ({
          ...prev,
          villages: {...prev.villages, [districtCode]: villagesData}
        }));
      } else {
        toast.info('Tidak ada data kelurahan/desa untuk kecamatan ini, menggunakan data default');
        // Fallback to mock data
        const mockData = getMockVillages(districtCode);
        setDestinationVillages(mockData);
        
        // Cache mock data
        setLocationCache(prev => ({
          ...prev,
          villages: {...prev.villages, [districtCode]: mockData}
        }));
      }
    } catch (error) {
      console.error('Error loading villages:', error);
      toast.error('Gagal memuat data kelurahan/desa tujuan');
      // Fallback to mock data
      const mockData = getMockVillages(districtCode);
      setDestinationVillages(mockData);
    } finally {
      clearTimeout(loadingIndicatorTimer);
      setLoadingDestVillages(false);
    }
  };
  
  // Handler untuk Destination Village Change
  const handleDestinationVillageChange = (villageCode: string) => {
    if (!villageCode) {
      setValue('destinationVillage', '');
      setValue('destinationPostalCode', '');
      return;
    }
    
    // Cari village berdasarkan code
    const selectedVillage = destinationVillages.find(v => v.code === villageCode);
    if (selectedVillage) {
      setValue('destinationVillage', selectedVillage.name);
      
      // Set postal code if available
      if (selectedVillage.postal_code) {
        setValue('destinationPostalCode', selectedVillage.postal_code);
      } else {
        const generatedPostalCode = generatePostalCode(watchDestinationDistrictCode);
        setValue('destinationPostalCode', generatedPostalCode);
      }
    } else {
      console.error('Selected village not found in list:', villageCode);
      toast.error('Kelurahan/desa yang dipilih tidak ditemukan');
    }
  };
  
  // Update price calculation when weight or service type changes
  useEffect(() => {
    // Hanya hitung jika semua field yang diperlukan sudah diisi
    if (watchWeight && watchServiceTypeId) {
      setLoadingPrice(true);
      
      // Hitung base price dari service type yang dipilih
      const selectedService = serviceTypes.find(st => st.id === Number(watchServiceTypeId));
      if (selectedService) {
        const basePrice = selectedService.basePrice || 0;
        // Rumus sederhana: harga = berat * harga dasar
        const calculatedPrice = watchWeight * basePrice;
        setCalculatedPrice(calculatedPrice);
        setValue('price', calculatedPrice);
      }
      
      setLoadingPrice(false);
    }
  }, [watchWeight, watchServiceTypeId, serviceTypes, setValue]);
  
  const onSubmit = async (data: ShipmentFormData) => {
    setLoading(true);
    
    try {
      // Konversi serviceTypeId ke number
      const formattedData = {
        ...data,
        serviceTypeId: Number(data.serviceTypeId),
        weight: Number(data.weight),
        price: Number(data.price),
        description: data.description.trim() || 'Paket' // Ensure description is never empty
      };
      
      // If warehouse pickup, set default values for origin location
      if (isWarehousePickup) {
        formattedData.originLocation = 'Gudang Wuzz Express';
        formattedData.originProvince = 'Gudang';
        formattedData.originRegency = 'Gudang';
        formattedData.originDistrict = 'Gudang';
        formattedData.originVillage = 'Gudang';
        formattedData.originPostalCode = '';
        formattedData.senderAddress = 'Gudang Wuzz Express';
      }
      
      const result = await createShipment(formattedData);
      
      if (result.success) {
        toast.success('Pengiriman berhasil dibuat!');
        router.push('/admin/shipments');
      } else {
        toast.error('Gagal membuat pengiriman');
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast.error('Terjadi kesalahan saat membuat pengiriman');
    } finally {
      setLoading(false);
    }
  };
  
  // Validate GoAPI Key
  useEffect(() => {
    const validateApiKey = async () => {
      if (isAuthenticated && user?.role === 'admin') {
        try {
          const apiKey = await getApiKey('GO_API_KEY');
          if (apiKey) {
            // Simulate key validation
            console.log('GoAPI Key validated successfully');
            // Load service types once authenticated
            fetchServiceTypes();
          } else {
            console.log('GoAPI Key not found or invalid');
          }
        } catch (error) {
          console.error('Error validating GoAPI Key:', error);
        }
      }
    };
    
    if (!authLoading) {
      validateApiKey();
    }
  }, [isAuthenticated, user, authLoading]);
  
  if (authLoading) {
    return <Loading />;
  }
  
  // Hanya tampilkan konten jika terotentikasi sebagai admin
  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return null;
  }
  
  // Memoize options to prevent unnecessary re-renders
  const provinceOptions = React.useMemo(() => {
    if (provinces.length === 0) {
      return [<option key="loading" value="" disabled>Loading provinsi...</option>];
    }
    
    return [
      <option key="empty" value="">Pilih Provinsi</option>,
      ...provinces.map((province) => (
        <option key={province.code} value={province.code}>
          {province.name}
        </option>
      ))
    ];
  }, [provinces]);

  const destinationProvinceOptions = React.useMemo(() => {
    if (provinces.length === 0) {
      return [<option key="loading" value="" disabled>Loading provinsi...</option>];
    }
    
    return [
      <option key="empty" value="">Pilih Provinsi</option>,
      ...provinces.map((province) => (
        <option key={province.code} value={province.name}>
          {province.name}
        </option>
      ))
    ];
  }, [provinces]);

  const originRegencyOptions = React.useMemo(() => {
    if (originRegencies.length === 0) {
      return [<option key="empty" value="">Pilih Kabupaten/Kota</option>];
    }
    
    return [
      <option key="empty" value="">Pilih Kabupaten/Kota</option>,
      ...originRegencies.map((regency) => (
        <option key={regency.code} value={regency.code}>
          {regency.name}
        </option>
      ))
    ];
  }, [originRegencies]);

  const originDistrictOptions = React.useMemo(() => {
    if (originDistricts.length === 0) {
      return [<option key="empty" value="">Pilih Kecamatan</option>];
    }
    
    return [
      <option key="empty" value="">Pilih Kecamatan</option>,
      ...originDistricts.map(district => (
        <option key={district.code} value={district.code} disabled={district.code === 'loading'}>
          {district.name}
        </option>
      ))
    ];
  }, [originDistricts]);

  const originVillageOptions = React.useMemo(() => {
    if (originVillages.length === 0) {
      return [<option key="empty" value="">Pilih Kelurahan/Desa</option>];
    }
    
    return [
      <option key="empty" value="">Pilih Kelurahan/Desa</option>,
      ...originVillages.map(village => (
        <option key={village.code} value={village.code}>
          {village.name} {village.postal_code ? `(${village.postal_code})` : ''}
        </option>
      ))
    ];
  }, [originVillages]);

  // Destination options
  const destinationRegencyOptions = React.useMemo(() => {
    if (destinationRegencies.length === 0) {
      return [<option key="empty" value="">Pilih Kabupaten/Kota</option>];
    }
    
    return [
      <option key="empty" value="">Pilih Kabupaten/Kota</option>,
      ...destinationRegencies.map(regency => (
        <option key={regency.code} value={regency.name}>
          {regency.name}
        </option>
      ))
    ];
  }, [destinationRegencies]);

  const destinationDistrictOptions = React.useMemo(() => {
    if (destinationDistricts.length === 0) {
      return [<option key="empty" value="">Pilih Kecamatan</option>];
    }
    
    return [
      <option key="empty" value="">Pilih Kecamatan</option>,
      ...destinationDistricts.map(district => (
        <option key={district.code} value={district.code}>
          {district.name}
        </option>
      ))
    ];
  }, [destinationDistricts]);

  const destinationVillageOptions = React.useMemo(() => {
    if (destinationVillages.length === 0) {
      return [<option key="empty" value="">Pilih Kelurahan/Desa</option>];
    }
    
    return [
      <option key="empty" value="">Pilih Kelurahan/Desa</option>,
      ...destinationVillages.map(village => (
        <option key={village.code} value={village.code}>
          {village.name} {village.postal_code ? `(${village.postal_code})` : ''}
        </option>
      ))
    ];
  }, [destinationVillages]);
  
  // Add this at the top of the component
  useEffect(() => {
    // Cleanup all pending timeouts on unmount
    return () => {
      if (loadingTimer.current) {
        clearTimeout(loadingTimer.current);
      }
    };
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl mb-6 text-black">Buat Pengiriman Baru</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Jenis Layanan */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg text-black mb-4">Informasi Layanan</h2>
            <div className="mb-4">
              <label htmlFor="serviceTypeId" className="block text-sm font-medium text-black mb-1">
                Jenis Layanan
              </label>
              <select
                id="serviceTypeId"
                {...register('serviceTypeId', { required: 'Jenis layanan harus dipilih' })}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Jenis Layanan</option>
                {serviceTypes.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.estimatedTime})
                  </option>
                ))}
              </select>
              {errors.serviceTypeId && (
                <p className="mt-1 text-sm text-red-600">{errors.serviceTypeId.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-black mb-1">
                  Berat (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  min="0.1"
                  step="0.1"
                  {...register('weight', { 
                    required: 'Berat wajib diisi',
                    min: { value: 0.1, message: 'Berat minimal 0.1 kg' }
                  })}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.weight && (
                  <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-black mb-1">
                  Deskripsi Barang <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="description"
                  {...register('description', { required: 'Deskripsi barang wajib diisi' })}
                  placeholder="Contoh: Dokumen, Pakaian, Elektronik"
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-black mb-1">
                  Catatan
                </label>
                <input
                  type="text"
                  id="notes"
                  {...register('notes')}
                  placeholder="Informasi tambahan"
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-black mb-1">
                Biaya Pengiriman
              </label>
              <div className="bg-blue-50 p-3 rounded-md flex items-center">
                <span className="text-lg text-black">
                  Rp {calculatedPrice.toLocaleString('id-ID')}
                </span>
                {loadingPrice && (
                  <LoadingSpinner size="sm" className="ml-2" />
                )}
                <input type="hidden" {...register('price')} />
              </div>
            </div>
          </div>
          
          {/* Informasi Pengirim */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg text-black">Lokasi Pengambilan</h2>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="pickupType"
                    checked={!isWarehousePickup}
                    onChange={() => setIsWarehousePickup(false)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Ambil di lokasi customer</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="pickupType"
                    checked={isWarehousePickup}
                    onChange={() => setIsWarehousePickup(true)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Customer antar ke gudang</span>
                </label>
              </div>
            </div>
            
            {isWarehousePickup ? (
              <div className="bg-blue-50 rounded-md p-4 mb-4">
                <p className="text-sm text-blue-700">
                  Customer akan mengantarkan barang langsung ke gudang. Tidak perlu mengisi detail lokasi pengambilan.
                </p>
              </div>
            ) : (
              <>
                {/* Cascading dropdowns for Origin Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Origin Province */}
                  <div>
                    <label htmlFor="originProvince" className="block text-sm font-medium text-black mb-1">
                      Provinsi
                    </label>
                    <div className="relative">
                      <select
                        id="originProvince"
                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        {...register('originProvinceCode', { required: !isWarehousePickup && 'Provinsi wajib dipilih' })}
                        onChange={(e) => handleOriginProvinceChange(e.target.value)}
                        disabled={loading || isWarehousePickup}
                      >
                        {provinceOptions}
                      </select>
                      {loading && (
                        <div className="absolute right-2 top-2">
                          <LoadingSpinner size="sm" />
                        </div>
                      )}
                    </div>
                    {!isWarehousePickup && errors.originProvinceCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.originProvinceCode.message}</p>
                    )}
                  </div>
                  
                  {/* Origin Regency */}
                  <div>
                    <label htmlFor="originRegency" className="block text-sm font-medium text-black mb-1">
                      Kabupaten/Kota
                    </label>
                    <div className="relative">
                      <select
                        id="originRegency"
                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        {...register('originRegencyCode', { required: !isWarehousePickup && 'Kabupaten/Kota wajib dipilih' })}
                        onChange={(e) => handleOriginRegencyChange(e.target.value)}
                        disabled={loading || originRegencies.length === 0 || isWarehousePickup}
                      >
                        {originRegencyOptions}
                      </select>
                      {loadingOriginRegencies && (
                        <div className="absolute right-2 top-2">
                          <LoadingSpinner size="sm" />
                        </div>
                      )}
                    </div>
                    {!isWarehousePickup && errors.originRegencyCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.originRegencyCode.message}</p>
                    )}
                  </div>
                  
                  {/* Origin District */}
                  <div>
                    <label htmlFor="originDistrict" className="block text-sm font-medium text-black mb-1">
                      Kecamatan
                    </label>
                    <div className="relative">
                      <select
                        id="originDistrict"
                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        {...register('originDistrictCode', { required: !isWarehousePickup && 'Kecamatan wajib dipilih' })}
                        onChange={(e) => handleOriginDistrictChange(e.target.value)}
                        disabled={(originDistricts.length === 0 && !loadingOriginDistricts) || isWarehousePickup}
                      >
                        {originDistrictOptions}
                      </select>
                      {loadingOriginDistricts && (
                        <div className="absolute right-2 top-2">
                          <LoadingSpinner size="sm" />
                        </div>
                      )}
                    </div>
                    {!isWarehousePickup && errors.originDistrictCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.originDistrictCode.message}</p>
                    )}
                  </div>
                  
                  {/* Origin Village */}
                  <div>
                    <label htmlFor="originVillage" className="block text-sm font-medium text-black mb-1">
                      Kelurahan/Desa
                    </label>
                    <div className="relative">
                      <select
                        id="originVillage"
                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        {...register('originVillageCode', { required: !isWarehousePickup && 'Kelurahan/Desa wajib dipilih' })}
                        onChange={(e) => handleOriginVillageChange(e.target.value)}
                        disabled={(originVillages.length === 0 && !loadingOriginVillages) || isWarehousePickup}
                      >
                        {originVillageOptions}
                      </select>
                      {loadingOriginVillages && (
                        <div className="absolute right-2 top-2">
                          <LoadingSpinner size="sm" />
                        </div>
                      )}
                    </div>
                    {!isWarehousePickup && errors.originVillageCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.originVillageCode.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Origin Postal Code */}
                  <div>
                    <label htmlFor="originPostalCode" className="block text-sm font-medium text-black mb-1">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      id="originPostalCode"
                      readOnly
                      {...register('originPostalCode')}
                      className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                      disabled={isWarehousePickup}
                      placeholder="Otomatis terisi setelah memilih kelurahan/desa"
                    />
                  </div>
                  
                  {/* Specific Location */}
                  <div className="md:col-span-2">
                    <label htmlFor="originLocation" className="block text-sm font-medium text-black mb-1">
                      Detail Lokasi Pengambilan
                    </label>
                    <input
                      type="text"
                      id="originLocation"
                      {...register('originLocation', { required: !isWarehousePickup && 'Detail lokasi wajib diisi' })}
                      placeholder="Detail alamat/patokan tempat pengambilan"
                      className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled={isWarehousePickup}
                    />
                    {!isWarehousePickup && errors.originLocation && (
                      <p className="mt-1 text-sm text-red-600">{errors.originLocation.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="senderName" className="block text-sm text-black mb-1">
                      Nama Pengirim
                    </label>
                    <input
                      type="text"
                      id="senderName"
                      {...register('senderName', { required: 'Nama pengirim wajib diisi' })}
                      className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled={isWarehousePickup}
                    />
                    {errors.senderName && (
                      <p className="mt-1 text-sm text-red-600">{errors.senderName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="senderPhone" className="block text-sm text-black mb-1">
                      Nomor Telepon Pengirim
                    </label>
                    <input
                      type="tel"
                      id="senderPhone"
                      {...register('senderPhone', { required: 'Nomor telepon pengirim wajib diisi' })}
                      className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled={isWarehousePickup}
                    />
                    {errors.senderPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.senderPhone.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <label htmlFor="senderAddress" className="block text-sm text-black mb-1">
                    Alamat Lengkap Pengirim
                  </label>
                  <textarea
                    id="senderAddress"
                    rows={3}
                    {...register('senderAddress', { required: !isWarehousePickup && 'Alamat pengirim wajib diisi' })}
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={isWarehousePickup}
                  ></textarea>
                  {!isWarehousePickup && errors.senderAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.senderAddress.message}</p>
                  )}
                </div>
              </>
            )}
          </div>
          
          {/* Informasi Penerima */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg text-black mb-4">Lokasi Pengantaran</h2>
            
            {/* Cascading dropdowns for Destination Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Destination Province */}
              <div>
                <label htmlFor="destinationProvince" className="block text-sm font-medium text-black mb-1">
                  Provinsi
                </label>
                <div className="relative">
                  <select
                    id="destinationProvince"
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    {...register('destinationProvince', { required: 'Provinsi wajib dipilih' })}
                    onChange={handleDestinationProvinceChange}
                  >
                    {destinationProvinceOptions}
                  </select>
                  {loading && (
                    <div className="absolute right-2 top-2">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>
                {errors.destinationProvince && (
                  <p className="mt-1 text-sm text-red-600">{errors.destinationProvince.message}</p>
                )}
              </div>
              
              {/* Destination Regency */}
              <div>
                <label htmlFor="destinationRegency" className="block text-sm font-medium text-black mb-1">
                  Kabupaten/Kota
                </label>
                <div className="relative">
                  <select
                    id="destinationRegency"
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    {...register('destinationRegency', { required: 'Kabupaten/Kota wajib dipilih' })}
                    onChange={handleDestinationRegencyChange}
                    disabled={destinationRegencies.length === 0}
                  >
                    {destinationRegencyOptions}
                  </select>
                  {loadingDestRegencies && (
                    <div className="absolute right-2 top-2">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>
                {errors.destinationRegency && (
                  <p className="mt-1 text-sm text-red-600">{errors.destinationRegency.message}</p>
                )}
              </div>
              
              {/* Destination District */}
              <div>
                <label htmlFor="destinationDistrict" className="block text-sm font-medium text-black mb-1">
                  Kecamatan
                </label>
                <div className="relative">
                  <select
                    id="destinationDistrict"
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    {...register('destinationDistrictCode', { required: 'Kecamatan wajib dipilih' })}
                    onChange={(e) => handleDestinationDistrictChange(e.target.value)}
                    disabled={destinationDistricts.length === 0}
                  >
                    {destinationDistrictOptions}
                  </select>
                  {loadingDestDistricts && (
                    <div className="absolute right-2 top-2">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>
                {errors.destinationDistrictCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.destinationDistrictCode.message}</p>
                )}
              </div>
              
              {/* Destination Village */}
              <div>
                <label htmlFor="destinationVillage" className="block text-sm font-medium text-black mb-1">
                  Kelurahan/Desa
                </label>
                <div className="relative">
                  <select
                    id="destinationVillage"
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    {...register('destinationVillageCode', { required: 'Kelurahan/Desa wajib dipilih' })}
                    onChange={(e) => handleDestinationVillageChange(e.target.value)}
                    disabled={destinationVillages.length === 0}
                  >
                    {destinationVillageOptions}
                  </select>
                  {loadingDestVillages && (
                    <div className="absolute right-2 top-2">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>
                {errors.destinationVillageCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.destinationVillageCode.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Destination Postal Code */}
              <div>
                <label htmlFor="destinationPostalCode" className="block text-sm font-medium text-black mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  id="destinationPostalCode"
                  readOnly
                  {...register('destinationPostalCode')}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                />
              </div>
              
              {/* Specific Location */}
              <div className="md:col-span-2">
                <label htmlFor="destinationLocation" className="block text-sm font-medium text-black mb-1">
                  Detail Lokasi Pengantaran
                </label>
                <input
                  type="text"
                  id="destinationLocation"
                  {...register('destinationLocation', { required: 'Detail lokasi wajib diisi' })}
                  placeholder="Detail alamat/patokan tempat pengantaran"
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.destinationLocation && (
                  <p className="mt-1 text-sm text-red-600">{errors.destinationLocation.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="recipientName" className="block text-sm text-black mb-1">
                  Nama Penerima
                </label>
                <input
                  type="text"
                  id="recipientName"
                  {...register('recipientName', { required: 'Nama penerima wajib diisi' })}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.recipientName && (
                  <p className="mt-1 text-sm text-red-600">{errors.recipientName.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="recipientPhone" className="block text-sm text-black mb-1">
                  Nomor Telepon Penerima
                </label>
                <input
                  type="tel"
                  id="recipientPhone"
                  {...register('recipientPhone', { required: 'Nomor telepon penerima wajib diisi' })}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.recipientPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.recipientPhone.message}</p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <label htmlFor="recipientAddress" className="block text-sm text-black mb-1">
                Alamat Lengkap Penerima
              </label>
              <textarea
                id="recipientAddress"
                rows={3}
                {...register('recipientAddress', { required: 'Alamat penerima wajib diisi' })}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
              {errors.recipientAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.recipientAddress.message}</p>
              )}
            </div>
          </div>
          
          {/* Tombol Aksi */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/shipments')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Menyimpan...
                </>
              ) : (
                'Buat Pengiriman'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Tambahkan konstanta GoAPI
const GOAPI_KEY = 'b63f6224-0e63-533d-a773-b7ee1ddf';
const GOAPI_BASE_URL = 'https://api.goapi.io/regional';
const GOAPI_HEADERS = {
  'x-api-key': GOAPI_KEY,
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

// Fungsi untuk mengakses GoAPI.io dengan logging yang lebih detail
async function fetchFromGoAPI(endpoint: string) {
  const url = `${GOAPI_BASE_URL}/${endpoint}`;
  console.log(`Fetching from GoAPI: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: GOAPI_HEADERS,
      mode: 'cors'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GoAPI response error (${response.status}): ${errorText}`);
      throw new Error(`GoAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`GoAPI response for ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`GoAPI request to ${url} failed:`, error);
    
    // Coba dengan CORS proxy jika ada masalah CORS
    if (error.toString().includes('CORS') || error.toString().includes('network')) {
      try {
        console.log('Trying with CORS proxy...');
        const corsProxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
        const proxyResponse = await fetch(corsProxyUrl, {
          method: 'GET',
          headers: GOAPI_HEADERS
        });
        
        if (proxyResponse.ok) {
          const proxyData = await proxyResponse.json();
          console.log('CORS proxy successful:', proxyData);
          return proxyData;
        } else {
          throw new Error(`Proxy error: ${proxyResponse.status}`);
        }
      } catch (proxyError) {
        console.error('CORS proxy also failed:', proxyError);
      }
    }
    
    throw error;
  }
}

// Update fungsi fetchProvincesData dengan debugging tambahan
async function fetchProvincesData(): Promise<Province[]> {
  try {
    console.log('Fetching provinces...');
    
    // Jangan gunakan cache dulu, pastikan mendapatkan data segar
    // if (locationCache.provinces.length > 0) {
    //   console.log('Using cached province data');
    //   return locationCache.provinces;
    // }

    try {
      console.log('Trying to fetch provinces from GoAPI...');
      // Coba ambil data dari GoAPI
      const result = await fetchFromGoAPI('provinsi');
      
      if (result && result.data && Array.isArray(result.data)) {
        console.log('Provinces loaded from GoAPI, full response:', result);
        
        // Format data ke format yang diharapkan aplikasi
        const provinces = result.data.map((province: any) => ({
          code: province.id.toString(),
          name: province.name
        }));
        
        console.log('Formatted provinces data:', provinces);
        
        // Simpan di cache global
        // setLocationCache(prev => ({...prev, provinces}));
        return provinces;
      } else {
        console.error('Invalid or empty response from GoAPI:', result);
        throw new Error('Invalid response structure from GoAPI');
      }
    } catch (goApiError) {
      console.error('GoAPI provinces fetch failed (detailed):', goApiError);
      
      // Coba dengan alternatif format endpoint
      try {
        console.log('Trying alternative GoAPI endpoint format...');
        const alternativeResult = await fetch(`${GOAPI_BASE_URL}/provinsi`, {
          method: 'GET',
          headers: {
            'x-api-key': GOAPI_KEY
          }
        });
        
        if (alternativeResult.ok) {
          const data = await alternativeResult.json();
          console.log('Alternative GoAPI call succeeded:', data);
          
          if (data && data.data && Array.isArray(data.data)) {
            const provinces = data.data.map((province: any) => ({
              code: province.id.toString(),
              name: province.name
            }));
            
            return provinces;
          }
        } else {
          console.error('Alternative GoAPI call failed:', await alternativeResult.text());
        }
      } catch (altError) {
        console.error('Alternative GoAPI approach also failed:', altError);
      }
      
      // Coba API RajaOngkir sebagai alternatif kedua
      try {
        console.log('Trying RajaOngkir API as second alternative...');
        const rajaOngkirResponse = await fetch('https://api.rajaongkir.com/starter/province', {
          method: 'GET',
          headers: {
            'key': 'your_rajaongkir_key' // Ganti dengan kunci API RajaOngkir jika ada
          }
        }).catch(e => {
          console.log('RajaOngkir fetch failed, trying public API data');
          // Jika RajaOngkir gagal, coba API publik
          return fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
        });
        
        if (rajaOngkirResponse.ok) {
          const rajaData = await rajaOngkirResponse.json();
          console.log('Alternative public API succeeded:', rajaData);
          
          // Format sesuai sumber data (RajaOngkir atau API publik)
          let provinces = [];
          if (rajaData.rajaongkir && rajaData.rajaongkir.results) {
            // Format RajaOngkir
            provinces = rajaData.rajaongkir.results.map((province: any) => ({
              code: province.province_id,
              name: province.province
            }));
          } else if (Array.isArray(rajaData)) {
            // Format API publik
            provinces = rajaData.map((province: any) => ({
              code: province.id,
              name: province.name
            }));
          }
          
          if (provinces.length > 0) {
            return provinces;
          }
        }
      } catch (publicApiError) {
        console.error('Public API also failed:', publicApiError);
      }
      
      // Lanjutkan ke fallback jika GoAPI gagal
      console.log('Proceeding with fallback API...');
    }

    // Fallback ke API geografis asli
    console.log('Fetching from original geografis API...');
    // Menggunakan API client untuk mendapatkan data provinsi
    const provinces = await fetchProvinces();
    
    if (provinces && provinces.length > 0) {
      console.log('Provinces loaded from original API:', provinces.length);
      return provinces;
    } else {
      console.warn('No provinces found from API');
      throw new Error('No provinces found from API');
    }
  } catch (error) {
    console.error('All provinces fetch attempts failed:', error);
    toast.error('Menggunakan data provinsi sementara karena API tidak tersedia');
    // Return mock provinces if API fails
    const mockData = getMockProvinces();
    return mockData;
  }
}

// Update fungsi fetchRegenciesData
async function fetchRegenciesData(provinceCode: string): Promise<Regency[]> {
  try {
    console.log(`Fetching regencies for province ${provinceCode}...`);
    
    // Cek cache dulu
    if (locationCache.regencies[provinceCode]?.length > 0) {
      console.log('Using cached regency data');
      return locationCache.regencies[provinceCode];
    }
    
    try {
      // Coba ambil data dari GoAPI
      const result = await fetchFromGoAPI(`kota?provinsi=${provinceCode}`);
      
      if (result && result.data && Array.isArray(result.data)) {
        console.log('Regencies loaded from GoAPI:', result.data.length);
        
        // Format data ke format yang diharapkan aplikasi
        const regencies = result.data.map((regency: any) => ({
          code: regency.id.toString(),
          name: regency.name,
          province_code: provinceCode
        }));
        
        // Simpan di cache
        setLocationCache(prev => ({
          ...prev, 
          regencies: {...prev.regencies, [provinceCode]: regencies}
        }));
        return regencies;
      }
    } catch (goApiError) {
      console.error('GoAPI regencies fetch failed:', goApiError);
      // Lanjutkan ke fallback jika GoAPI gagal
    }
    
    // Fallback ke API geografis asli
    const regencies = await fetchRegencies(provinceCode);
    
    if (regencies && regencies.length > 0) {
      console.log('Regencies loaded from original API:', regencies.length);
      // Simpan di cache
      setLocationCache(prev => ({
        ...prev, 
        regencies: {...prev.regencies, [provinceCode]: regencies}
      }));
      return regencies;
    } else {
      console.warn(`No regencies found from API for province ${provinceCode}`);
      throw new Error(`No regencies found from API for province ${provinceCode}`);
    }
  } catch (error) {
    console.error(`Error fetching regencies for province ${provinceCode}:`, error);
    toast.info('Menggunakan data kabupaten/kota sementara');
    // Return mock regencies if API fails
    const mockData = getMockRegencies(provinceCode);
    setLocationCache(prev => ({
      ...prev, 
      regencies: {...prev.regencies, [provinceCode]: mockData}
    }));
    return mockData;
  }
}

// Update fungsi fetchDistrictsData
async function fetchDistrictsData(regencyCode: string): Promise<District[]> {
  try {
    console.log(`Fetching districts for regency ${regencyCode}...`);
    
    // Cek cache dulu
    if (locationCache.districts[regencyCode]?.length > 0) {
      console.log('Using cached district data');
      return locationCache.districts[regencyCode];
    }
    
    try {
      // Coba ambil data dari GoAPI
      const result = await fetchFromGoAPI(`kecamatan?kota=${regencyCode}`);
      
      if (result && result.data && Array.isArray(result.data)) {
        console.log('Districts loaded from GoAPI:', result.data.length);
        
        // Format data ke format yang diharapkan aplikasi
        const districts = result.data.map((district: any) => ({
          code: district.id.toString(),
          name: district.name,
          regency_code: regencyCode
        }));
        
        // Simpan di cache
        setLocationCache(prev => ({
          ...prev, 
          districts: {...prev.districts, [regencyCode]: districts}
        }));
        return districts;
      }
    } catch (goApiError) {
      console.error('GoAPI districts fetch failed:', goApiError);
      // Lanjutkan ke fallback jika GoAPI gagal
    }
    
    // Fallback ke API geografis asli
    const districts = await fetchDistricts(regencyCode);
    
    if (districts && districts.length > 0) {
      console.log('Districts loaded from original API:', districts.length);
      // Simpan di cache
      setLocationCache(prev => ({
        ...prev, 
        districts: {...prev.districts, [regencyCode]: districts}
      }));
      return districts;
    } else {
      console.warn(`No districts found from API for regency ${regencyCode}`);
      throw new Error(`No districts found from API for regency ${regencyCode}`);
    }
  } catch (error) {
    console.error(`Error fetching districts for regency ${regencyCode}:`, error);
    // Return mock districts if API fails
    const mockData = getMockDistricts(regencyCode);
    setLocationCache(prev => ({
      ...prev, 
      districts: {...prev.districts, [regencyCode]: mockData}
    }));
    return mockData;
  }
}

// Update fungsi fetchVillagesData
async function fetchVillagesData(districtCode: string): Promise<Village[]> {
  try {
    console.log(`Fetching villages for district ${districtCode}...`);
    
    // Cek cache dulu
    if (locationCache.villages[districtCode]?.length > 0) {
      console.log('Using cached village data');
      return locationCache.villages[districtCode];
    }
    
    try {
      // Coba ambil data dari GoAPI
      const result = await fetchFromGoAPI(`kelurahan?kecamatan=${districtCode}`);
      
      if (result && result.data && Array.isArray(result.data)) {
        console.log('Villages loaded from GoAPI:', result.data.length);
        
        // Format data ke format yang diharapkan aplikasi
        const villages = result.data.map((village: any) => ({
          code: village.id.toString(),
          name: village.name,
          district_code: districtCode,
          postal_code: village.kodepos || generatePostalCode(districtCode)
        }));
        
        // Simpan di cache
        setLocationCache(prev => ({
          ...prev, 
          villages: {...prev.villages, [districtCode]: villages}
        }));
        
        console.log(`Successfully fetched ${villages.length} villages from GoAPI`);
        return villages;
      }
    } catch (goApiError) {
      console.error('GoAPI villages fetch failed:', goApiError);
      // Lanjutkan ke fallback jika GoAPI gagal
    }
    
    // Coba mengambil data dari API asli dengan beberapa kali percobaan
    let attempt = 0;
    const maxAttempts = 2;
    let lastError;
    
    while (attempt < maxAttempts) {
      try {
        attempt++;
        console.log(`Fetching villages API attempt ${attempt}/${maxAttempts}`);
        
        const response = await fetch(`/api/geografis/villages?districtCode=${districtCode}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error fetching villages: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          console.error('API returned error:', result.error || result.message);
          throw new Error(`API error: ${result.error || result.message}`);
        }
        
        if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
          console.warn('API returned empty data for villages');
          // Jika tidak ada data, lanjutkan ke percobaan berikutnya
          throw new Error('Empty data returned from API');
        }
        
        const villages = result.data.map((village: any) => ({
          code: village.code,
          name: village.name,
          district_code: village.district_code || districtCode,
          postal_code: village.postal_code || ''
        }));
        
        // Simpan di cache
        setLocationCache(prev => ({
          ...prev, 
          villages: {...prev.villages, [districtCode]: villages}
        }));
        
        console.log(`Successfully fetched ${villages.length} villages from API`);
        return villages;
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error);
        // Tunggu sebentar sebelum mencoba lagi
        if (attempt < maxAttempts) {
          const delay = Math.pow(2, attempt) * 500; // 1s, 2s
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // Jika semua percobaan gagal, gunakan API geografis yang lain
    try {
      console.log('Trying alternative geografis API...');
      const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtCode}.json`);
      
      if (response.ok) {
        const villages = await response.json();
        
        if (villages && Array.isArray(villages) && villages.length > 0) {
          const formattedVillages = villages.map((village: any) => ({
            code: village.id,
            name: village.name,
            district_code: districtCode,
            postal_code: generatePostalCode(districtCode)
          }));
          
          // Simpan di cache
          setLocationCache(prev => ({
            ...prev, 
            villages: {...prev.villages, [districtCode]: formattedVillages}
          }));
          
          console.log(`Successfully fetched ${formattedVillages.length} villages from alternative API`);
          return formattedVillages;
        }
      }
    } catch (altError) {
      console.error('Alternative API also failed:', altError);
    }
    
    // Semua upaya gagal, tampilkan pesan error
    toast.error('Gagal memuat data kelurahan/desa. Silakan coba lagi nanti.');
    throw lastError || new Error('Failed to fetch villages after multiple attempts');
  } catch (error) {
    console.error('All village fetch attempts failed:', error);
    // Jangan gunakan data dummy, kembalikan array kosong
    toast.error('Data kelurahan/desa tidak tersedia saat ini');
    return [];
  }
}

// Fungsi helper untuk membuat kode pos berdasarkan kode kecamatan
function generatePostalCode(districtCode: string): string {
  // Gunakan 3 digit pertama dari kode kecamatan sebagai dasar kode pos
  const baseCode = districtCode.substring(0, 3);
  // Tambahkan 2 digit random untuk membuat kode pos 5 digit yang unik
  const randomDigits = Math.floor(Math.random() * 90 + 10).toString();
  return `${baseCode}${randomDigits}`;
}