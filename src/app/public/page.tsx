import Image from "next/image";
import Link from 'next/link';
import { TruckIcon, MapPinIcon, ClockIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { redirect } from 'next/navigation';

const features = [
  {
    name: 'Pengiriman Cepat',
    description: 'Barang anda akan sampai dengan cepat dan aman ke tujuan.',
    icon: TruckIcon,
  },
  {
    name: 'Jangkauan Luas',
    description: 'Melayani pengiriman ke seluruh wilayah Indonesia.',
    icon: MapPinIcon,
  },
  {
    name: 'Pelacakan Real-time',
    description: 'Pantau status pengiriman barang anda secara real-time.',
    icon: ClockIcon,
  },
  {
    name: 'Layanan Pelanggan 24/7',
    description: 'Tim kami siap membantu anda kapan saja.',
    icon: UserIcon,
  },
  {
    name: 'Keamanan Terjamin',
    description: 'Barang anda diasuransikan dan dijamin keamanannya.',
    icon: ShieldCheckIcon,
  },
];

const testimonials = [
  {
    content: 'Wuzz Express adalah jasa pengiriman terbaik yang pernah saya gunakan. Barang sampai dengan cepat dan kondisi sempurna!',
    author: 'Budi Santoso',
    role: 'Pengusaha Online',
  },
  {
    content: 'Pelayanan yang sangat baik dan profesional. Pengiriman tepat waktu dan harga sangat bersaing.',
    author: 'Siti Nuraini',
    role: 'Manager Toko Retail',
  },
  {
    content: 'Sangat puas dengan layanan pelacakan mereka. Saya bisa memantau paket saya setiap saat.',
    author: 'Reza Pratama',
    role: 'Dropshipper',
  },
];

// Server Action untuk mengarahkan ke halaman lacak
async function handleTrack(formData: FormData) {
  'use server';
  
  const trackingNumber = formData.get('tracking-number') as string;
  
  if (trackingNumber) {
    redirect(`/lacak?tracking=${encodeURIComponent(trackingNumber)}`);
  }
}

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=2070"
            alt="Ekspedisi Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 mix-blend-multiply" />
        </div>
        <div className="relative mx-auto max-w-7xl py-24 px-6 sm:py-32 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Pengiriman Barang Cepat, Aman, dan Terjangkau
          </h1>
          <p className="mt-6 max-w-xl text-xl text-blue-50">
            Wuzz Express menyediakan layanan pengiriman barang antar kota, provinsi, dan pulau dengan jaringan yang luas di seluruh Indonesia.
          </p>
          <div className="mt-10 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link
              href="/lacak"
              className="flex items-center justify-center rounded-md border border-transparent bg-white px-6 py-3 text-base font-medium text-blue-600 shadow-md hover:bg-blue-50"
            >
              Lacak Kiriman
            </Link>
            <Link
              href="/tarif"
              className="flex items-center justify-center rounded-md border border-transparent bg-blue-800 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
            >
              Cek Tarif
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Tracking Form */}
      <div className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-xl bg-blue-50 p-6 shadow-md lg:max-w-none">
            <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
              Lacak Kiriman Anda
            </h2>
            <div className="mt-6">
              <form action={handleTrack} className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <div className="flex-grow">
                  <label htmlFor="tracking-number" className="sr-only">
                    Nomor Resi
                  </label>
                  <input
                    type="text"
                    name="tracking-number"
                    id="tracking-number"
                    className="block w-full rounded-md border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                    placeholder="Masukkan nomor resi Anda"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Lacak
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Layanan Terbaik</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Mengapa Memilih Wuzz Express?
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Wuzz Express menawarkan layanan pengiriman barang dengan kualitas terbaik, didukung oleh tim profesional dan jaringan yang luas.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-blue-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Layanan Kami</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Pilihan Layanan Pengiriman
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Kami menawarkan berbagai pilihan layanan pengiriman sesuai dengan kebutuhan Anda.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col rounded-xl bg-white p-8 shadow-md ring-1 ring-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Ekspedisi Antar Kota</h3>
              <p className="mt-4 text-gray-600">
                Layanan pengiriman barang antar kota dengan waktu pengiriman 1-3 hari tergantung jarak.
              </p>
              <p className="mt-4 text-lg font-semibold text-blue-600">Mulai dari Rp 10.000/kg</p>
              <Link
                href="/layanan/antar-kota"
                className="mt-8 block rounded-md bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Selengkapnya
              </Link>
            </div>
            <div className="flex flex-col rounded-xl bg-white p-8 shadow-md ring-1 ring-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Ekspedisi Antar Pulau</h3>
              <p className="mt-4 text-gray-600">
                Layanan pengiriman barang antar pulau dengan waktu pengiriman 3-7 hari tergantung destinasi.
              </p>
              <p className="mt-4 text-lg font-semibold text-blue-600">Mulai dari Rp 15.000/kg</p>
              <Link
                href="/layanan/antar-pulau"
                className="mt-8 block rounded-md bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Selengkapnya
              </Link>
            </div>
            <div className="flex flex-col rounded-xl bg-white p-8 shadow-md ring-1 ring-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Ekspedisi Khusus</h3>
              <p className="mt-4 text-gray-600">
                Layanan pengiriman barang khusus seperti barang berharga, pecah belah, atau berukuran besar.
              </p>
              <p className="mt-4 text-lg font-semibold text-blue-600">Mulai dari Rp 20.000/kg</p>
              <Link
                href="/layanan/khusus"
                className="mt-8 block rounded-md bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Selengkapnya
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Testimoni</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Apa Kata Pelanggan Kami
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="flex flex-col justify-between rounded-xl bg-white p-8 shadow-md ring-1 ring-gray-200">
                <div>
                  <div className="flex gap-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-4 text-lg text-gray-600">{testimonial.content}</p>
                </div>
                <div className="mt-8">
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Siap mengirim barang Anda?
            <br />
            Hubungi kami sekarang.
          </h2>
          <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
            <Link
              href="/kontak"
              className="rounded-md bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Hubungi Kami
            </Link>
            <Link
              href="/tarif"
              className="text-base font-semibold leading-6 text-white"
            >
              Cek Tarif <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
