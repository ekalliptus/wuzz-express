import BaseLayout from '@/components/layouts/BaseLayout';
import Footer from '@/components/layouts/Footer';

/**
 * PublicLayout - Layout untuk halaman-halaman frontend dengan footer
 * Menggunakan BaseLayout dan menambahkan Footer
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BaseLayout>
      <div className="bg-white min-h-screen">
        {children}
      </div>
      <Footer />
    </BaseLayout>
  );
} 