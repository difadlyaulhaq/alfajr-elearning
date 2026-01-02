'use client';

import { useEffect, useState } from 'react';
import { isMobileDevice } from '@/lib/security/mobileProtection';
import { Capacitor } from '@capacitor/core';
import DownloadAppButton from './DownloadAppButton';
import Image from 'next/image';

export default function PWAEnforcer({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if device is mobile
    const mobile = isMobileDevice();
    setIsMobile(mobile);

    // Check if running in Native App (Android APK / iOS App)
    const runningNative = Capacitor.isNativePlatform();
    setIsNative(runningNative);
  }, []);

  if (!mounted) return <>{children}</>;

  // Debug backdoor: Allow access if ?dev=true is in URL (remove in production)
  if (typeof window !== 'undefined' && window.location.search.includes('dev=true')) {
    return <>{children}</>;
  }

  // LOGIC: If Mobile AND NOT Native App, Block access.
  // This forces users to use the APK for security.
  // EXCEPTION: Allow login page and auth callbacks to support "Login with Browser" flow.
  const isLoginPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/login');
  const isAuthFlow = typeof window !== 'undefined' && window.location.search.includes('return_to');

  if (isMobile && !isNative && !isLoginPage && !isAuthFlow) {
    return (
      <div className="fixed inset-0 bg-white z-[99999] flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-8">
          {/* Official Logo */}
          <div className="relative w-48 h-16 mx-auto">
            <Image 
              src="/logo-alfajr.png" 
              alt="Alfajr E-Learning" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        
        <div className="mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            Akses Terbatas
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Instalasi Aplikasi Diperlukan</h1>
        <p className="text-gray-600 mb-8 max-w-sm leading-relaxed">
          Demi keamanan data dan pengalaman belajar yang maksimal, platform ini hanya dapat diakses melalui aplikasi resmi.
        </p>
        
        {/* Main Install Button */}
        <div className="w-full max-w-xs space-y-4">
           <DownloadAppButton 
             variant="primary" 
             className="w-full py-4 text-lg font-bold shadow-xl shadow-[#C5A059]/20" 
             text="Download Aplikasi Android"
             apkUrl="/app-release.apk"
           /> 
           
           <p className="text-[11px] text-gray-400">
             *Wajib untuk pengguna Android
           </p>
        </div>
        
        {/* Manual hint in case prompt doesn't show */}
        {/* <div className="mt-12 p-4 bg-gray-50 rounded-2xl border border-gray-100 max-w-sm">
          <p className="text-xs text-gray-500 font-medium mb-1">Panduan Manual:</p>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Jika tombol di atas tidak merespon, buka menu browser Anda (ikon ⋮ atau ⎋) lalu pilih <span className="text-gray-700 font-bold">"Add to Home Screen"</span> atau <span className="text-gray-700 font-bold">"Install App"</span>.
          </p>
        </div> */}
      </div>
    );
  }

  return <>{children}</>;
}
