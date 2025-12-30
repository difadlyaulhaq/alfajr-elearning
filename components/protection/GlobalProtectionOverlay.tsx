// components/protection/GlobalProtectionOverlay.tsx
"use client";

import { useEffect, useState } from 'react';
import { useScreenProtection } from '@/hooks/useScreenProtection';
import BlackScreenOverlay from './BlackScreenOverlay';

export default function GlobalProtectionOverlay() {
  const {
    showBlackScreen,
    blackScreenReason,
    blackScreenMerk,
    isViolation,
    trustLevel,
  } = useScreenProtection();

  const [protectionLevel, setProtectionLevel] = useState<'low' | 'medium' | 'high'>('high');

  // Adjust protection based on device
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const ua = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad/.test(ua)) {
      setProtectionLevel('high'); // iOS requires stronger protection
    } else if (/samsung/.test(ua)) {
      setProtectionLevel('high'); // Samsung has advanced screenshot features
    } else {
      setProtectionLevel('medium');
    }
  }, []);

  if (trustLevel === 'banned') {
    return (
      <div className="fixed inset-0 z-[999999] bg-black flex items-center justify-center text-center p-8">
        <div className="max-w-md">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-3xl font-bold text-red-500 mb-4">Akses Ditangguhkan</h1>
          <p className="text-gray-300 mb-6">
            Akun Anda telah ditangguhkan sementara karena terdeteksi melakukan pelanggaran keamanan (screenshot/recording) berulang kali.
          </p>
          <p className="text-sm text-gray-500">
            Silakan hubungi administrator untuk memulihkan akses Anda.
          </p>
          <div className="mt-8">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white text-sm transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <BlackScreenOverlay 
        isActive={showBlackScreen || isViolation || trustLevel === 'violation'}
        duration={protectionLevel === 'high' ? 15000 : 10000}
        watermark={`ALFAJR E-LEARNING • ${blackScreenMerk} • ${protectionLevel.toUpperCase()} PROTECTION`}
        onComplete={() => {
          console.log('Protection sequence completed');
        }}
      />
      
      {/* Additional protection elements */}
      {protectionLevel === 'high' && (
        <div className="fixed inset-0 pointer-events-none z-[99998]">
          {/* Subtle noise overlay */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }} />
        </div>
      )}
    </>
  );
}