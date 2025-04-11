'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/layouts/Navbar";
import { geistSans, geistMono } from "@/lib/fonts";

type BaseLayoutProps = {
  children: React.ReactNode;
  showNavbar?: boolean;
  additionalBodyClasses?: string;
  sidebar?: React.ReactNode;
};

/**
 * BaseLayout - Komponen layout dasar yang dapat diekstend oleh layout lain
 * Menyediakan struktur HTML dasar dengan font dan styling
 */
export default function BaseLayout({
  children,
  showNavbar = true,
  additionalBodyClasses = '',
  sidebar = null,
}: BaseLayoutProps) {
  const [sidebarState, setSidebarState] = useState<'open' | 'collapsed'>('open');
  const baseBodyClasses = `${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`;
  const bodyClasses = `${baseBodyClasses} ${additionalBodyClasses}`.trim();

  // Cek status sidebar dari localStorage
  useEffect(() => {
    const checkSidebarState = () => {
      const adminSidebar = localStorage.getItem('admin_sidebar_open');
      const staffSidebar = localStorage.getItem('staff_sidebar_open');
      
      const path = window.location.pathname;
      const isAdminPath = path.includes('/admin');
      const isStaffPath = path.includes('/staff');
      
      let isOpen = true;
      
      if (isAdminPath && adminSidebar !== null) {
        isOpen = adminSidebar === 'true';
      } else if (isStaffPath && staffSidebar !== null) {
        isOpen = staffSidebar === 'true';
      }
      
      setSidebarState(isOpen ? 'open' : 'collapsed');
    };
    
    // Check pada awal render
    checkSidebarState();
    
    // Listener untuk custom event dari sidebar
    const handleSidebarChange = (event: CustomEvent) => {
      const { open } = event.detail;
      setSidebarState(open ? 'open' : 'collapsed');
    };
    
    // Listener untuk storage event (jika ada tab lain yang mengubah)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'admin_sidebar_open' || event.key === 'staff_sidebar_open') {
        checkSidebarState();
      }
    };
    
    // Register event listeners
    window.addEventListener('sidebarStateChange', handleSidebarChange as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className={bodyClasses}>
      {showNavbar && <Navbar />}
      <div className="flex flex-1 w-full bg-white relative">
        {sidebar && (
          <div className="sidebar-container">
            {sidebar}
          </div>
        )}
        <main 
          className="flex-grow bg-white transition-all duration-300 p-4 overflow-auto w-full"
          data-sidebar-state={sidebar ? sidebarState : 'none'}
          style={{
            paddingLeft: sidebar 
              ? (sidebarState === 'open' 
                ? 'calc(var(--sidebar-width-open) + 1rem)' 
                : 'calc(var(--sidebar-width-collapsed) + 1rem)')
              : '1rem'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
} 