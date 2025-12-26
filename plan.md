 1. Core Logic (Otak Sistem)
  File: lib/security/mobileProtection.ts

  Ini adalah file paling kritikal untuk mobile. Di sinilah semua event listener "kotor" berada (akses DOM langsung).
   * Apa yang sudah kita lakukan:
       * Menambahkan deteksi gesture 3 jari (Screenshot Android/Xiaomi).
       * Menambahkan deteksi "Palm Swipe" (Samsung).
       * Menambahkan listener "Best Effort" untuk tombol fisik (Power/Volume).
       * Membuat cleanup function agar tidak memory leak.
   * Apa yang perlu tim Anda pantau:
       * Sensitivitas Gesture: Nilai radiusX > 30 atau force threshold mungkin perlu di-tweak jika terlalu sensitif
         (false positive) atau kurang sensitif pada device tertentu.
       * WebView Bridge: Jika aplikasi Anda berjalan di dalam WebView (wrapper native Android/iOS), file ini adalah
         tempat terbaik untuk menambahkan "Bridge" (komunikasi antara JavaScript dan Native Code) jika tim mobile native
         Anda mengirim event screenshot dari sisi Java/Swift.


export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const initializeMobileProtection = (onViolation?: (action: string) => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    onViolation?.('mobile_context_menu');
  };

  const handleDragStart = (e: DragEvent) => {
    e.preventDefault();
    onViolation?.('mobile_drag_start');
  };

  const handleTouchStart = (e: TouchEvent) => {
    // Detect 3+ finger gestures (Xiaomi/OnePlus/Oppo screenshots)
    if (e.touches.length >= 3) {
      onViolation?.('mobile_screenshot_gesture');
      return;
    }

    // Detect Palm Swipe (Samsung screenshots) - Experimental
    // Check for large contact area or abnormal force
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      // Radius threshold: 30px is a rough estimate for a "finger" vs "palm"
      // Force threshold: > 1 usually implies strong pressure
      if (
        (touch.radiusX && touch.radiusX > 30) || 
        (touch.radiusY && touch.radiusY > 30) ||
        (touch.force && touch.force > 1)
      ) {
        onViolation?.('mobile_palm_gesture');
        break; // Trigger once per event
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Best effort detection for physical buttons (if leaked to browser)
    // Most mobile browsers block these, but some webviews or specific OS versions might pass them
    if (
      e.key === 'VolumeUp' || 
      e.key === 'VolumeDown' || 
      e.key === 'Power' || 
      e.code === 'VolumeUp' || 
      e.code === 'VolumeDown'
    ) {
      onViolation?.('mobile_hardware_button');
    }
  };

  // Prevent context menu (long press)
  window.addEventListener('contextmenu', handleContextMenu, { capture: true });

  // Disable text selection and touch callout
  const originalUserSelect = document.documentElement.style.userSelect;
  const originalWebkitUserSelect = document.documentElement.style.webkitUserSelect;
  // @ts-ignore
  const originalWebkitTouchCallout = document.documentElement.style.webkitTouchCallout;

  document.documentElement.style.userSelect = 'none';
  document.documentElement.style.webkitUserSelect = 'none';
  // @ts-ignore
  document.documentElement.style.webkitTouchCallout = 'none';

  // Prevent drag
  window.addEventListener('dragstart', handleDragStart, { capture: true });

  // Detect 3+ finger gestures (often used for screenshots)
  window.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });

  // Detect hardware keys (Best effort)
  window.addEventListener('keydown', handleKeyDown, { capture: true });

  // Return cleanup function
  return () => {
    window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    window.removeEventListener('dragstart', handleDragStart, { capture: true });
    window.removeEventListener('touchstart', handleTouchStart, { capture: true });
    window.removeEventListener('keydown', handleKeyDown, { capture: true });

    document.documentElement.style.userSelect = originalUserSelect;
    document.documentElement.style.webkitUserSelect = originalWebkitUserSelect;
    // @ts-ignore
    document.documentElement.style.webkitTouchCallout = originalWebkitTouchCallout;
  };
};

 2. State Management (Pengontrol)
  File: hooks/useScreenProtection.ts

  File ini menghubungkan logic browser/mobile dengan React State.
   * Apa yang sudah kita lakukan:
       * Mengintegrasikan logic dari mobileProtection.ts.
       * Menangani mobile_screenshot_gesture, mobile_palm_gesture, dan mobile_hardware_button.
       * Mengatur hukuman (Penalty) 10 detik dan membersihkan clipboard.
   * Apa yang perlu tim Anda pantau:
       * Blur vs Visibility: Di lingkungan WebView, terkadang event blur tidak terpanggil saat user membuka notifikasi
         bar. Pastikan logic visibilitychange (yang sudah ada) tetap dipertahankan karena lebih reliable di mobile.

         // hooks/useScreenProtection.ts
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { isMobileDevice, initializeMobileProtection } from '@/lib/security/mobileProtection';

interface ScreenProtectionOptions {
  enableWatermark?: boolean;
  enableBlurOnFocusLoss?: boolean;
  enableKeyboardBlock?: boolean;
  enableContextMenuBlock?: boolean;
  enableDevToolsDetection?: boolean;
  enableDragBlock?: boolean;
  watermarkText?: string;
  onScreenshotAttempt?: () => void;
  onRecordingDetected?: () => void;
  videoElementRef?: React.RefObject<HTMLVideoElement>;
}

export const useScreenProtection = (options: ScreenProtectionOptions = {}) => {
  const {
    enableWatermark = true,
    enableBlurOnFocusLoss = true,
    enableKeyboardBlock = true,
    enableContextMenuBlock = true,
    enableDevToolsDetection = true,
    enableDragBlock = true, // New option
    watermarkText = 'PROTECTED CONTENT',
    onScreenshotAttempt,
    onRecordingDetected,
    videoElementRef,
  } = options;

  const [isBlurred, setIsBlurred] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [isViolation, setIsViolation] = useState(false);
  const [isCoolDownActive, setIsCoolDownActive] = useState(false);
  const [countdown, setCountdown] = useState(0); // Countdown timer state
  const [violationType, setViolationType] = useState<'screenshot' | 'devtools' | 'blur' | null>(null);
  const attemptCountRef = useRef(0);
  const lastBlurTimeRef = useRef(0);
  const blurDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const wasPlayingRef = useRef(false);
  const coolDownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMouseInsideRef = useRef(true); // Track if mouse is inside window



  // Smart blur detection - hanya trigger jika benar-benar pindah tab/window
  const handleBlur = useCallback(() => {
    if (!enableBlurOnFocusLoss) return;
    
    // Delay blur untuk membedakan antara klik dalam page vs pindah tab
    if (blurDebounceRef.current) {
      clearTimeout(blurDebounceRef.current);
    }
    
    blurDebounceRef.current = setTimeout(() => {
      // Hanya blur jika document benar-benar hidden atau window blur
      if (document.hidden || !document.hasFocus()) {
        setIsBlurred(true);
        setViolationType('blur');
        setCountdown(5);
        startCountdown(5);
      }
    }, 100); // 100ms delay untuk menghindari false trigger
  }, [enableBlurOnFocusLoss]);

  // Start countdown timer
  const startCountdown = useCallback((seconds: number) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    let timeLeft = seconds;
    setCountdown(timeLeft);
    
    countdownIntervalRef.current = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      
      if (timeLeft <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        // Clear states setelah countdown selesai
        setIsViolation(false);
        setIsBlurred(false);
        setIsCoolDownActive(false);
        setIsDevToolsOpen(false);
        setViolationType(null);
      }
    }, 1000);
  }, []);

  // Initialize mobile protection with gesture support
  useEffect(() => {
    if (isMobileDevice()) {
      const cleanup = initializeMobileProtection((action) => {
        attemptCountRef.current++;

        // Handle specific mobile violations
        if (action === 'mobile_screenshot_gesture' || action === 'mobile_palm_gesture' || action === 'mobile_hardware_button') {
          setIsViolation(true);
          setViolationType('screenshot');
          setCountdown(10);
          startCountdown(10);
          
          try {
            navigator.clipboard.writeText('⚠️ Screenshot tidak diizinkan').catch(() => {});
          } catch (error) {}
          
          onScreenshotAttempt?.();
        }
        
        // Log mobile violation
        fetch('/api/security/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: action,
            page: window.location.pathname,
            details: { userAgent: navigator.userAgent },
          }),
        }).catch(() => {});
      });
      
      return cleanup;
    }
  }, [startCountdown, onScreenshotAttempt]);

  const handleFocus = useCallback(() => {
    if (!enableBlurOnFocusLoss) return;

    // Clear any pending blur debounce
    if (blurDebounceRef.current) {
      clearTimeout(blurDebounceRef.current);
      blurDebounceRef.current = null;
    }
    
    // Jangan set cooldown jika sedang ada violation lain
    if (isViolation) return;
    
    // Clear any previous cool-down timer
    if (coolDownTimerRef.current) {
      clearTimeout(coolDownTimerRef.current);
      coolDownTimerRef.current = null;
    }

    // Set cool-down active saat focus kembali
    setIsCoolDownActive(true);
    setIsBlurred(true);
    setViolationType('blur');
    setCountdown(5);
    startCountdown(5);
  }, [enableBlurOnFocusLoss, isViolation, startCountdown]);

  // Enhanced keyboard detection dengan deteksi lengkap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enableKeyboardBlock) return;

      let isScreenshotAttempt = false;
      let preventDefaultAction = false;

      // PrintScreen key (44 = keyCode untuk PrtSc)
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        isScreenshotAttempt = true;
        preventDefaultAction = true;
      }

      // Windows Snipping Tool (Win + Shift + S)
      if ((e.key === 's' || e.key === 'S') && e.shiftKey && e.metaKey) {
        isScreenshotAttempt = true;
        preventDefaultAction = true;
      }

      // Windows Game Bar (Win + Alt + PrtSc atau Win + G)
      if ((e.key === 'g' || e.key === 'G') && e.metaKey) {
        isScreenshotAttempt = true;
        preventDefaultAction = true;
      }

      // Mac screenshots
      if (e.metaKey && e.shiftKey) {
        // Cmd + Shift + 3 (full screen)
        // Cmd + Shift + 4 (selection)
        // Cmd + Shift + 5 (screen recording)
        if (['3', '4', '5'].includes(e.key)) {
          isScreenshotAttempt = true;
          preventDefaultAction = true;
        }
      }

      // Alt + PrtSc (Active window screenshot)
      if ((e.key === 'PrintScreen' || e.keyCode === 44) && e.altKey) {
        isScreenshotAttempt = true;
        preventDefaultAction = true;
      }

      // Ctrl + PrtSc
      if ((e.key === 'PrintScreen' || e.keyCode === 44) && e.ctrlKey) {
        isScreenshotAttempt = true;
        preventDefaultAction = true;
      }

      // Chrome DevTools shortcuts
      const isDevToolsShortcut = 
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        (e.metaKey && e.altKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key));

      if (isDevToolsShortcut && enableDevToolsDetection) {
        preventDefaultAction = true;
        isScreenshotAttempt = true;
      }

      if (isScreenshotAttempt) {
        if (preventDefaultAction) {
          e.preventDefault();
          e.stopPropagation();
        }
        
        attemptCountRef.current++;
        
        // Flag sebagai violation dengan countdown
        setIsViolation(true);
        setViolationType('screenshot');
        setCountdown(10);
        startCountdown(10);
        
        // Clear clipboard secara agresif
        try {
          navigator.clipboard.writeText('⚠️ Screenshot tidak diizinkan').catch(() => {});
        } catch (error) {
          // Clipboard API tidak tersedia
        }
        
        onScreenshotAttempt?.();
      }
    };

    // Gunakan capture phase untuk menangkap event lebih awal
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyDown, true);
    };
  }, [enableKeyboardBlock, enableDevToolsDetection, onScreenshotAttempt]);

  // Visibility change detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleBlur();
      } else {
        handleFocus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleBlur, handleFocus]);

  // Track mouse position untuk mencegah false trigger
  useEffect(() => {
    const handleMouseEnter = () => {
      isMouseInsideRef.current = true;
    };
    
    const handleMouseLeave = () => {
      isMouseInsideRef.current = false;
    };
    
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Window focus/blur events dengan validasi mouse
  useEffect(() => {
    const smartBlur = (e: FocusEvent) => {
      // Hanya trigger blur jika mouse benar-benar keluar dari window
      if (!isMouseInsideRef.current || document.hidden) {
        handleBlur();
      }
    };
    
    window.addEventListener('blur', smartBlur as any);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', smartBlur as any);
      window.removeEventListener('focus', handleFocus);
    };
  }, [handleBlur, handleFocus]);

  // Context menu blocking
  useEffect(() => {
    if (!enableContextMenuBlock) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Always prevent default if blocking is enabled
      attemptCountRef.current++;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [enableContextMenuBlock]);

  // DevTools detection (optimized)
  useEffect(() => {
    if (!enableDevToolsDetection) return;

    const threshold = 160;
    let devToolsOpen = false;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if ((widthThreshold || heightThreshold) && !devToolsOpen) {
        devToolsOpen = true;
        attemptCountRef.current++;
        setIsDevToolsOpen(true);
        setViolationType('devtools');
        // DevTools tidak perlu countdown karena harus ditutup dulu
      } else if (!widthThreshold && !heightThreshold && devToolsOpen) {
        devToolsOpen = false;
        setIsDevToolsOpen(false);
        if (violationType === 'devtools') {
          setViolationType(null);
        }
      }
    };

    // Kurangi frekuensi check dari 1s menjadi 2s untuk performa lebih baik
    const interval = setInterval(checkDevTools, 2000);
    checkDevTools(); // Check immediately on mount
    
    return () => clearInterval(interval);
  }, [enableDevToolsDetection]);

  // Prevent drag operations
  useEffect(() => {
    if (!enableDragBlock) return;

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault(); // Always prevent default if blocking is enabled
    };

    document.addEventListener('dragstart', handleDragStart);
    return () => document.removeEventListener('dragstart', handleDragStart);
  }, [enableDragBlock]); // Add enableDragBlock to dependency array

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (blurDebounceRef.current) {
        clearTimeout(blurDebounceRef.current);
      }
      if (coolDownTimerRef.current) {
        clearTimeout(coolDownTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  return {
    isBlurred,
    isRecording,
    isDevToolsOpen,
    isViolation,
    isCoolDownActive,
    countdown, // Countdown value
    violationType, // Type of current violation
    attemptCount: attemptCountRef.current,
  };
};

3. UI Overlay (Tampilan Shield)
  File: components/shared/ScreenProtection.tsx

  Ini adalah komponen visual yang menutup layar saat pelanggaran terjadi.
   * Apa yang sudah kita lakukan:
       * Menampilkan layar merah/hitam dengan countdown timer.
       * Menampilkan Watermark bergerak.
   * Apa yang perlu tim Anda pantau:
       * CSS `touch-action`: Pastikan overlay ini memiliki properti CSS touch-action: none agar user tidak bisa
         melakukan scroll atau zoom saat layar terkunci.
       * Z-Index: Pastikan z-index overlay ini selalu yang tertinggi (999999), bahkan di atas komponen UI library lain
         (seperti Modal atau Toast) yang mungkin digunakan tim Frontend.

         // components/shared/ScreenProtection.tsx
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM for createPortal
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
  enableDragBlock?: boolean; // New option
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
  enableDragBlock = true, // New prop
  showWarningOnAttempt = true,
  videoElementRef,
  className = '',
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [watermarkPositions, setWatermarkPositions] = useState<
    Array<{ top: number; left: number; rotation: number; opacity: number }>
  >([]);

  const { isBlurred, isRecording, isDevToolsOpen, isViolation, isCoolDownActive, countdown, violationType, attemptCount } = useScreenProtection({
    enableWatermark,
    enableBlurOnFocusLoss,
    enableKeyboardBlock,
    enableContextMenuBlock,
    enableDevToolsDetection,
    enableDragBlock, // Pass new prop to hook
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

  // Generate floating watermark positions (optimized untuk performa)
  useEffect(() => {
    if (!enableWatermark) return;

    const generatePositions = () => {
      const positions = [];
      // Kurangi jumlah watermark dari 4 menjadi 3 untuk mengurangi beban rendering
      for (let i = 0; i < 3; i++) {
        positions.push({
          top: Math.random() * 85 + 5, // 5-90%
          left: Math.random() * 85 + 5, // 5-90%
          rotation: Math.random() * 30 - 15, // -15 to 15 degrees (lebih subtle)
          opacity: 0,
        });
      }
      setWatermarkPositions(positions);
    };

    generatePositions();
    // Perpanjang interval dari 20s ke 30s untuk mengurangi re-render
    const interval = setInterval(generatePositions, 30000);
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
          transition: filter 0.2s ease-out;
          will-change: filter;
        }

        /* Animasi watermark yang lebih ringan dan smooth */
        @keyframes float-watermark {
          0%, 100% { 
            transform: translate3d(0, 0, 0); 
          }
          25% { 
            transform: translate3d(6px, -8px, 0); 
          }
          50% { 
            transform: translate3d(-6px, 0, 0); 
          }
          75% { 
            transform: translate3d(6px, 8px, 0); 
          }
        }

        .watermark-text {
          animation: float-watermark 25s ease-in-out infinite;
          pointer-events: none;
          font-family: 'Arial', sans-serif;
          font-weight: 600;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.15);
          will-change: transform;
          backface-visibility: hidden;
          transform: translateZ(0);
          -webkit-font-smoothing: antialiased;
        }

        @keyframes pulse-warning {
          0%, 100% { 
            transform: scale(1); 
            opacity: 1; 
          }
          50% { 
            transform: scale(1.03); 
            opacity: 0.95; 
          }
        }

        .warning-pulse {
          animation: pulse-warning 0.4s ease-in-out 2;
        }

        /* Countdown animation */
        @keyframes countdown-pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        .countdown-circle {
          animation: countdown-pulse 1s ease-in-out infinite;
        }

        /* Anti-screenshot pattern yang lebih ringan */
        .anti-screenshot-pattern {
          position: fixed;
          inset: 0;
          background: 
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 3px,
              rgba(0,0,0,0.005) 3px,
              rgba(0,0,0,0.005) 6px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 3px,
              rgba(0,0,0,0.005) 3px,
              rgba(0,0,0,0.005) 6px
            );
          pointer-events: none;
          z-index: 999997;
          mix-blend-mode: multiply;
          opacity: 0.8;
        }
      `}</style>

      
        {/* Anti-Screenshot Pattern */}
        <div className="anti-screenshot-pattern" />

        {/* Floating Watermarks (Optimized) */}
        {enableWatermark && watermarkPositions.length > 0 && (
          <div className="fixed inset-0 pointer-events-none z-[999996] overflow-hidden">
            {watermarkPositions.map((pos, index) => (
              <div
                key={index}
                className="watermark-text absolute text-gray-400 whitespace-nowrap select-none"
                style={{
                  top: `${pos.top}%`,
                  left: `${pos.left}%`,
                  transform: `rotate(${pos.rotation}deg) translateZ(0)`,
                  opacity: 0.35,
                  fontSize: '16px',
                  animationDelay: `${index * 8.3}s`,
                }}
              >
                {displayWatermark}
              </div>
            ))}
          </div>
        )}

        {/* Combined Global Security Overlay (Optimized with Countdown) */}
        {(isViolation || isDevToolsOpen || isBlurred || isCoolDownActive) && ( 
          <div 
            className="fixed inset-0 z-[999999] bg-black flex items-center justify-center text-white p-4 text-center pointer-events-auto transition-opacity duration-200" 
            style={{ opacity: 0.98 }}
          >
            <div className="max-w-xl">
              {isViolation && (
                <>
                  <Shield size={64} className="mx-auto text-red-500 mb-4" />
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">PELANGGARAN TERDETEKSI!</h2>
                  <p className="text-base md:text-lg text-gray-300">
                    Aktivitas mencurigakan terdeteksi (percobaan screenshot/rekam layar).
                    Konten disembunyikan sebagai tindakan keamanan.
                  </p>
                  {countdown > 0 && (
                    <div className="mt-6">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border-4 border-red-500 mb-3 countdown-circle">
                        <span className="text-4xl font-bold">{countdown}</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Anda dapat melanjutkan setelah <span className="text-white font-semibold">{countdown} detik</span>
                      </p>
                    </div>
                  )}
                </>
              )}
              {isDevToolsOpen && !isViolation && (
                <>
                  <Shield size={64} className="mx-auto text-red-500 mb-4" />
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">Developer Tools Terdeteksi!</h2>
                  <p className="text-base md:text-lg text-gray-300">
                    Harap tutup Developer Tools untuk melanjutkan.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-gray-400">
                      Menunggu Developer Tools ditutup...
                    </p>
                  </div>
                </>
              )}
              {(isBlurred || isCoolDownActive) && !isViolation && !isDevToolsOpen && (
                <>
                  <Shield size={64} className="mx-auto text-yellow-500 mb-4" />
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">Konten Disembunyikan</h2>
                  <p className="text-base md:text-lg text-gray-300">
                    {isBlurred && !isCoolDownActive 
                      ? 'Konten disembunyikan karena Anda meninggalkan halaman. Kembali ke halaman ini untuk melanjutkan.'
                      : 'Memverifikasi keamanan sebelum menampilkan konten...'}</p>
                  {countdown > 0 && isCoolDownActive && (
                    <div className="mt-6">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/20 border-4 border-yellow-500 mb-3 countdown-circle">
                        <span className="text-4xl font-bold">{countdown}</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Anda dapat melanjutkan setelah <span className="text-white font-semibold">{countdown} detik</span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Recording Warning (Optimized) */}
        {isRecording && (
          <div className="fixed top-4 right-4 z-[999999] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
            <Eye size={20} />
            <span className="font-semibold text-sm">Recording Terdeteksi!</span>
          </div>
        )}

        {/* Warning Toast (Optimized) */}
        {showWarning && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999999] bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl warning-pulse">
            <div className="flex items-center gap-3">
              <Shield size={22} />
              <span className="font-bold text-base">{warningMessage}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        {children}

        {ReactDOM.createPortal(
          <>
          </>,
          document.body
        )}
    </>
  );
};

export default ScreenProtection;

4. Global Config (Level Dokumen)
  File: app/layout.tsx (atau Root Layout)

  Untuk proteksi mobile yang maksimal, konfigurasi meta tag di level layout sangat penting.
   * Rekomendasi Perbaikan (Action Item untuk Tim):
      Tambahkan atau pastikan meta tag viewport diset untuk mencegah zooming, yang sering digunakan untuk mempermudah
  screenshot parsial.

   1     // Di dalam <head> atau metadata config Next.js
   2     <meta
   3       name="viewport"
   4       content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
   5     />
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'highlight.js/styles/github-dark.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: " Alfajr E-learning",
  description: "Platform E-learning Alfajr Umroh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
