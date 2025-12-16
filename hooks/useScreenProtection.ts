// hooks/useScreenProtection.ts
"use client";

import { useEffect, useRef, useState } from 'react';

interface ScreenProtectionOptions {
  enableWatermark?: boolean;
  enableBlurOnFocusLoss?: boolean;
  enableKeyboardBlock?: boolean;
  enableContextMenuBlock?: boolean;
  enableDevToolsDetection?: boolean;
  watermarkText?: string;
  onScreenshotAttempt?: () => void;
  onRecordingDetected?: () => void;
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
  } = options;

  const [isBlurred, setIsBlurred] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const attemptCountRef = useRef(0);
  const blackScreenTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enableKeyboardBlock) return;

      if (e.key === 'PrintScreen') {
        e.preventDefault();
        attemptCountRef.current++;
        onScreenshotAttempt?.();
        console.warn('Screenshot attempt detected!');
      }

      if (e.key === 's' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        attemptCountRef.current++;
        onScreenshotAttempt?.();
      }

      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        attemptCountRef.current++;
        onScreenshotAttempt?.();
      }

      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
        (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))
      ) {
        if (enableDevToolsDetection) {
          e.preventDefault();
          attemptCountRef.current++;
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (enableBlurOnFocusLoss) {
          setIsBlurred(true);
        }
      } else {
        setTimeout(() => {
          setIsBlurred(false);
        }, 500);
      }
    };

    const handleBlur = () => {
      if (enableBlurOnFocusLoss) {
        setIsBlurred(true);
      }
    };

    const handleFocus = () => {
      if (enableBlurOnFocusLoss) {
        setTimeout(() => setIsBlurred(false), 300);
      }
    };

    // const detectScreenRecording = async () => {
    //   try {
    //     if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
    //       // Reduced interval for better performance
    //       const checkRecording = setInterval(() => {
    //         if ('permissions' in navigator) {
    //           navigator.permissions
    //             .query({ name: 'display-capture' as PermissionName })
    //             .then((permissionStatus) => {
    //               if (permissionStatus.state === 'granted') {
    //                 setIsRecording(true);
    //                 onRecordingDetected?.();
    //               } else {
    //                 setIsRecording(false);
    //               }
    //             })
    //             .catch(() => {});
    //             }
    //       }, 5000); // Increased to 5s for better performance
    //       return () => clearInterval(checkRecording);
    //     }
    //   } catch (error) {
    //     console.error('Screen recording detection error:', error);
    //   }
    // };

    const detectDevTools = () => {
      if (!enableDevToolsDetection) return;
      const threshold = 160;
      const checkDevTools = () => {
        if (
          window.outerWidth - window.innerWidth > threshold ||
          window.outerHeight - window.innerHeight > threshold
        ) {
          attemptCountRef.current++;
        }
      };
      const interval = setInterval(checkDevTools, 3000); // Reduced frequency
      return () => clearInterval(interval);
    };

    const handleCopy = (e: ClipboardEvent) => {
      attemptCountRef.current++;
      // Removed onScreenshotAttempt?.(); to prevent false positives when copying text.
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (enableContextMenuBlock) {
        e.preventDefault();
        attemptCountRef.current++;
      }
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('dragstart', handleDragStart);

    // const cleanupRecording = detectScreenRecording(); // Disabled due to false positives
    const cleanupDevTools = detectDevTools();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('dragstart', handleDragStart);
      
      // if (cleanupRecording) cleanupRecording.then(fn => fn && fn()); // Disabled cleanup for recording detection
      if (cleanupDevTools) cleanupDevTools();
      
      // Clean up black screen timeout
      if (blackScreenTimeoutRef.current) {
        clearTimeout(blackScreenTimeoutRef.current);
      }
      
      // Reset styles
    };
  }, [
    enableKeyboardBlock,
    enableBlurOnFocusLoss,
    enableContextMenuBlock,
    enableDevToolsDetection,
    onScreenshotAttempt,
    onRecordingDetected,
  ]);

  return {
    isBlurred,
    isRecording,
    attemptCount: attemptCountRef.current,
  };
};
