'use client';

import { Fragment, useState } from 'react';
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  TruckIcon,
  MapPinIcon,
  TicketIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    icon: TruckIcon,
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
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Wuzz Express</span>
            <div className="flex items-center">
              <TruckIcon className="h-8 w-auto text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Wuzz</span>
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
        <Popover.Group className="hidden lg:flex lg:gap-x-12">
          <Link
            href="/"
            className={classNames(
              pathname === '/' ? 'text-blue-600' : 'text-gray-900',
              'text-sm font-semibold leading-6 hover:text-blue-600'
            )}
          >
            Beranda
          </Link>
          <Popover className="relative">
            <Popover.Button
              className={classNames(
                pathname.startsWith('/layanan') ? 'text-blue-600' : 'text-gray-900',
                'flex items-center gap-x-1 text-sm font-semibold leading-6 hover:text-blue-600'
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
              <Popover.Panel className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5">
                <div className="p-4">
                  {services.map((service) => (
                    <div
                      key={service.name}
                      className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50"
                    >
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
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
              </Popover.Panel>
            </Transition>
          </Popover>

          <Link
            href="/tarif"
            className={classNames(
              pathname === '/tarif' ? 'text-blue-600' : 'text-gray-900',
              'text-sm font-semibold leading-6 hover:text-blue-600'
            )}
          >
            Cek Tarif
          </Link>
          <Link
            href="/lacak"
            className={classNames(
              pathname === '/lacak' ? 'text-blue-600' : 'text-gray-900',
              'text-sm font-semibold leading-6 hover:text-blue-600'
            )}
          >
            Lacak Kiriman
          </Link>
          <Link
            href="/lokasi"
            className={classNames(
              pathname === '/lokasi' ? 'text-blue-600' : 'text-gray-900',
              'text-sm font-semibold leading-6 hover:text-blue-600'
            )}
          >
            Lokasi
          </Link>
          <Link
            href="/kontak"
            className={classNames(
              pathname === '/kontak' ? 'text-blue-600' : 'text-gray-900',
              'text-sm font-semibold leading-6 hover:text-blue-600'
            )}
          >
            Kontak
          </Link>
        </Popover.Group>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link
            href="/auth/login"
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600"
          >
            Masuk <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </nav>
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Wuzz Express</span>
              <div className="flex items-center">
                <TruckIcon className="h-8 w-auto text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Wuzz</span>
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
                    pathname === '/' ? 'text-blue-600' : 'text-gray-900',
                    '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-gray-50'
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
                          pathname.startsWith('/layanan') ? 'text-blue-600' : 'text-gray-900',
                          'flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 hover:bg-gray-50'
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
                            className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                            onClick={() => setMobileMenuOpen(false)}
                          >
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
                    pathname === '/tarif' ? 'text-blue-600' : 'text-gray-900',
                    '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cek Tarif
                </Link>
                <Link
                  href="/lacak"
                  className={classNames(
                    pathname === '/lacak' ? 'text-blue-600' : 'text-gray-900',
                    '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Lacak Kiriman
                </Link>
                <Link
                  href="/lokasi"
                  className={classNames(
                    pathname === '/lokasi' ? 'text-blue-600' : 'text-gray-900',
                    '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Lokasi
                </Link>
                <Link
                  href="/kontak"
                  className={classNames(
                    pathname === '/kontak' ? 'text-blue-600' : 'text-gray-900',
                    '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Kontak
                </Link>
              </div>
              <div className="py-6">
                <Link
                  href="/auth/login"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Masuk
                </Link>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
} 