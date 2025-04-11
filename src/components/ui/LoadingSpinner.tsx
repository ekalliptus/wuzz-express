'use client';

import { geistSans, geistMono } from '@/lib/fonts';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

/**
 * LoadingSpinner - Komponen yang menampilkan animasi loading
 * Dapat dikonfigurasi ukuran, warna, dan teks
 */
export function LoadingSpinner({
  size = 'md',
  color = 'border-blue-600',
  text,
  fullScreen = true,
  className = ''
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const spinnerClasses = `animate-spin rounded-full border-t-2 border-b-2 ${color} ${sizeMap[size]} ${className}`;

  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className={spinnerClasses}></div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex items-center justify-center bg-gray-50`}>
        {content}
      </div>
    );
  }

  return content;
} 