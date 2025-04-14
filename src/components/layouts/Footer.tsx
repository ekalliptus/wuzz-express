import Link from 'next/link';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, TruckIcon } from '@heroicons/react/24/outline';

const navigation = {
  tentang: [
    { name: 'Tentang Kami', href: '/tentang' },
    { name: 'Karir', href: '/karir' },
    { name: 'Berita', href: '/berita' },
  ],
  layanan: [
    { name: 'Reguler', href: '/layanan/reguler' },
    { name: 'Ekonomi', href: '/layanan/ekonomi' },
    { name: 'Express', href: '/layanan/express' },
  ],
  bantuan: [
    { name: 'FAQ', href: '/bantuan/faq' },
    { name: 'Cara Kirim', href: '/bantuan/cara-kirim' },
    { name: 'Kebijakan Privasi', href: '/bantuan/kebijakan-privasi' },
    { name: 'Syarat & Ketentuan', href: '/bantuan/syarat-ketentuan' },
  ],
  sosial: [
    { name: 'Instagram', href: 'https://instagram.com/wuzzexpress' },
    { name: 'Facebook', href: 'https://facebook.com/wuzzexpress' },
    { name: 'Twitter', href: 'https://twitter.com/wuzzexpress' },
    { name: 'YouTube', href: 'https://youtube.com/wuzzexpress' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-24">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center">
              <TruckIcon className="h-8 w-auto text-blue-500" />
              <span className="ml-2 text-xl font-bold text-white">Wuzz</span>
            </div>
            <p className="text-sm leading-6 text-gray-300">
              Jasa ekspedisi terpercaya dengan jangkauan luas di seluruh Indonesia. Cepat, aman, dan terjangkau.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <p className="ml-3 text-sm text-gray-300">
                  Jl. Ekspedisi No. 123, Kotabaru, Jakarta Pusat, 10350
                </p>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <p className="ml-3 text-sm text-gray-300">+62 812-3456-7890</p>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <p className="ml-3 text-sm text-gray-300">info@wuzz.co.id</p>
              </div>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Tentang</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.tentang.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Layanan</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.layanan.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Bantuan</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.bantuan.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Ikuti Kami</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.sosial.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-gray-700 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-gray-400">
            &copy; {new Date().getFullYear()} Wuzz Express. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
} 