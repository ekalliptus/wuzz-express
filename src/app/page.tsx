import { Suspense } from 'react';
import PublicPage from '@/app/public/page';
import BaseLayout from '@/components/layouts/BaseLayout';

export default function RootPage() {
  return (
    <BaseLayout>
      <Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      }>
        <PublicPage />
      </Suspense>
    </BaseLayout>
  );
} 