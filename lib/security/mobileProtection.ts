// lib/security/mobileProtection.ts - UPDATED VERSION

export interface GestureConfig {
  minMultiTouchCount: number;
  palmRadiusThreshold: number;
  palmForceThreshold: number;
  swipeDistanceThreshold: number;
  swipeTimeout: number;
  comboTimeWindow: number;
  resizeThreshold: number;
  volumeButtonThreshold: number; // NEW
  powerButtonThreshold: number;  // NEW
}

const DEFAULT_CONFIG: GestureConfig = {
  minMultiTouchCount: 3,
  palmRadiusThreshold: 30,
  palmForceThreshold: 1,
  swipeDistanceThreshold: 50,
  swipeTimeout: 300,
  comboTimeWindow: 1500,
  resizeThreshold: 20,
  volumeButtonThreshold: 200, // Deteksi volume button press dalam 200ms
  powerButtonThreshold: 500,  // Deteksi power button double click dalam 500ms
};

// MERK-SPECIFIC CONFIGURATION
const MERK_CONFIGS = {
  // Samsung OneUI - Smart Capture menggunakan volume down + power
  SAMSUNG: {
    resizeThreshold: 80,
    comboTimeWindow: 800,
    volumeButtonThreshold: 300,
  },
  // Xiaomi MIUI/HyperOS - Biasanya 3 jari swipe down
  XIAOMI: {
    minMultiTouchCount: 3,
    swipeDistanceThreshold: 100, // Swipe lebih panjang
    palmRadiusThreshold: 40,
  },
  // iOS - Side button + volume up
  IOS: {
    resizeThreshold: 100,
    palmRadiusThreshold: 35,
    comboTimeWindow: 1000,
    volumeButtonThreshold: 250,
  },
  // Pixel Stock Android - Power + volume down
  PIXEL: {
    resizeThreshold: 60,
    minMultiTouchCount: 4,
    comboTimeWindow: 700,
  },
  // Oppo/Realme/OnePlus - 3 jari swipe
  OPPO: {
    minMultiTouchCount: 3,
    swipeDistanceThreshold: 80,
  },
  // Vivo - Super screenshot dengan 3 jari
  VIVO: {
    minMultiTouchCount: 3,
    palmRadiusThreshold: 45,
  },
};

// Deteksi merk device dari user agent
const detectMerk = (): keyof typeof MERK_CONFIGS | 'DEFAULT' => {
  if (typeof navigator === 'undefined') return 'DEFAULT';
  const ua = navigator.userAgent.toLowerCase();
  
  if (/samsung/i.test(ua)) return 'SAMSUNG';
  if (/xiaomi|redmi|poco|mi\s/i.test(ua)) return 'XIAOMI';
  if (/iphone|ipad|ipod/i.test(ua)) return 'IOS';
  if (/pixel/i.test(ua)) return 'PIXEL';
  if (/oppo/i.test(ua)) return 'OPPO';
  if (/vivo/i.test(ua)) return 'VIVO';
  if (/realme/i.test(ua)) return 'OPPO'; // Realme mirip Oppo
  if (/oneplus/i.test(ua)) return 'OPPO'; // OnePlus mirip Oppo
  
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

export interface ViolationEvent {
  type: string;
  timestamp: number;
  details?: any;
}

type ViolationCallback = (event: ViolationEvent) => void;

export const initializeMobileProtection = (
  onViolation?: ViolationCallback,
  customConfig?: Partial<GestureConfig>
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  // Gunakan config berdasarkan merk
  const merk = detectMerk();
  // @ts-ignore
  const merkConfig = MERK_CONFIGS[merk] || {};
  const config = { 
    ...DEFAULT_CONFIG, 
    ...merkConfig, 
    ...customConfig 
  };
  
  // State untuk hardware button detection
  const activePointers = new Map<number, PointerEvent>();
  let initialViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  // @ts-ignore
  let lastVisibilityChange = 0;
  
  // Hardware button tracking
  let lastVolumeKeyTime = 0;
  let lastPowerKeyTime = 0;
  let volumeKeyCount = 0;
  let powerKeyCount = 0;
  // @ts-ignore
  let lastBlurTime = 0;

  // --- HARDWARE BUTTON DETECTION ---
  // Di web, kita bisa mendeteksi volume button melalui:
  // 1. Event keydown dengan keyCode tertentu (tidak semua browser)
  // 2. Kombinasi dengan window.blur (saat OS mengambil screenshot)
  // 3. Perubahan viewport yang spesifik

  const handleKeyDown = (e: KeyboardEvent) => {
    // Deteksi volume buttons (keyCode 173 = Volume Down, 174 = Volume Up)
    // Note: Ini hanya bekerja di beberapa browser
    if (e.keyCode === 173 || e.keyCode === 174) { // Volume buttons
      const now = Date.now();
      volumeKeyCount++;
      
      // Deteksi rapid volume button presses
      if (now - lastVolumeKeyTime < config.volumeButtonThreshold) {
        onViolation?.({
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
      
      // Volume + Power combo detection
      if (now - lastPowerKeyTime < config.comboTimeWindow) {
        onViolation?.({
          type: 'mobile_hardware_combo',
          timestamp: now,
          details: { 
            combo: 'volume_power',
            merk 
          }
        });
      }
    }
    
    // Deteksi power button (keyCode 142 = Power)
    // Note: Power button biasanya tidak terdeteksi di browser
    // Kita menggunakan heuristic berdasarkan timing
  };

  // --- DOUBLE CLICK POWER DETECTION ---
  // Di web, kita tidak bisa langsung mendeteksi power button
  // Tapi kita bisa deteksi pola spesifik:
  // 1. Quick window.blur (saat power button ditekan)
  // 2. Rapid visibility changes
  // 3. Viewport resize tertentu

  const handleWindowBlur = () => {
    const now = Date.now();
    lastBlurTime = now;
    powerKeyCount++;
    
    // Deteksi double click power (2x blur cepat)
    if (now - lastPowerKeyTime < config.powerButtonThreshold) {
      onViolation?.({
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
    
    // Blur + Volume combo detection
    if (now - lastVolumeKeyTime < config.comboTimeWindow) {
      setTimeout(() => {
        if (document.hidden) {
          onViolation?.({
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

  // --- MERK-SPECIFIC GESTURE DETECTION ---
  
  const handlePointerMove = (e: PointerEvent) => {
    if (activePointers.size >= config.minMultiTouchCount) {
      // Deteksi gesture spesifik merk
      const pointers = Array.from(activePointers.values());
      
      // Samsung: 3 jari swipe down (vertikal)
      if (merk === 'SAMSUNG') {
        const startY = pointers[0].clientY;
        const currentY = e.clientY;
        const diffY = currentY - startY;
        
        if (Math.abs(diffY) > config.swipeDistanceThreshold) {
          onViolation?.({
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
      
      // Xiaomi/Oppo/Vivo: 3 jari swipe down panjang
      if (['XIAOMI', 'OPPO', 'VIVO'].includes(merk)) {
        const startY = pointers[0].clientY;
        const currentY = e.clientY;
        const diffY = currentY - startY;
        
        if (diffY > 150) { // Swipe panjang untuk Xiaomi
          onViolation?.({
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
    }
  };

  // Update pointer handlers untuk include merk-specific detection
  const handlePointerDown = (e: PointerEvent) => {
    activePointers.set(e.pointerId, e);

    // Multi-Touch Detection dengan threshold merk
    if (activePointers.size >= config.minMultiTouchCount) {
      onViolation?.({
        type: 'mobile_screenshot_gesture',
        timestamp: Date.now(),
        details: { 
          pointerCount: activePointers.size,
          merk,
          gesture: `${config.minMultiTouchCount}_finger_touch`
        }
      });
      
      // Untuk iOS: 3 jari swipe up (screenshot editor)
      if (merk === 'IOS' && activePointers.size === 3) {
        setTimeout(() => {
          onViolation?.({
            type: 'mobile_ios_screenshot_editor',
            timestamp: Date.now(),
            details: { merk: 'IOS' }
          });
        }, 500);
      }
    }
  };

  // --- VISUAL VIEWPORT DETECTION PER MERK ---
  
  const handleViewportResize = () => {
    if (!window.visualViewport) return;

    const currentHeight = window.visualViewport.height;
    const diff = Math.abs(initialViewportHeight - currentHeight);
    
    // Threshold berbeda per merk
    // @ts-ignore
    let merkThreshold = config.resizeThreshold;
    
    // iOS screenshot editor lebih tinggi
    if (merk === 'IOS' && diff > 80 && diff < 200) {
      onViolation?.({
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
    
    // Android screenshot bar biasanya 60-120px
    else if (['SAMSUNG', 'XIAOMI', 'PIXEL', 'OPPO', 'VIVO'].includes(merk)) {
      if (diff > 50 && diff < 150) {
        onViolation?.({
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

    // Update reference
    setTimeout(() => {
      if (window.visualViewport) {
        initialViewportHeight = window.visualViewport.height;
      }
    }, 2000);
  };
  
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

  // --- LISTENERS ---
  
  const options: AddEventListenerOptions = { capture: true, passive: false };
  
  // Hardware button listeners
  window.addEventListener('keydown', handleKeyDown, options);
  window.addEventListener('blur', handleWindowBlur);
  
  // Viewport listeners
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleViewportResize);
  } else {
    window.addEventListener('resize', handleViewportResize);
  }

  // Touch/pointer listeners
  window.addEventListener('pointerdown', handlePointerDown, options);
  window.addEventListener('pointermove', handlePointerMove, options);
  window.addEventListener('pointerup', (e) => activePointers.delete(e.pointerId), options);
  window.addEventListener('pointercancel', (e) => activePointers.delete(e.pointerId), options);
  
  // Visibility listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // CSS Hardening (sama seperti sebelumnya)
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
    ::-webkit-scrollbar {
      width: 0px;
      background: transparent;
    }
  `;
  document.head.appendChild(style);

  // Cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown, options);
    window.removeEventListener('blur', handleWindowBlur);
    
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