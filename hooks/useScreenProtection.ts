// hooks/useScreenProtection.ts
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

interface ScreenProtectionOptions {
  enableWatermark?: boolean;
  enableBlurOnFocusLoss?: boolean;
  enableKeyboardBlock?: boolean;
  enableContextMenuBlock?: boolean;
  enableDevToolsDetection?: boolean;
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
    watermarkText = 'PROTECTED CONTENT',
    onScreenshotAttempt,
    onRecordingDetected,
    videoElementRef,
  } = options;

  const [isBlurred, setIsBlurred] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false); // Declare isDevToolsOpen state
  const attemptCountRef = useRef(0);
  const lastBlurTimeRef = useRef(0);
  const blurDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const wasPlayingRef = useRef(false);

  // Improved blur detection with debounce
  const handleBlur = useCallback(() => {
    if (!enableBlurOnFocusLoss) return;
    
    // Immediately apply blur
    setIsBlurred(true);

    // Clear any pending debounced focus actions, as blur is now active
    if (blurDebounceRef.current) {
        clearTimeout(blurDebounceRef.current);
        blurDebounceRef.current = null;
    }
  }, [enableBlurOnFocusLoss]);

  const handleFocus = useCallback(() => {
    if (!enableBlurOnFocusLoss) return;

    // Clear debounce
    if (blurDebounceRef.current) {
      clearTimeout(blurDebounceRef.current);
    }

    // Restore UI after slight delay
    setTimeout(() => {
      setIsBlurred(false);
    }, 300);
  }, [enableBlurOnFocusLoss, videoElementRef]);

  // Enhanced keyboard detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enableKeyboardBlock) return;

      let isScreenshotAttempt = false;

      // PrintScreen key
      if (e.key === 'PrintScreen') {
        isScreenshotAttempt = true;
      }

      // Windows Snipping Tool (Win + Shift + S)
      if (e.key === 's' && e.shiftKey && e.metaKey) {
        isScreenshotAttempt = true;
      }

      // Mac screenshots (Cmd + Shift + 3/4/5)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        isScreenshotAttempt = true;
      }

      // Chrome DevTools shortcuts
      const isDevToolsShortcut = 
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
        (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()));

      if (isDevToolsShortcut) {
        if (enableDevToolsDetection) {
          e.preventDefault(); // Aggressively prevent default for DevTools shortcuts
          isScreenshotAttempt = true; // Still trigger onScreenshotAttempt for logging/visual feedback
        }
      }

      if (isScreenshotAttempt) {
        e.preventDefault();
        attemptCountRef.current++;
        
        // Clear clipboard
        try {
          navigator.clipboard.writeText('').catch(() => {});
        } catch (error) {
          // Clipboard API not available
        }
        
        onScreenshotAttempt?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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

  // Window focus/blur events
  useEffect(() => {
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [handleBlur, handleFocus]);

  // Context menu blocking
  useEffect(() => {
    if (!enableContextMenuBlock) return;

    const handleContextMenu = (e: MouseEvent) => {
      // Only block on protected elements
      const target = e.target as HTMLElement;
      if (target.closest('[data-protected="true"]')) {
        e.preventDefault();
        attemptCountRef.current++;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [enableContextMenuBlock]);

  // DevTools detection
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
        setIsDevToolsOpen(true); // Use setIsDevToolsOpen here
      } else if (!widthThreshold && !heightThreshold && devToolsOpen) {
        devToolsOpen = false;
        setIsDevToolsOpen(false); // Use setIsDevToolsOpen here
      }
    };

    const interval = setInterval(checkDevTools, 1000);
    return () => clearInterval(interval);
  }, [enableDevToolsDetection]);

  // Prevent drag operations
  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-protected="true"]')) {
        e.preventDefault();
      }
    };

    document.addEventListener('dragstart', handleDragStart);
    return () => document.removeEventListener('dragstart', handleDragStart);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (blurDebounceRef.current) {
        clearTimeout(blurDebounceRef.current);
      }
    };
  }, []);

  return {
    isBlurred,
    isRecording,
    isDevToolsOpen, // Add new state to returned object
    attemptCount: attemptCountRef.current,
  };
};