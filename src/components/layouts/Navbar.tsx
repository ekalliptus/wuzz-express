'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  TruckIcon,
  MapPinIcon,
  TicketIcon,
  UserIcon,
  PhoneIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const services = [
  {
    name: 'Reguler',
    description: 'Layanan pengiriman barang antar kota dengan harga terjangkau',
    href: '/layanan/reguler',
    icon: TruckIcon,
  },
  {
    name: 'Ekonomi',
    description: 'Layanan pengiriman barang antar pulau di seluruh Indonesia',
    href: '/layanan/ekonomi',
    icon: ShoppingBagIcon,
  },
  {
    name: 'Express',
    description: 'Layanan pengiriman khusus untuk barang dengan penanganan spesial',
    href: '/layanan/express',
    icon: TicketIcon,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Deteksi scroll untuk mengubah tampilan navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={classNames(
      scrolled ? 'shadow-md py-2' : 'py-4',
      'sticky top-0 z-50 bg-white border-b border-gray-200 transition-all duration-300'
    )}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center">
            <span className="sr-only">Wuzz Express</span>
            <div className="flex items-center">
              <div className="relative h-10 w-10 overflow-hidden">
                <Image 
                  src="/wuzz-logo.svg"
                  alt="Wuzz Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 text-blue-600 absolute inset-0 m-auto"
                  priority
                />
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Wuzz</span>
              <span className="hidden sm:inline-block text-sm font-semibold ml-1 text-gray-600">Express</span>
            </div>
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Buka menu utama</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <Popover.Group className="hidden lg:flex lg:gap-x-8">
          <Link
            href="/"
            className={classNames(
              pathname === '/' ? 'text-blue-600' : 'text-gray-700',
              'text-sm font-medium leading-6 hover:text-blue-600 transition-colors duration-200 flex items-center'
            )}
          >
            Beranda
          </Link>
          <Link
            href="/#layanan"
            className={classNames(
              pathname.startsWith('/layanan') ? 'text-blue-600' : 'text-gray-700',
              'text-sm font-medium leading-6 hover:text-blue-600 transition-colors duration-200 flex items-center'
            )}
          >
            Layanan
          </Link>

          <Link
            href="/public/tarif"
            className={classNames(
              pathname === '/public/tarif' ? 'text-blue-600' : 'text-gray-700',
              'text-sm font-medium leading-6 hover:text-blue-600 transition-colors duration-200'
            )}
          >
            Cek Tarif
          </Link>
          <Link
            href="/public/lacak"
            className={classNames(
              pathname === '/public/lacak' ? 'text-blue-600' : 'text-gray-700',
              'text-sm font-medium leading-6 hover:text-blue-600 transition-colors duration-200'
            )}
          >
            Lacak Kiriman
          </Link>
          <Link
            href="/public/lokasi"
            className={classNames(
              pathname === '/public/lokasi' ? 'text-blue-600' : 'text-gray-700',
              'text-sm font-medium leading-6 hover:text-blue-600 transition-colors duration-200'
            )}
          >
            Lokasi
          </Link>
          <Link
            href="/public/kontak"
            className={classNames(
              pathname === '/public/kontak' ? 'text-blue-600' : 'text-gray-700',
              'text-sm font-medium leading-6 hover:text-blue-600 transition-colors duration-200'
            )}
          >
            Kontak
          </Link>
        </Popover.Group>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center gap-x-1"
          >
            <UserIcon className="h-5 w-5" />
            <span>Admin</span>
          </Link>
        </div>
      </nav>
      
      {/* Mobile menu */}
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
              <span className="sr-only">Wuzz Express</span>
              <div className="flex items-center">
                <Image 
                  src="/wuzz-logo.svg"
                  alt="Wuzz Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 text-blue-600"
                  priority
                />
              </div>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Tutup menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Link
                  href="/"
                  className={classNames(
                    pathname === '/' ? 'text-blue-600 bg-blue-50' : 'text-gray-900',
                    '-mx-3 flex items-center gap-x-3 rounded-lg px-3 py-2 text-base font-medium leading-7 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Beranda
                </Link>
                <Link
                  href="/#layanan"
                  className={classNames(
                    pathname.startsWith('/layanan') ? 'text-blue-600 bg-blue-50' : 'text-gray-900',
                    '-mx-3 flex items-center gap-x-3 rounded-lg px-3 py-2 text-base font-medium leading-7 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Layanan
                </Link>
                <Link
                  href="/public/tarif"
                  className={classNames(
                    pathname === '/public/tarif' ? 'text-blue-600 bg-blue-50' : 'text-gray-900',
                    '-mx-3 flex items-center gap-x-3 rounded-lg px-3 py-2 text-base font-medium leading-7 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cek Tarif
                </Link>
                <Link
                  href="/public/lacak"
                  className={classNames(
                    pathname === '/public/lacak' ? 'text-blue-600 bg-blue-50' : 'text-gray-900',
                    '-mx-3 flex items-center gap-x-3 rounded-lg px-3 py-2 text-base font-medium leading-7 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Lacak Kiriman
                </Link>
                <Link
                  href="/public/lokasi"
                  className={classNames(
                    pathname === '/public/lokasi' ? 'text-blue-600 bg-blue-50' : 'text-gray-900',
                    '-mx-3 flex items-center gap-x-3 rounded-lg px-3 py-2 text-base font-medium leading-7 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Lokasi
                </Link>
                <Link
                  href="/public/kontak"
                  className={classNames(
                    pathname === '/public/kontak' ? 'text-blue-600 bg-blue-50' : 'text-gray-900',
                    '-mx-3 flex items-center gap-x-3 rounded-lg px-3 py-2 text-base font-medium leading-7 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Kontak
                </Link>
              </div>
              <div className="py-6">
                <Link
                  href="/auth/login"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-medium leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
} 