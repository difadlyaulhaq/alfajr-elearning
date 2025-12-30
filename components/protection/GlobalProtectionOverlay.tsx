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

  return (
    <>
      <BlackScreenOverlay 
        isActive={showBlackScreen || isViolation}
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