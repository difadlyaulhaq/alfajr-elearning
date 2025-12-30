// components/protection/BlackScreenOverlay.tsx
"use client";

import { useEffect, useState } from 'react';

interface BlackScreenOverlayProps {
  isActive: boolean;
  duration?: number;
  watermark?: string;
  onComplete?: () => void;
}

export default function BlackScreenOverlay({
  isActive,
  duration = 10000, // 10 detik default
  watermark = "ALFAJR E-LEARNING - CONFIDENTIAL",
  onComplete,
}: BlackScreenOverlayProps) {
  const [countdown, setCountdown] = useState(duration / 1000);
  const [show, setShow] = useState(false);
  const [merk, setMerk] = useState<string>('Unknown');

  useEffect(() => {
    const detectMerk = () => {
      if (typeof navigator === 'undefined') return 'Unknown';
      const ua = navigator.userAgent.toLowerCase();
      if (/samsung/i.test(ua)) return 'Samsung';
      if (/xiaomi|redmi|poco|mi\s/i.test(ua)) return 'Xiaomi';
      if (/iphone|ipad|ipod/i.test(ua)) return 'iPhone/iPad';
      if (/pixel/i.test(ua)) return 'Google Pixel';
      if (/oppo/i.test(ua)) return 'OPPO';
      if (/vivo/i.test(ua)) return 'VIVO';
      if (/realme/i.test(ua)) return 'Realme';
      if (/oneplus/i.test(ua)) return 'OnePlus';
      return 'Unknown Device';
    };

    setMerk(detectMerk());
  }, []);

  useEffect(() => {
    if (isActive) {
      setShow(true);
      setCountdown(duration / 1000);
      
      // Start countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setShow(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setShow(false);
    }
  }, [isActive, duration, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden">
      {/* Animated background effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full animate-pulse">
            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-white rounded-full blur-3xl opacity-5"></div>
            <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-blue-500 rounded-full blur-3xl opacity-5"></div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center text-white p-8 max-w-lg">
        {/* Device info */}
        <div className="mb-6">
          <div className="inline-block px-4 py-2 bg-red-900 bg-opacity-50 rounded-full border border-red-700">
            <span className="text-sm font-medium">{merk} Device Detected</span>
          </div>
        </div>

        {/* Warning icon */}
        <div className="text-6xl mb-6 animate-bounce">🚫</div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-4 text-red-400">
          SCREENSHOT BLOCKED
        </h1>

        {/* Message */}
        <p className="text-lg mb-6 text-gray-300">
          Unauthorized screen capture detected on your {merk} device.
          This content is protected against copying.
        </p>

        {/* Countdown */}
        <div className="mb-8">
          <div className="text-5xl font-bold mb-2">{countdown}</div>
          <div className="text-sm text-gray-400">
            Screen will unlock in {countdown} seconds
          </div>
        </div>

        {/* Watermark pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-4 left-4 text-xs rotate-45">{watermark}</div>
          <div className="absolute top-4 right-4 text-xs -rotate-45">{watermark}</div>
          <div className="absolute bottom-4 left-4 text-xs -rotate-45">{watermark}</div>
          <div className="absolute bottom-4 right-4 text-xs rotate-45">{watermark}</div>
          
          {/* Grid watermark */}
          <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2">
            <div className="text-2xl font-bold tracking-widest text-center">
              {watermark} • {watermark} • {watermark}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="text-sm text-gray-500">
            Device: {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 80) : 'Unknown'}...
          </div>
          <div className="text-xs text-gray-600 mt-2">
            Timestamp: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}