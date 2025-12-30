// components/shared/ScreenProtection.tsx
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom'; 
import { useScreenProtection } from '@/hooks/useScreenProtection';
import { requestDeviceMotionPermission } from '@/lib/security/mobileProtection';
import { Shield, Eye } from 'lucide-react';

interface ScreenProtectionProps {
  children: React.ReactNode;
  watermarkText?: string;
  userEmail?: string;
  enableWatermark?: boolean;
  enableBlurOnFocusLoss?: boolean;
  enableKeyboardBlock?: boolean;
  enableContextMenuBlock?: boolean;
  enableDevToolsDetection?: boolean;
  enableDragBlock?: boolean;
  showWarningOnAttempt?: boolean;
  videoElementRef?: React.RefObject<HTMLVideoElement>;
  className?: string;
}

export const ScreenProtection: React.FC<ScreenProtectionProps> = ({
  children,
  watermarkText = 'ALFAJR E-LEARNING',
  userEmail,
  enableWatermark = true,
  enableBlurOnFocusLoss = true,
  enableKeyboardBlock = true,
  enableContextMenuBlock = true,
  enableDevToolsDetection = true,
  enableDragBlock = true,
  showWarningOnAttempt = true,
  videoElementRef,
  className = '',
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const { isBlurred, isRecording, isDevToolsOpen, isViolation, isCoolDownActive, countdown, violationType } = useScreenProtection({
    enableWatermark,
    enableBlurOnFocusLoss,
    enableKeyboardBlock,
    enableContextMenuBlock,
    enableDevToolsDetection,
    enableDragBlock,
    watermarkText,
    videoElementRef,
    onScreenshotAttempt: () => {
      if (showWarningOnAttempt) {
        setWarningMessage('⚠️ Screenshot dilarang! ID Anda tercatat.');
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
      
      // Log to server (Silent log)
      fetch('/api/security/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'screenshot_attempt',
          page: window.location.pathname,
          details: { userAgent: navigator.userAgent, user: userEmail },
        }),
      }).catch(console.error);
    },
    onRecordingDetected: () => {
      // Sama seperti screenshot
      setWarningMessage('⚠️ Screen recording dilarang!');
      setShowWarning(true);
    },
  });

  // Request Device Motion (iOS)
  useEffect(() => {
    const handleUserInteraction = async () => {
      await requestDeviceMotionPermission();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // Generate Tiled Watermark SVG Background
  const watermarkBackground = useMemo(() => {
    if (!enableWatermark) return 'none';
    
    // Teks yang akan ditampilkan: Nama Platform + Email User
    const text = `${watermarkText} ${userEmail ? `• ${userEmail}` : ''} • DILARANG MENYEBARLUASKAN`;
    
    // Kita buat SVG string sebagai background image
    // Teknik ini sangat ringan dibanding render ribuan elemen DOM
    const svgString = `
      <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <style>
          .watermark { 
            fill: rgba(150, 150, 150, 0.12); 
            font-size: 14px; 
            font-family: Arial, sans-serif; 
            font-weight: bold;
            transform-box: fill-box;
            transform-origin: center;
          }
        </style>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="watermark" transform="rotate(-45 150 150)">
          ${text}
        </text>
      </svg>
    `;
    
    const encodedSvg = encodeURIComponent(svgString);
    return `url("data:image/svg+xml;charset=utf-8,${encodedSvg}")`;
  }, [watermarkText, userEmail, enableWatermark]);

  return (
    <>
      <style jsx global>{`
        /* 1. Disable Selection & Callouts */
        .screen-protected, .screen-protected * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-user-drag: none !important;
        }

        /* 2. Hide Scrollbars (Optional, keeps UI clean for watermark) */
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }

        /* 3. Tiled Watermark Layer */
        .tiled-watermark-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 99990; /* High z-index but below warnings */
          pointer-events: none; /* Klik tembus ke konten */
          background-image: ${watermarkBackground};
          background-repeat: repeat;
          mix-blend-mode: multiply; /* Blend dengan konten agar susah dihapus software */
        }
        
        /* Dark mode support for watermark */
        @media (prefers-color-scheme: dark) {
          .tiled-watermark-overlay {
            mix-blend-mode: overlay;
            filter: invert(1);
          }
        }

        /* 4. Invisible Noise Overlay (Anti-OCR) */
        .noise-overlay {
          position: fixed;
          inset: 0;
          z-index: 99980;
          pointer-events: none;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* --- LAYER 1: CONTENT --- */}
      <div className="screen-protected relative">
        {children}
      </div>

      {/* --- LAYER 2: NOISE (Anti-Bot/OCR) --- */}
      <div className="noise-overlay" />

      {/* --- LAYER 3: TILED WATERMARK (Identity) --- */}
      {enableWatermark && (
        <div className="tiled-watermark-overlay" />
      )}

      {/* --- LAYER 4: BLOCKING OVERLAYS (Violation) --- */}
      {(isViolation || isDevToolsOpen || isBlurred || isCoolDownActive) && ( 
          <div 
            className="fixed inset-0 z-[999999] bg-black flex items-center justify-center text-white p-6 text-center" 
          >
            <div className="max-w-md">
              <Shield size={64} className="mx-auto text-red-500 mb-6" />
              
              {isViolation ? (
                <>
                  <h2 className="text-2xl font-bold mb-2">KEAMANAN TERDETEKSI</h2>
                  <p className="text-gray-300 mb-4">
                    Sistem mendeteksi aktivitas mencurigakan (Screenshot/Recording).
                    Identitas Anda ({userEmail}) telah dicatat.
                  </p>
                  <div className="text-4xl font-bold text-red-500 my-4">{countdown}</div>
                </>
              ) : isDevToolsOpen ? (
                <>
                  <h2 className="text-2xl font-bold mb-2">Developer Tools Terdeteksi</h2>
                  <p className="text-gray-300">Harap tutup inspect element untuk melanjutkan.</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-2">Mode Keamanan</h2>
                  <p className="text-gray-300">Konten disembunyikan saat aplikasi tidak aktif.</p>
                  {isCoolDownActive && <div className="text-4xl font-bold text-yellow-500 my-4">{countdown}</div>}
                </>
              )}
            </div>
          </div>
        )}

      {/* --- LAYER 5: TOAST WARNINGS --- */}
      {showWarning && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999999] bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
          <Shield size={20} />
          <span className="font-bold text-sm">{warningMessage}</span>
        </div>
      )}

      {isRecording && (
        <div className="fixed top-4 right-4 z-[999999] bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full" />
          REC DETECTED
        </div>
      )}
      
      {ReactDOM.createPortal(<></>, document.body)}
    </>
  );
};

export default ScreenProtection;