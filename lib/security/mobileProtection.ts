// lib/security/mobileProtection.ts - ENHANCED VERSION
// This version adds more aggressive detection methods

export interface GestureConfig {
  minMultiTouchCount: number;
  palmRadiusThreshold: number;
  palmForceThreshold: number;
  swipeDistanceThreshold: number;
  swipeTimeout: number;
  comboTimeWindow: number;
  resizeThreshold: number;
  volumeButtonThreshold: number;
  powerButtonThreshold: number;
  rapidScreenChangeThreshold: number;
}

const DEFAULT_CONFIG: GestureConfig = {
  minMultiTouchCount: 3,
  palmRadiusThreshold: 30,
  palmForceThreshold: 1,
  swipeDistanceThreshold: 50,
  swipeTimeout: 300,
  comboTimeWindow: 1500,
  resizeThreshold: 20,
  volumeButtonThreshold: 1,
  powerButtonThreshold: 1 ,
  rapidScreenChangeThreshold: 1, // NEW: Detect rapid screen captures
};

// EXPANDED MERK-SPECIFIC CONFIGURATION
const MERK_CONFIGS = {
  SAMSUNG: {
    resizeThreshold: 80,
    comboTimeWindow: 800,
    volumeButtonThreshold: 300,
    gestures: ['palm_swipe', 'edge_panel', 'volume_power']
  },
  XIAOMI: {
    minMultiTouchCount: 3,
    swipeDistanceThreshold: 100,
    palmRadiusThreshold: 40,
    gestures: ['three_finger_down', 'notification_bar_expand']
  },
  IOS: {
    resizeThreshold: 100,
    palmRadiusThreshold: 35,
    comboTimeWindow: 1000,
    volumeButtonThreshold: 250,
    gestures: ['side_volume', 'assistive_touch']
  },
  PIXEL: {
    resizeThreshold: 60,
    minMultiTouchCount: 4,
    comboTimeWindow: 700,
    gestures: ['power_volume', 'recent_apps_edge']
  },
  OPPO: {
    minMultiTouchCount: 3,
    swipeDistanceThreshold: 80,
    gestures: ['three_finger_swipe', 'smart_sidebar']
  },
  VIVO: {
    minMultiTouchCount: 3,
    palmRadiusThreshold: 45,
    gestures: ['three_finger_screenshot', 's_capture']
  },
  HUAWEI: {
    minMultiTouchCount: 2,
    palmRadiusThreshold: 50,
    gestures: ['knuckle_double_tap', 'knuckle_swipe']
  },
  REALME: {
    minMultiTouchCount: 3,
    swipeDistanceThreshold: 90,
    gestures: ['three_finger_swipe', 'sidebar_screenshot']
  },
};

// Enhanced device detection
const detectMerk = (): keyof typeof MERK_CONFIGS | 'DEFAULT' => {
  if (typeof navigator === 'undefined') return 'DEFAULT';
  const ua = navigator.userAgent.toLowerCase();
  
  if (/samsung/i.test(ua)) return 'SAMSUNG';
  if (/xiaomi|redmi|poco|mi\s/i.test(ua)) return 'XIAOMI';
  if (/iphone|ipad|ipod/i.test(ua)) return 'IOS';
  if (/pixel/i.test(ua)) return 'PIXEL';
  if (/oppo/i.test(ua)) return 'OPPO';
  if (/vivo/i.test(ua)) return 'VIVO';
  if (/huawei|honor/i.test(ua)) return 'HUAWEI';
  if (/realme/i.test(ua)) return 'REALME';
  if (/oneplus/i.test(ua)) return 'OPPO';
  
  return 'DEFAULT';
};

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export const isNativeApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return navigator.userAgent.includes('AlfajrApp');
};

export interface ViolationEvent {
  type: string;
  timestamp: number;
  details?: any;
}

type ViolationCallback = (event: ViolationEvent) => void;

// NEW: Screen brightness monitoring (Android specific)
let lastBrightness = 1;
const monitorBrightness = (onViolation: ViolationCallback, merk: string) => {
  if ('getBattery' in navigator) {
    // @ts-ignore
    navigator.getBattery().then((battery) => {
      // Some Android devices dim screen briefly during screenshot
      const checkBrightness = () => {
        // @ts-ignore
        const currentBrightness = window.screen.brightness || 1;
        const diff = Math.abs(lastBrightness - currentBrightness);
        
        if (diff > 0.3 && diff < 0.8) {
          onViolation({
            type: 'mobile_brightness_anomaly',
            timestamp: Date.now(),
            details: { 
              diff,
              merk,
              reason: 'rapid_brightness_change'
            }
          });
        }
        
        lastBrightness = currentBrightness;
      };
      
      setInterval(checkBrightness, 100);
    });
  }
};

// NEW: Media query monitoring for orientation and display changes
const monitorMediaChanges = (onViolation: ViolationCallback, merk: string) => {
  let lastOrientation = window.screen.orientation?.type;
  let changeCount = 0;
  let lastChangeTime = Date.now();
  
  const orientationQuery = window.matchMedia('(orientation: portrait)');
  
  const handleOrientationChange = () => {
    const now = Date.now();
    const timeSinceLastChange = now - lastChangeTime;
    
    // Rapid orientation changes might indicate screenshot manipulation
    if (timeSinceLastChange < 500) {
      changeCount++;
      
      if (changeCount > 2) {
        onViolation({
          type: 'mobile_rapid_orientation_change',
          timestamp: now,
          details: { 
            count: changeCount,
            merk,
            suspiciousActivity: true
          }
        });
      }
    } else {
      changeCount = 0;
    }
    
    lastChangeTime = now;
    lastOrientation = window.screen.orientation?.type;
  };
  
  orientationQuery.addEventListener('change', handleOrientationChange);
  
  if (window.screen.orientation) {
    window.screen.orientation.addEventListener('change', handleOrientationChange);
  }
};

// NEW: Canvas fingerprinting detection
const monitorCanvasActivity = (onViolation: ViolationCallback, merk: string) => {
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
  
  let canvasCallCount = 0;
  let lastCanvasCall = Date.now();
  
  // Override toDataURL
  HTMLCanvasElement.prototype.toDataURL = function(...args) {
    const now = Date.now();
    
    if (now - lastCanvasCall < 1000) {
      canvasCallCount++;
      
      if (canvasCallCount > 3) {
        onViolation({
          type: 'mobile_canvas_extraction',
          timestamp: now,
          details: { 
            method: 'toDataURL',
            count: canvasCallCount,
            merk
          }
        });
      }
    } else {
      canvasCallCount = 0;
    }
    
    lastCanvasCall = now;
    return originalToDataURL.apply(this, args);
  };
  
  // Override getImageData
  CanvasRenderingContext2D.prototype.getImageData = function(...args) {
    const now = Date.now();
    
    if (now - lastCanvasCall < 1000) {
      canvasCallCount++;
      
      if (canvasCallCount > 5) {
        onViolation({
          type: 'mobile_canvas_extraction',
          timestamp: now,
          details: { 
            method: 'getImageData',
            count: canvasCallCount,
            merk
          }
        });
      }
    }
    
    lastCanvasCall = now;
    return originalGetImageData.apply(this, args);
  };
};

// NEW: Network activity monitoring (screenshot upload detection)
const monitorNetworkActivity = (onViolation: ViolationCallback, merk: string) => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming;
            
            // Detect large POST requests (potential screenshot uploads)
            if (resource.transferSize > 500000) { // 500KB+
              onViolation({
                type: 'mobile_large_upload_detected',
                timestamp: Date.now(),
                details: { 
                  size: resource.transferSize,
                  url: resource.name,
                  merk
                }
              });
            }
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('PerformanceObserver not fully supported');
    }
  }
};

// NEW: Clipboard monitoring (enhanced)
const monitorClipboard = (onViolation: ViolationCallback, merk: string) => {
  let clipboardAccessCount = 0;
  let lastClipboardAccess = Date.now();
  
  // Monitor clipboard writes
  const originalWriteText = navigator.clipboard?.writeText;
  if (originalWriteText) {
    navigator.clipboard.writeText = async function(...args) {
      const now = Date.now();
      
      if (now - lastClipboardAccess < 2000) {
        clipboardAccessCount++;
        
        if (clipboardAccessCount > 2) {
          onViolation({
            type: 'mobile_clipboard_spam',
            timestamp: now,
            details: { 
              count: clipboardAccessCount,
              merk
            }
          });
        }
      } else {
        clipboardAccessCount = 0;
      }
      
      lastClipboardAccess = now;
      return originalWriteText.apply(this, args);
    };
  }
  
  // Monitor paste events
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          onViolation({
            type: 'mobile_clipboard_image_paste',
            timestamp: Date.now(),
            details: { 
              type: items[i].type,
              merk
            }
          });
        }
      }
    }
  });
};

// NEW: Page lifecycle monitoring
const monitorPageLifecycle = (onViolation: ViolationCallback, merk: string) => {
  let freezeCount = 0;
  let lastFreezeTime = Date.now();
  
  document.addEventListener('freeze', () => {
    const now = Date.now();
    
    if (now - lastFreezeTime < 3000) {
      freezeCount++;
      
      if (freezeCount > 2) {
        onViolation({
          type: 'mobile_rapid_freeze',
          timestamp: now,
          details: { 
            count: freezeCount,
            merk,
            reason: 'possible_screenshot_sequence'
          }
        });
      }
    } else {
      freezeCount = 0;
    }
    
    lastFreezeTime = now;
  });
  
  document.addEventListener('resume', () => {
    // Page resumed - check if it was a very short freeze
    const now = Date.now();
    const freezeDuration = now - lastFreezeTime;
    
    if (freezeDuration < 500 && freezeDuration > 50) {
      onViolation({
        type: 'mobile_quick_freeze_resume',
        timestamp: now,
        details: { 
          duration: freezeDuration,
          merk
        }
      });
    }
  });
};

export const initializeMobileProtection = (
  onViolation?: ViolationCallback,
  customConfig?: Partial<GestureConfig>
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const merk = detectMerk();
  const merkConfig = merk === 'DEFAULT' ? {} : MERK_CONFIGS[merk] || {};
  const config = { 
    ...DEFAULT_CONFIG, 
    ...merkConfig, 
    ...customConfig 
  };
  
  const activePointers = new Map<number, PointerEvent>();
  let initialViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  let lastVisibilityChange = 0;
  let lastVolumeKeyTime = 0;
  let lastPowerKeyTime = 0;
  let volumeKeyCount = 0;
  let powerKeyCount = 0;
  let lastBlurTime = 0;
  let visibilityChangeCount = 0;
  let lastScreenshotTime = 0;
  
  const callback = onViolation || (() => {});

  // Initialize all monitoring systems
  monitorBrightness(callback, merk);
  monitorMediaChanges(callback, merk);
  monitorCanvasActivity(callback, merk);
  monitorNetworkActivity(callback, merk);
  monitorClipboard(callback, merk);
  monitorPageLifecycle(callback, merk);

  // Hardware button detection
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.keyCode === 173 || e.keyCode === 174) {
      const now = Date.now();
      volumeKeyCount++;
      
      if (now - lastVolumeKeyTime < config.volumeButtonThreshold) {
        callback({
          type: 'mobile_hardware_button',
          timestamp: now,
          details: { 
            button: 'volume',
            count: volumeKeyCount,
            merk 
          }
        });
      }
      
      lastVolumeKeyTime = now;
      
      if (now - lastPowerKeyTime < config.comboTimeWindow) {
        callback({
          type: 'mobile_hardware_combo',
          timestamp: now,
          details: { 
            combo: 'volume_power',
            merk 
          }
        });
      }
    }
  };

  const handleWindowBlur = () => {
    const now = Date.now();
    lastBlurTime = now;
    powerKeyCount++;
    
    // Enhanced double-click detection
    if (now - lastPowerKeyTime < config.powerButtonThreshold) {
      callback({
        type: 'mobile_power_double_click',
        timestamp: now,
        details: { 
          count: powerKeyCount,
          timeBetween: now - lastPowerKeyTime,
          merk 
        }
      });
    }
    
    lastPowerKeyTime = now;
    
    // Check for screenshot timing pattern
    if (now - lastScreenshotTime < 5000) {
      callback({
        type: 'mobile_rapid_screenshot_attempt',
        timestamp: now,
        details: { 
          timeSinceLastAttempt: now - lastScreenshotTime,
          merk 
        }
      });
    }
    
    lastScreenshotTime = now;
    
    if (now - lastVolumeKeyTime < config.comboTimeWindow) {
      setTimeout(() => {
        if (document.hidden) {
          callback({
            type: 'mobile_hardware_combo',
            timestamp: Date.now(),
            details: { 
              combo: 'power_volume',
              merk 
            }
          });
        }
      }, 100);
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (activePointers.size >= config.minMultiTouchCount) {
      const pointers = Array.from(activePointers.values());
      
      if (merk === 'SAMSUNG') {
        const startY = pointers[0].clientY;
        const currentY = e.clientY;
        const diffY = currentY - startY;
        
        if (Math.abs(diffY) > config.swipeDistanceThreshold) {
          callback({
            type: 'mobile_merk_gesture',
            timestamp: Date.now(),
            details: { 
              merk: 'SAMSUNG',
              gesture: 'three_finger_swipe_down',
              distance: diffY 
            }
          });
        }
      }
      
      if (['XIAOMI', 'OPPO', 'VIVO', 'REALME'].includes(merk)) {
        const startY = pointers[0].clientY;
        const currentY = e.clientY;
        const diffY = currentY - startY;
        
        if (diffY > 150) {
          callback({
            type: 'mobile_merk_gesture',
            timestamp: Date.now(),
            details: { 
              merk,
              gesture: 'three_finger_long_swipe',
              distance: diffY 
            }
          });
        }
      }
      
      // Huawei knuckle detection (pressure simulation)
      if (merk === 'HUAWEI') {
        const totalPressure = pointers.reduce((sum, p) => sum + (p.pressure || 0), 0);
        const avgPressure = totalPressure / pointers.length;
        
        if (avgPressure > 0.7) {
          callback({
            type: 'mobile_merk_gesture',
            timestamp: Date.now(),
            details: { 
              merk: 'HUAWEI',
              gesture: 'knuckle_pressure',
              pressure: avgPressure 
            }
          });
        }
      }
    }
  };

  const handlePointerDown = (e: PointerEvent) => {
    activePointers.set(e.pointerId, e);

    if (activePointers.size >= config.minMultiTouchCount) {
      callback({
        type: 'mobile_screenshot_gesture',
        timestamp: Date.now(),
        details: { 
          pointerCount: activePointers.size,
          merk,
          gesture: `${activePointers.size}_finger_touch`
        }
      });
      
      if (merk === 'IOS' && activePointers.size === 3) {
        setTimeout(() => {
          callback({
            type: 'mobile_ios_screenshot_editor',
            timestamp: Date.now(),
            details: { merk: 'IOS' }
          });
        }, 500);
      }
    }
  };

  const handleViewportResize = () => {
    if (!window.visualViewport) return;

    const currentHeight = window.visualViewport.height;
    const diff = Math.abs(initialViewportHeight - currentHeight);
    
    if (merk === 'IOS' && diff > 80 && diff < 200) {
      callback({
        type: 'mobile_ui_obstruct',
        timestamp: Date.now(),
        details: { 
          diff, 
          initial: initialViewportHeight, 
          current: currentHeight,
          merk: 'IOS',
          reason: 'screenshot_editor_bar'
        }
      });
    }
    else if (['SAMSUNG', 'XIAOMI', 'PIXEL', 'OPPO', 'VIVO', 'HUAWEI', 'REALME'].includes(merk)) {
      if (diff > 50 && diff < 150) {
        callback({
          type: 'mobile_ui_obstruct',
          timestamp: Date.now(),
          details: { 
            diff, 
            initial: initialViewportHeight, 
            current: currentHeight,
            merk,
            reason: 'screenshot_toolbar'
          }
        });
      }
    }

    setTimeout(() => {
      if (window.visualViewport) {
        initialViewportHeight = window.visualViewport.height;
      }
    }, 2000);
  };
  
  const handleVisibilityChange = () => {
    const now = Date.now();
    visibilityChangeCount++;
    
    if (document.hidden) {
      lastVisibilityChange = now;
    } else {
      const timeHidden = now - lastVisibilityChange;
      
      // Very quick hide/show is suspicious
      if (timeHidden > 50 && timeHidden < 800) {
        callback({
          type: 'mobile_screenshot_suspect',
          timestamp: now,
          details: { 
            reason: 'quick_hide_show', 
            duration: timeHidden,
            count: visibilityChangeCount,
            merk
          }
        });
      }
      
      // Reset counter after 5 seconds
      setTimeout(() => {
        visibilityChangeCount = 0;
      }, 5000);
    }
  };

  // Enhanced scroll detection (some devices show screenshot bar on scroll)
  let lastScrollY = window.scrollY;
  let scrollChangeCount = 0;
  
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    const scrollDiff = Math.abs(currentScrollY - lastScrollY);
    
    // Detect abnormal scroll patterns during screenshot
    if (scrollDiff > 200 && scrollDiff < 500) {
      scrollChangeCount++;
      
      if (scrollChangeCount > 3) {
        callback({
          type: 'mobile_abnormal_scroll',
          timestamp: Date.now(),
          details: { 
            diff: scrollDiff,
            count: scrollChangeCount,
            merk
          }
        });
      }
    }
    
    lastScrollY = currentScrollY;
    
    setTimeout(() => {
      scrollChangeCount = 0;
    }, 3000);
  };

  // Event listeners
  const options: AddEventListenerOptions = { capture: true, passive: false };
  
  window.addEventListener('keydown', handleKeyDown, options);
  window.addEventListener('blur', handleWindowBlur);
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleViewportResize);
  } else {
    window.addEventListener('resize', handleViewportResize);
  }

  window.addEventListener('pointerdown', handlePointerDown, options);
  window.addEventListener('pointermove', handlePointerMove, options);
  window.addEventListener('pointerup', (e) => activePointers.delete(e.pointerId), options);
  window.addEventListener('pointercancel', (e) => activePointers.delete(e.pointerId), options);
  
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // CSS Hardening - More aggressive
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
      -webkit-touch-callout: none !important;
      -webkit-tap-highlight-color: transparent !important;
    }
    
    img, video, canvas, svg {
      pointer-events: none !important;
      -webkit-user-drag: none !important;
      -khtml-user-drag: none !important;
      -moz-user-drag: none !important;
      -o-user-drag: none !important;
      user-drag: none !important;
    }
    
    /* Hide scrollbars completely */
    ::-webkit-scrollbar {
      width: 0px !important;
      height: 0px !important;
      background: transparent !important;
    }
    
    /* Prevent long press context menu */
    * {
      -webkit-touch-callout: none !important;
    }
    
    /* Add noise overlay to make screenshots less clear */
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0.02;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      z-index: 9999;
      mix-blend-mode: overlay;
    }
  `;
  document.head.appendChild(style);

  // Cleanup
  return () => {
    window.removeEventListener('keydown', handleKeyDown, options);
    window.removeEventListener('blur', handleWindowBlur);
    window.removeEventListener('scroll', handleScroll);
    
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handleViewportResize);
    } else {
      window.removeEventListener('resize', handleViewportResize);
    }
    
    window.removeEventListener('pointerdown', handlePointerDown, options);
    window.removeEventListener('pointermove', handlePointerMove, options);
    window.removeEventListener('pointerup', (e) => activePointers.delete(e.pointerId), options);
    window.removeEventListener('pointercancel', (e) => activePointers.delete(e.pointerId), options);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    
    if (style.parentNode) style.parentNode.removeChild(style);
  };
};

export const requestDeviceMotionPermission = async (): Promise<boolean> => {
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof (DeviceMotionEvent as any).requestPermission === 'function'
  ) {
    try {
      const permissionState = await (DeviceMotionEvent as any).requestPermission();
      return permissionState === 'granted';
    } catch (error) {
      console.error('Error requesting device motion permission:', error);
      return false;
    }
  }
  return true; // Not required on non-iOS 13+ devices
};