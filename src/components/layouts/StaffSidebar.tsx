'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  HomeIcon, 
  TruckIcon, 
  UserIcon, 
  DocumentTextIcon, 
  CogIcon,
  XMarkIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

/**
 * Helper untuk menggabungkan class names secara kondisional
 */
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// Key untuk menyimpan status sidebar di localStorage
const SIDEBAR_STATE_KEY = 'staff_sidebar_open';

/**
 * StaffSidebar - Komponen sidebar untuk area staff
 */
export default function StaffSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthContext();

  // Inisialisasi status sidebar dari localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true');
    }
  }, []);

  // Navigasi staff yang dimemoize
  const navigation = useMemo(() => [
    { 
      name: 'Dashboard', 
      href: '/staff/dashboard', 
      icon: HomeIcon, 
      current: pathname === '/staff/dashboard' 
    },
    { 
      name: 'Pengiriman', 
      href: '/staff/shipments', 
      icon: TruckIcon, 
      current: pathname?.startsWith('/staff/shipments')
    },
    { 
      name: 'Pelanggan', 
      href: '/staff/customers', 
      icon: UserIcon, 
      current: pathname?.startsWith('/staff/customers')
    },
    { 
      name: 'Lacak', 
      href: '/staff/tracking', 
      icon: DocumentTextIcon, 
      current: pathname?.startsWith('/staff/tracking')
    },
    { 
      name: 'Profil', 
      href: '/staff/profile', 
      icon: CogIcon, 
      current: pathname?.startsWith('/staff/profile') 
    },
  ], [pathname]);

  // Toggle sidebar dan simpan ke localStorage
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => {
      const newState = !prev;
      localStorage.setItem(SIDEBAR_STATE_KEY, newState.toString());
      
      // Kirim custom event untuk memberi tahu komponen lain tentang perubahan status sidebar
      window.dispatchEvent(new CustomEvent('sidebarStateChange', {
        detail: { open: newState, type: 'staff' }
      }));
      
      return newState;
    });
  }, []);

  // Logout handler
  const handleLogout = useCallback(() => {
    logout();
    router.push('/auth/login');
  }, [logout, router]);

  return (
    <>
      {/* Toggle Button untuk Mobile */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-label={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
      >
        {sidebarOpen ? (
          <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={classNames(
          sidebarOpen ? 'translate-x-0 w-64' : 'translate-x-0 w-16 sm:translate-x-0',
          'top-0 left-0 z-40 h-full pt-5 transition-all duration-300 bg-white border-r border-gray-200 lg:translate-x-0 shadow-md'
        )}
        style={{
          position: 'absolute',
          width: sidebarOpen ? 'var(--sidebar-width-open)' : 'var(--sidebar-width-collapsed)'
        }}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white flex flex-col">
          <div className={classNames(
            "flex items-center mb-4 pt-2 pb-3 border-b border-gray-200",
            sidebarOpen ? "justify-between" : "justify-center"
          )}>
            {sidebarOpen ? (
              <>
                <div className="flex items-center">
                  <div className="relative h-8 w-8 mr-2">
                    <TruckIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <span className="self-center text-xl font-semibold whitespace-nowrap bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Wuzz Staff</span>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-1 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center">
                  <TruckIcon className="h-8 w-8 text-blue-600 mb-2" />
                  <button
                    onClick={toggleSidebar}
                    className="p-1 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
          
          {user && sidebarOpen && (
            <div className="mb-2 p-2 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-0">Masuk sebagai</p>
              <p className="text-base font-semibold text-gray-900 mt-0">{user.name}</p>
              <p className="text-xs text-gray-500 mt-0">{user.email}</p>
              <button 
                onClick={handleLogout}
                className="mt-1 text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Keluar
              </button>
            </div>
          )}
          
          {user && !sidebarOpen && (
            <div className="flex justify-center mb-2 p-2 border-b border-gray-200">
              <button onClick={handleLogout} title="Keluar">
                <UserCircleIcon className="w-6 h-6 text-gray-500 hover:text-red-600" />
              </button>
            </div>
          )}
          
          <ul className="space-y-1 font-medium">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    'group flex items-center p-2 rounded-lg transition-colors duration-150',
                    !sidebarOpen ? 'justify-center' : ''
                  )}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <item.icon
                    className={classNames(
                      item.current ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-900',
                      'w-5 h-5 flex-shrink-0',
                      sidebarOpen ? 'me-2' : ''
                    )}
                    aria-hidden="true"
                  />
                  {sidebarOpen && (
                    <span>{item.name}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
} 