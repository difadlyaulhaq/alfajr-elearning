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
    enableDragBlock = true,
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
  const [countdown, setCountdown] = useState(0);
  const [violationType, setViolationType] = useState<'screenshot' | 'devtools' | 'blur' | null>(null);
  
  // New State for black screen
  const [showBlackScreen, setShowBlackScreen] = useState(false);
  const [blackScreenReason, setBlackScreenReason] = useState<string>('');
  const [blackScreenMerk, setBlackScreenMerk] = useState<string>('');

  // Trust Score System
  const [trustLevel, setTrustLevel] = useState<'trusted' | 'suspect' | 'violation' | 'banned'>('trusted');
  const violationHistory = useRef<number[]>([]);

  const attemptCountRef = useRef(0);
  const lastBlurTimeRef = useRef(0);
  const blurDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const wasPlayingRef = useRef(false);
  const coolDownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMouseInsideRef = useRef(true);

  // Trust Score Logic
  const recordViolation = useCallback((severity: number) => {
    const now = Date.now();
    violationHistory.current.push(now);
    
    // Remove violations older than 5 minutes
    violationHistory.current = violationHistory.current.filter(
      time => now - time < 300000
    );
    
    // Calculate trust level
    const recentViolations = violationHistory.current.length;
    
    if (recentViolations >= 5) {
      setTrustLevel('banned');
      // Potential logic: Logout user or block access permanently until admin review
    } else if (recentViolations >= 3) {
      setTrustLevel('violation');
      // Full screen block with countdown
    } else if (recentViolations >= 1) {
      setTrustLevel('suspect');
      // Warning toast only
    }
  }, []);

  // Function untuk trigger black screen
  const triggerBlackScreen = useCallback((reason: string, merk: string = '') => {
    setShowBlackScreen(true);
    setBlackScreenReason(reason);
    setBlackScreenMerk(merk);
    
    // Auto hide setelah 10 detik
    setTimeout(() => {
      setShowBlackScreen(false);
    }, 10000);
    
    // Log ke server
    fetch('/api/security/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'black_screen_triggered',
        page: window.location.pathname,
        details: { 
          reason,
          merk,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        },
      }),
    }).catch(() => {});
  }, []);

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

  // Smart blur detection
  const handleBlur = useCallback(() => {
    if (!enableBlurOnFocusLoss) return;
    
    if (isMobileDevice()) {
      if (blurDebounceRef.current) clearTimeout(blurDebounceRef.current);
      
      setIsBlurred(true);
      setViolationType('blur');
      setCountdown(5);
      startCountdown(5);
      recordViolation(1); // Record blur as minor violation
      return;
    }

    if (blurDebounceRef.current) {
      clearTimeout(blurDebounceRef.current);
    }
    
    blurDebounceRef.current = setTimeout(() => {
      if (document.hidden || !document.hasFocus()) {
        setIsBlurred(true);
        setViolationType('blur');
        setCountdown(5);
        startCountdown(5);
        recordViolation(1);
      }
    }, 100);
  }, [enableBlurOnFocusLoss, startCountdown, recordViolation]);

  // Initialize mobile protection
  useEffect(() => {
    if (isMobileDevice()) {
      const cleanup = initializeMobileProtection((event) => {
        attemptCountRef.current++;

        const action = event.type;
        const details = event.details || {};
        const merk = details.merk || 'Unknown';

        triggerBlackScreen(action, merk);
        recordViolation(2); // Mobile heuristic violations are more serious

        if (action === 'mobile_screenshot_gesture' || 
            action === 'mobile_screenshot_suspect' || 
            action === 'mobile_ui_obstruct' || 
            action === 'mobile_palm_gesture' || 
            action === 'mobile_hardware_button' ||
            action === 'mobile_hardware_combo' ||
            action === 'mobile_power_double_click') {
          setIsViolation(true);
          setViolationType('screenshot');
          setCountdown(10);
          startCountdown(10);
          
          try {
            navigator.clipboard.writeText('⚠️ Screenshot tidak diizinkan').catch(() => {});
          } catch (error) {}
          
          onScreenshotAttempt?.();
        }
        
        fetch('/api/security/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: action,
            page: window.location.pathname,
            details: { 
              userAgent: navigator.userAgent,
              ...event.details 
            },
          }),
        }).catch(() => {});
      });
      
      return cleanup;
    }
  }, [startCountdown, onScreenshotAttempt, triggerBlackScreen, recordViolation]);

  const handleFocus = useCallback(() => {
    if (!enableBlurOnFocusLoss) return;

    if (blurDebounceRef.current) {
      clearTimeout(blurDebounceRef.current);
      blurDebounceRef.current = null;
    }
    
    if (isViolation) return;
    
    if (coolDownTimerRef.current) {
      clearTimeout(coolDownTimerRef.current);
      coolDownTimerRef.current = null;
    }

    setIsCoolDownActive(true);
    setIsBlurred(true);
    setViolationType('blur');
    setCountdown(5);
    startCountdown(5);
  }, [enableBlurOnFocusLoss, isViolation, startCountdown]);

  // Enhanced keyboard detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enableKeyboardBlock) return;

      let isScreenshotAttempt = false;
      let preventDefaultAction = false;

      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        isScreenshotAttempt = true;
        preventDefaultAction = true;
      }

      if ((e.key === 's' || e.key === 'S') && e.shiftKey && e.metaKey) {
        isScreenshotAttempt = true;
        preventDefaultAction = true;
      }

      if ((e.key === 'g' || e.key === 'G') && e.metaKey) {
        isScreenshotAttempt = true;
        preventDefaultAction = true;
      }

      if (e.metaKey && e.shiftKey) {
        if (['3', '4', '5'].includes(e.key)) {
          isScreenshotAttempt = true;
          preventDefaultAction = true;
        }
      }

      if ((e.key === 'PrintScreen' || e.keyCode === 44) && e.altKey) {
        isScreenshotAttempt = true;
        preventDefaultAction = true;
      }

      if ((e.key === 'PrintScreen' || e.keyCode === 44) && e.ctrlKey) {
        isScreenshotAttempt = true;
        preventDefaultAction = true;
      }

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
        recordViolation(3); // Keyboard shortcuts are definite attempts
        
        setIsViolation(true);
        setViolationType('screenshot');
        setCountdown(10);
        startCountdown(10);
        
        triggerBlackScreen(`keyboard_${e.key}`, 'Desktop');

        try {
          navigator.clipboard.writeText('⚠️ Screenshot tidak diizinkan').catch(() => {});
        } catch (error) {}
        
        onScreenshotAttempt?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyDown, true);
    };
  }, [enableKeyboardBlock, enableDevToolsDetection, onScreenshotAttempt, triggerBlackScreen, startCountdown, recordViolation]);

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

  useEffect(() => {
    const smartBlur = (e: FocusEvent) => {
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

  useEffect(() => {
    if (!enableContextMenuBlock) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      attemptCountRef.current++;
      recordViolation(1);
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [enableContextMenuBlock, recordViolation]);

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
        recordViolation(2);
      } else if (!widthThreshold && !heightThreshold && devToolsOpen) {
        devToolsOpen = false;
        setIsDevToolsOpen(false);
        if (violationType === 'devtools') {
          setViolationType(null);
        }
      }
    };

    const interval = setInterval(checkDevTools, 2000);
    checkDevTools();
    
    return () => clearInterval(interval);
  }, [enableDevToolsDetection, recordViolation, violationType]);

  useEffect(() => {
    if (!enableDragBlock) return;

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('dragstart', handleDragStart);
    return () => document.removeEventListener('dragstart', handleDragStart);
  }, [enableDragBlock]);

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
    countdown,
    violationType,
    attemptCount: attemptCountRef.current,
    showBlackScreen,
    blackScreenReason,
    blackScreenMerk,
    trustLevel, // Exposed
  };
};