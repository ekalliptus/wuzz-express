'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClientRedirectProps {
  redirectTo: string;
}

export default function ClientRedirect({ redirectTo }: ClientRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(redirectTo);
  }, [router, redirectTo]);

  // Komponen ini tidak merender apa-apa
  return null;
} 