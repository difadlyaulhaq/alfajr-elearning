"use client";

import { useEffect, useState } from 'react';
import { isMobileDevice, isNativeApp } from '@/lib/security/mobileProtection';
import DownloadAppButton from '@/components/shared/DownloadAppButton';

export default function AppEnforcer() {
  const [shouldBlock, setShouldBlock] = useState(false);

  useEffect(() => {
    // Only block if on mobile web (not desktop, not native app)
    const checkEnvironment = () => {
      const isMobile = isMobileDevice();
      const isNative = isNativeApp();
      
      // Jika Mobile tapi BUKAN Native App -> Block
      if (isMobile && !isNative) {
        setShouldBlock(true);
      }
    };

    checkEnvironment();
  }, []);

  if (!shouldBlock) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-white text-black flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      
      <h1 className="text-2xl font-bold mb-4">
        Akses Terbatas di Browser
      </h1>
      
      <p className="text-gray-600 mb-8 max-w-sm">
        Demi keamanan konten dan pengalaman terbaik, silakan akses materi pembelajaran melalui aplikasi resmi kami.
      </p>

      <div className="w-full max-w-xs space-y-4">
        <DownloadAppButton />
        
        <div className="text-xs text-gray-400 mt-8">
          Sudah install? Buka aplikasi Alfajr Learning di HP Anda.
        </div>
      </div>
    </div>
  );
}
