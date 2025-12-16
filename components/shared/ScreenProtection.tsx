// components/shared/ScreenProtection.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useScreenProtection } from '@/hooks/useScreenProtection';
import { AntiScreenshotOverlay } from './AntiScreenshotOverlay';
import { Shield, Eye, EyeOff } from 'lucide-react';

interface ScreenProtectionProps {
  children: React.ReactNode;
  watermarkText?: string;
  enableWatermark?: boolean;
  enableBlurOnFocusLoss?: boolean;
  enableKeyboardBlock?: boolean;
  enableContextMenuBlock?: boolean;
  enableDevToolsDetection?: boolean;
  showWarningOnAttempt?: boolean;
  className?: string;
}

export const ScreenProtection: React.FC<ScreenProtectionProps> = ({
  children,
  watermarkText = 'ALFAJR E-LEARNING - PROTECTED',
  enableWatermark = true,
  enableBlurOnFocusLoss = true,
  enableKeyboardBlock = true,
  enableContextMenuBlock = true,
  enableDevToolsDetection = true,
  showWarningOnAttempt = true,
  className = '',
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [watermarkPositions, setWatermarkPositions] = useState<
    Array<{ top: number; left: number; rotation: number; opacity: number }>
  >([]);
  const [isScreenshotting, setIsScreenshotting] = useState(false);

  const { isBlurred, isRecording, attemptCount } = useScreenProtection({
    enableWatermark,
    enableBlurOnFocusLoss,
    enableKeyboardBlock,
    enableContextMenuBlock,
    enableDevToolsDetection,
    watermarkText,
    onScreenshotAttempt: () => {
      // Trigger black screen overlay
      setIsScreenshotting(true);
      setTimeout(() => setIsScreenshotting(false), 2000);
      
      if (showWarningOnAttempt) {
        setWarningMessage('⚠️ Screenshot tidak diperbolehkan!');
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
      
      // Log to server
      fetch('/api/security/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'screenshot_attempt',
          page: window.location.pathname,
          details: { userAgent: navigator.userAgent },
        }),
      }).catch(console.error);
    },
    onRecordingDetected: () => {
      if (showWarningOnAttempt) {
        setWarningMessage('⚠️ Screen recording terdeteksi!');
        setShowWarning(true);
      }
      
      // Log to server
      fetch('/api/security/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recording_detected',
          page: window.location.pathname,
          details: { userAgent: navigator.userAgent },
        }),
      }).catch(console.error);
    },
  });

  // Generate watermark positions - optimized, less frequent updates
  useEffect(() => {
    const generatePositions = () => {
      const positions = [];
      // Reduced from 8 to 5 for better performance
      for (let i = 0; i < 5; i++) {
        positions.push({
          top: Math.random() * 90,
          left: Math.random() * 90,
          rotation: Math.random() * 360,
          opacity: 0.04 + Math.random() * 0.04,
        });
      }
      setWatermarkPositions(positions);
    };

    generatePositions();
    // Update posisi setiap 15 detik (lebih jarang untuk performa)
    const interval = setInterval(generatePositions, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style jsx global>{`
        /* Cegah user select dan copy */
        .screen-protected {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }

        /* Cegah screenshot di beberapa browser mobile */
        .screen-protected * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* CSS untuk deteksi screenshot di iOS */
        @media only screen and (max-width: 768px) {
          .screen-protected {
            -webkit-user-select: none;
            -webkit-touch-callout: none;
          }
        }
- optimized with GPU acceleration */
        .blur-transition {
          transition: filter 0.2s ease-out;
          will-change: filter;
        }

        /* Watermark animation - simplified for performance */
        @keyframes float-watermark {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .watermark-text {
          animation: float-watermark 20s ease-in-out infinite;
          pointer-events: none;
          font-family: 'Arial Black', sans-serif;
          font-weight: bold;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          will-change: transform;
          backface-visibility: hidden;
          transform: translateZ(0
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }- GPU accelerated */
        .screenshot-black-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #000000;
          z-index: 999999;
          pointer-events: none;
          will-change: opacity;
          transform: translateZ(0);
          backface-visibility: hidden
          z-index: 999999;
          pointer-events: none;
        }

        /* Warning pulse animation */
        @keyframes pulse-warning {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }

        .warning-pulse {
          animation: pulse-warning 0.5s ease-in-out 3;
        }

        /* Overlay untuk mobile screenshot detection */
        @media (max-width: 768px) {
          .screen-protected::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 9999;
            background: transparent;
          }
        }
      `}</style>

      <div
        className={`screen-protected relative ${className} ${
          isBlurred ? 'blur-transition' : ''
        }`}
        style={{
          filter: isBlurred ? 'blur(20px)' : isScreenshotting ? 'brightness(0)' : 'none',
          willChange: isBlurred || isScreenshotting ? 'filter' : 'auto',
          transform: 'translateZ(0)',
        }}
      >
        {/* Anti-Screenshot Overlays */}
        <AntiScreenshotOverlay />

        {/* Watermark Layer - optimized rendering */}
        {enableWatermark && watermarkPositions.length > 0 && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {watermarkPositions.map((pos, index) => (
              <div
                key={index}
                className="watermark-text absolute text-gray-400 whitespace-nowrap"
                style={{
                  top: `${pos.top}%`,
                  left: `${pos.left}%`,
                  transform: `rotate(${pos.rotation}deg) translateZ(0)`,
                  opacity: pos.opacity,
                  fontSize: '22px',
                  animationDelay: `${index * 3}s`,
                }}
              >
                {watermarkText}
              </div>
            ))}
          </div>
        )}

        {/* Recording Warning */}
        {isRecording && (
          <div className="fixed top-4 right-4 z-[9999] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
            <Eye size={20} />
            <span className="font-bold">Recording Detected!</span>
          </div>
        )}

        {/* Blur Overlay dengan pesan */}
        {isBlurred && (
          <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
              <EyeOff size={64} className="mx-auto mb-4 text-[#C5A059]" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Konten Dilindungi
              </h2>
              <p className="text-gray-600">
                Konten akan muncul kembali saat Anda kembali ke halaman ini
              </p>
            </div>
          </div>
        )}

        {/* Warning Toast */}
        {showWarning && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg warning-pulse">
            <div className="flex items-center gap-3">
              <Shield size={24} />
              <span className="font-bold text-lg">{warningMessage}</span>
            </div>
          </div>
        )}

        {/* Removed heavy invisible overlay for better performance */}
      </div>
    </>
  );
};

export default ScreenProtection;
