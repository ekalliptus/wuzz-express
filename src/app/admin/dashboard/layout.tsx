'use client';

/**
 * AdminDashboardLayout - Layout untuk dashboard admin
 * Menyediakan area konten saja karena sidebar sudah ada di dashboard page
 */
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <main className="flex-1">{children}</main>
    </div>
  );
} 