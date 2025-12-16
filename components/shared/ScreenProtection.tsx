// components/shared/ScreenProtection.tsx
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useScreenProtection } from '@/hooks/useScreenProtection';
import { Shield, Eye, EyeOff } from 'lucide-react';

interface ScreenProtectionProps {
  children: React.ReactNode;
  watermarkText?: string;
  userEmail?: string;
  enableWatermark?: boolean;
  enableBlurOnFocusLoss?: boolean;
  enableKeyboardBlock?: boolean;
  enableContextMenuBlock?: boolean;
  enableDevToolsDetection?: boolean;
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
  showWarningOnAttempt = true,
  videoElementRef,
  className = '',
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [watermarkPositions, setWatermarkPositions] = useState<
    Array<{ top: number; left: number; rotation: number; opacity: number }>
  >([]);

  const { isBlurred, isRecording, attemptCount } = useScreenProtection({
    enableWatermark,
    enableBlurOnFocusLoss,
    enableKeyboardBlock,
    enableContextMenuBlock,
    enableDevToolsDetection,
    watermarkText,
    videoElementRef,
    onScreenshotAttempt: () => {
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

  // Generate floating watermark positions
  useEffect(() => {
    if (!enableWatermark) return;

    const generatePositions = () => {
      const positions = [];
      for (let i = 0; i < 4; i++) {
        positions.push({
          top: Math.random() * 90,
          left: Math.random() * 90,
          rotation: Math.random() * 360,
          opacity: 0.05 + Math.random() * 0.03,
        });
      }
      setWatermarkPositions(positions);
    };

    generatePositions();
    const interval = setInterval(generatePositions, 20000);
    return () => clearInterval(interval);
  }, [enableWatermark]);

  // Combine watermark text with user email if available
  const displayWatermark = useMemo(() => {
    if (userEmail) {
      return `${watermarkText} • ${userEmail}`;
    }
    return watermarkText;
  }, [watermarkText, userEmail]);

  return (
    <>
      <style jsx global>{`
        .screen-protected {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }

        .screen-protected * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .blur-transition {
          transition: filter 0.3s ease-out, backdrop-filter 0.3s ease-out;
          will-change: filter;
        }

        @keyframes float-watermark {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
          }
          25% { 
            transform: translateY(-12px) translateX(8px); 
          }
          50% { 
            transform: translateY(0px) translateX(-8px); 
          }
          75% { 
            transform: translateY(12px) translateX(8px); 
          }
        }

        .watermark-text {
          animation: float-watermark 30s ease-in-out infinite;
          pointer-events: none;
          font-family: 'Arial', sans-serif;
          font-weight: 600;
          text-shadow: 
            1px 1px 2px rgba(0,0,0,0.1),
            -1px -1px 2px rgba(255,255,255,0.1);
          will-change: transform;
          backface-visibility: hidden;
          transform: translateZ(0);
        }

        @keyframes pulse-warning {
          0%, 100% { 
            transform: scale(1); 
            opacity: 1; 
          }
          50% { 
            transform: scale(1.05); 
            opacity: 0.9; 
          }
        }

        .warning-pulse {
          animation: pulse-warning 0.5s ease-in-out 3;
        }

        /* High-security blur overlay */
        .security-blur-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          z-index: 99998;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Anti-screenshot pattern */
        .anti-screenshot-pattern {
          position: fixed;
          inset: 0;
          background: 
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.008) 2px,
              rgba(0,0,0,0.008) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.008) 2px,
              rgba(0,0,0,0.008) 4px
            );
          pointer-events: none;
          z-index: 99997;
          mix-blend-mode: multiply;
        }
      `}</style>

      <div
        className={`screen-protected relative ${className} ${
          isBlurred ? 'blur-transition' : ''
        }`}
        data-protected="true"
        style={{
          filter: isBlurred ? 'blur(8px) brightness(0.3)' : 'none',
          willChange: isBlurred ? 'filter' : 'auto',
        }}
      >
        {/* Anti-Screenshot Pattern */}
        <div className="anti-screenshot-pattern" />

        {/* Floating Watermarks */}
        {enableWatermark && watermarkPositions.length > 0 && (
          <div className="fixed inset-0 pointer-events-none z-[99996] overflow-hidden">
            {watermarkPositions.map((pos, index) => (
              <div
                key={index}
                className="watermark-text absolute text-gray-400 whitespace-nowrap select-none"
                style={{
                  top: `${pos.top}%`,
                  left: `${pos.left}%`,
                  transform: `rotate(${pos.rotation}deg) translateZ(0)`,
                  opacity: pos.opacity,
                  fontSize: '18px',
                  animationDelay: `${index * 7.5}s`,
                }}
              >
                {displayWatermark}
              </div>
            ))}
          </div>
        )}

        {/* Blur Overlay with Message */}
        {isBlurred && (
          <div className="security-blur-overlay">
            <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md mx-4">
              <EyeOff size={80} className="mx-auto mb-6 text-[#C5A059]" />
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Konten Dilindungi
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Konten akan muncul kembali saat Anda kembali ke tab ini.
                Ini adalah fitur keamanan untuk melindungi materi pembelajaran.
              </p>
            </div>
          </div>
        )}

        {/* Recording Warning */}
        {isRecording && (
          <div className="fixed top-6 right-6 z-[99999] bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse">
            <Eye size={24} />
            <span className="font-bold text-lg">Recording Detected!</span>
          </div>
        )}

        {/* Warning Toast */}
        {showWarning && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] bg-red-600 text-white px-8 py-4 rounded-xl shadow-2xl warning-pulse">
            <div className="flex items-center gap-4">
              <Shield size={28} />
              <span className="font-bold text-xl">{warningMessage}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        {children}
      </div>
    </>
  );
};

export default ScreenProtection;