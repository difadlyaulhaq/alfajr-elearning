// lib/security/mobileProtection.ts - Visual Viewport Enhanced Version

export interface GestureConfig {
  minMultiTouchCount: number;
  palmRadiusThreshold: number;
  palmForceThreshold: number;
  swipeDistanceThreshold: number;
  swipeTimeout: number;
  comboTimeWindow: number;
  resizeThreshold: number;
}

const DEFAULT_CONFIG: GestureConfig = {
  minMultiTouchCount: 3,
  palmRadiusThreshold: 30,
  palmForceThreshold: 1,
  swipeDistanceThreshold: 50,
  swipeTimeout: 300,
  comboTimeWindow: 1500, // Increased window for better detection
  resizeThreshold: 20,   // More sensitive to UI bars (Screenshot bar is usually small ~60-100px)
};

export interface ViolationEvent {
  type: string;
  timestamp: number;
  details?: any;
}

type ViolationCallback = (event: ViolationEvent) => void;

// --- Utility Functions ---

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|Ipod/i.test(navigator.userAgent);
};

export const requestDeviceMotionPermission = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && 
      typeof (window as any).DeviceMotionEvent !== 'undefined' && 
      typeof ((window as any).DeviceMotionEvent as any).requestPermission === 'function') {
    try {
      const permissionState = await ((window as any).DeviceMotionEvent as any).requestPermission();
      return permissionState === 'granted';
    } catch (error) {
      console.error('Error requesting device motion permission:', error);
      return false;
    }
  }
  return true;
};

export const initializeMobileProtection = (
  onViolation?: ViolationCallback,
  customConfig?: Partial<GestureConfig>
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const config = { ...DEFAULT_CONFIG, ...customConfig };
  
  // State
  const activePointers = new Map<number, PointerEvent>();
  let initialViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  let lastVisibilityChange = 0;

  // --- 1. Visual Viewport Detection (The "Screenshot Bar" Trap) ---
  // When a screenshot is taken, the OS often overlays a bar at the bottom/top.
  // This changes the 'visualViewport' height, even if 'innerHeight' doesn't change.
  
  const handleViewportResize = () => {
    if (!window.visualViewport) return;

    const currentHeight = window.visualViewport.height;
    const diff = Math.abs(initialViewportHeight - currentHeight);

    // Filter out:
    // 1. Tiny changes (< 10px) (Browser chrome hiding/showing on scroll)
    // 2. Huge changes (> 300px) (Keyboard opening)
    // Target: The "Screenshot Editor" bar which is usually 50px - 150px
    if (diff > config.resizeThreshold && diff < 300) {
       // Check if it's a stable change (not just scrolling)
       onViolation?.({
         type: 'mobile_ui_obstruct',
         timestamp: Date.now(),
         details: { diff, initial: initialViewportHeight, current: currentHeight }
       });
    }

    // Update reference if stable for 2 seconds (e.g. user rotated phone)
    setTimeout(() => {
       if (window.visualViewport) initialViewportHeight = window.visualViewport.height;
    }, 2000);
  };

  // --- 2. Visibility & Blur Heuristic ---
  // Taking a screenshot often causes a momentary 'blur' or 'visibilityState' toggle
  // as the OS UI takes focus to save the image.

  const handleVisibilityChange = () => {
    const now = Date.now();
    if (document.hidden) {
      lastVisibilityChange = now;
      // If page goes hidden, we can't do much BUT we can log it.
      // Flag suspicious activity if it happens rapidly.
    } else {
      // Page became visible again.
      const timeHidden = now - lastVisibilityChange;
      
      // If hidden for a VERY short time (e.g., < 500ms), it's likely a screenshot flash
      // or system UI overlay interaction, not a user switching apps.
      if (timeHidden > 50 && timeHidden < 800) {
        onViolation?.({
          type: 'mobile_screenshot_suspect',
          timestamp: now,
          details: { reason: 'quick_hide_show', duration: timeHidden }
        });
      }
    }
  };

  const handleWindowBlur = () => {
     // Blur is less reliable on mobile, but combined with other signals it helps.
     // We treat it as a "warning" signal.
  };

  // --- 3. Touch Gesture Analysis ---

  const handlePointerDown = (e: PointerEvent) => {
    activePointers.set(e.pointerId, e);

    // Multi-Touch (3+ fingers)
    if (activePointers.size >= config.minMultiTouchCount) {
      onViolation?.({
        type: 'mobile_screenshot_gesture',
        timestamp: Date.now(),
        details: { pointerCount: activePointers.size }
      });
      activePointers.clear();
      return;
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    activePointers.delete(e.pointerId);
  };

  const handlePointerCancel = (e: PointerEvent) => {
    activePointers.delete(e.pointerId);
  };

  // --- 4. CSS Hardening ---
  const style = document.createElement('style');
  style.textContent = `
    body {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
      -webkit-touch-callout: none !important;
    }
    img, video, canvas {
      pointer-events: none !important;
      -webkit-user-drag: none !important;
    }
    /* Hide scrollbars to make screenshots uglier */
    ::-webkit-scrollbar {
      width: 0px;
      background: transparent;
    }
  `;
  document.head.appendChild(style);

  // --- Listeners ---
  const options: AddEventListenerOptions = { capture: true, passive: false };
  
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleViewportResize);
  } else {
    window.addEventListener('resize', handleViewportResize); // Fallback
  }

  window.addEventListener('pointerdown', handlePointerDown, options);
  window.addEventListener('pointerup', handlePointerUp, options);
  window.addEventListener('pointercancel', handlePointerCancel, options);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleWindowBlur);
  window.addEventListener('contextmenu', (e) => e.preventDefault(), options);

  return () => {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handleViewportResize);
    } else {
      window.removeEventListener('resize', handleViewportResize);
    }
    window.removeEventListener('pointerdown', handlePointerDown, options);
    window.removeEventListener('pointerup', handlePointerUp, options);
    window.removeEventListener('pointercancel', handlePointerCancel, options);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);
    if (style.parentNode) style.parentNode.removeChild(style);
  };
};