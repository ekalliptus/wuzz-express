'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  TruckIcon, 
  UserIcon, 
  DocumentTextIcon, 
  MapPinIcon,
  CogIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

/**
 * Helper untuk menggabungkan class names secara kondisional
 */
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * AdminSidebar - Komponen sidebar untuk area admin
 */
export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Navigasi admin yang dimemoize
  const navigation = useMemo(() => [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: HomeIcon, 
      current: pathname === '/admin/dashboard' 
    },
    { 
      name: 'Pengiriman', 
      href: '/admin/shipments', 
      icon: TruckIcon, 
      current: pathname?.startsWith('/admin/shipments')
    },
    { 
      name: 'Pelanggan', 
      href: '/admin/customers', 
      icon: UserIcon, 
      current: pathname?.startsWith('/admin/customers')
    },
    { 
      name: 'Laporan', 
      href: '/admin/reports', 
      icon: DocumentTextIcon, 
      current: pathname?.startsWith('/admin/reports')
    },
    { 
      name: 'Lokasi', 
      href: '/admin/locations', 
      icon: MapPinIcon, 
      current: pathname?.startsWith('/admin/locations')
    },
    { 
      name: 'Pengaturan', 
      href: '/admin/settings', 
      icon: CogIcon, 
      current: pathname?.startsWith('/admin/settings') 
    },
  ], [pathname]);

  // Handler untuk toggle collapsed state
  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  return (
    <aside className={classNames(
      "fixed top-0 left-0 z-40 h-screen transition-width duration-300 bg-white border-r border-gray-200 pt-16 lg:relative",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="h-full px-3 pb-4 overflow-y-auto">
        <button
          onClick={toggleCollapsed}
          className="absolute top-5 right-2 p-1 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
        
        <ul className="space-y-2 mt-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={classNames(
                  item.current
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  "flex items-center p-2 rounded-lg",
                  collapsed ? "justify-center px-1" : ""
                )}
              >
                <item.icon
                  className={classNames(
                    item.current ? "text-blue-600" : "text-gray-500",
                    "w-5 h-5 transition duration-75",
                    collapsed ? "mx-auto" : "mr-2"
                  )}
                  aria-hidden="true"
                />
                {!collapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
} 