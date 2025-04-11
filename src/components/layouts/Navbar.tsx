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
    name: 'Ekspedisi Antar Kota',
    description: 'Layanan pengiriman barang antar kota dengan harga terjangkau',
    href: '/layanan/antar-kota',
    icon: TruckIcon,
  },
  {
    name: 'Ekspedisi Antar Pulau',
    description: 'Layanan pengiriman barang antar pulau di seluruh Indonesia',
    href: '/layanan/antar-pulau',
    icon: ShoppingBagIcon,
  },
  {
    name: 'Ekspedisi Khusus',
    description: 'Layanan pengiriman khusus untuk barang dengan penanganan spesial',
    href: '/layanan/khusus',
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
          <Popover className="relative">
            <Popover.Button
              className={classNames(
                pathname.startsWith('/layanan') ? 'text-blue-600' : 'text-gray-700',
                'flex items-center gap-x-1 text-sm font-medium leading-6 hover:text-blue-600 transition-colors duration-200 outline-none'
              )}
            >
              Layanan
              <ChevronDownIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/5">
                <div className="p-4">
                  {services.map((service) => (
                    <div
                      key={service.name}
                      className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors duration-150">
                        <service.icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                      </div>
                      <div className="flex-auto">
                        <Link href={service.href} className="block font-semibold text-gray-900">
                          {service.name}
                          <span className="absolute inset-0" />
                        </Link>
                        <p className="mt-1 text-gray-600">{service.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 px-8 py-6">
                  <div className="flex items-center gap-x-3">
                    <h3 className="text-sm font-semibold leading-6 text-gray-900">Butuh bantuan?</h3>
                    <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold leading-5 text-blue-600">24/7</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Tim layanan pelanggan kami siap membantu Anda
                  </p>
                  <button
                    type="button"
                    className="mt-4 flex w-full items-center justify-center gap-x-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    Hubungi Kami
                  </button>
                </div>
              </Popover.Panel>
            </Transition>
          </Popover>

          <Link
            href="/tarif"
            className={classNames(
              pathname === '/tarif' ? 'text-blue-600' : 'text-gray-700',
              'text-sm font-medium leading-6 hover:text-blue-600 transition-colors duration-200'
            )}
          >
            Cek Tarif
          </Link>
          <Link
            href="/lacak"
            className={classNames(
              pathname === '/lacak' ? 'text-blue-600' : 'text-gray-700',
              'text-sm font-medium leading-6 hover:text-blue-600 transition-colors duration-200'
            )}
          >
            Lacak Kiriman
          </Link>
          <Link
            href="/lokasi"
            className={classNames(
              pathname === '/lokasi' ? 'text-blue-600' : 'text-gray-700',
              'text-sm font-medium leading-6 hover:text-blue-600 transition-colors duration-200'
            )}
          >
            Lokasi
          </Link>
          <Link
            href="/kontak"
            className={classNames(
              pathname === '/kontak' ? 'text-blue-600' : 'text-gray-700',
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
                <Disclosure as="div" className="-mx-3">
                  {({ open }) => (
                    <>
                      <Disclosure.Button
                        className={classNames(
                          pathname.startsWith('/layanan') ? 'text-blue-600 bg-blue-50' : 'text-gray-900',
                          'flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-medium leading-7 hover:bg-gray-50'
                        )}
                      >
                        Layanan
                        <ChevronDownIcon
                          className={classNames(
                            open ? 'rotate-180' : '',
                            'h-5 w-5 flex-none'
                          )}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="mt-2 space-y-2">
                        {services.map((service) => (
                          <Disclosure.Button
                            key={service.name}
                            as={Link}
                            href={service.href}
                            className="block rounded-lg py-2 pl-6 pr-3 text-sm font-medium leading-7 text-gray-900 hover:bg-gray-50 flex items-center gap-x-3"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <service.icon className="h-5 w-5 text-blue-600" />
                            {service.name}
                          </Disclosure.Button>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
                <Link
                  href="/tarif"
                  className={classNames(
                    pathname === '/tarif' ? 'text-blue-600 bg-blue-50' : 'text-gray-900',
                    '-mx-3 flex items-center gap-x-3 rounded-lg px-3 py-2 text-base font-medium leading-7 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cek Tarif
                </Link>
                <Link
                  href="/lacak"
                  className={classNames(
                    pathname === '/lacak' ? 'text-blue-600 bg-blue-50' : 'text-gray-900',
                    '-mx-3 flex items-center gap-x-3 rounded-lg px-3 py-2 text-base font-medium leading-7 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Lacak Kiriman
                </Link>
                <Link
                  href="/lokasi"
                  className={classNames(
                    pathname === '/lokasi' ? 'text-blue-600 bg-blue-50' : 'text-gray-900',
                    '-mx-3 flex items-center gap-x-3 rounded-lg px-3 py-2 text-base font-medium leading-7 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Lokasi
                </Link>
                <Link
                  href="/kontak"
                  className={classNames(
                    pathname === '/kontak' ? 'text-blue-600 bg-blue-50' : 'text-gray-900',
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