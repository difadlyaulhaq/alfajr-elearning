// lib/security/mobileProtection.ts
"use client";

/**
 * Proteksi Tambahan untuk Mobile Device
 * File ini berisi fungsi-fungsi tambahan untuk mencegah screenshot di mobile
 */

export class MobileScreenProtection {
  private static instance: MobileScreenProtection;
  private secureFlag: boolean = false;

  private constructor() {
    this.initMobileProtection();
  }

  public static getInstance(): MobileScreenProtection {
    if (!MobileScreenProtection.instance) {
      MobileScreenProtection.instance = new MobileScreenProtection();
    }
    return MobileScreenProtection.instance;
  }

  private initMobileProtection() {
    if (typeof window === 'undefined') return;

    // 1. Deteksi platform mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      this.applyMobileProtections();
    }
  }

  private applyMobileProtections() {
    // 1. Meta tag untuk Android (perlu ditambahkan ke head)
    this.addMetaTags();

    // 2. Deteksi screenshot di Android (menggunakan visibilitychange) - Disabled due to false positives
    // this.detectAndroidScreenshot();

    // 3. Deteksi iOS screenshot (menggunakan screenshot event jika tersedia) - Disabled due to false positives
    // this.detectIOSScreenshot();

    // 4. Prevent long-press context menu di mobile
    this.preventMobileContextMenu();

    // 5. Disable text selection di mobile
    this.disableMobileTextSelection();

    // 6. Detect screen recording di iOS
    this.detectIOSScreenRecording();
  }

  private addMetaTags() {
    // Meta tag untuk mencegah screenshot di beberapa browser Android
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    
    // Secure flag untuk Android WebView (jika dalam WebView)
    const secureMeta = document.createElement('meta');
    secureMeta.name = 'secure';
    secureMeta.content = 'true';
    
    if (!document.querySelector('meta[name="secure"]')) {
      document.head.appendChild(secureMeta);
    }
  }

  private detectAndroidScreenshot() {
    let lastHiddenTime = 0;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        lastHiddenTime = Date.now();
      } else {
        const hiddenDuration = Date.now() - lastHiddenTime;
        
        // Jika hidden duration sangat singkat (< 100ms), 
        // kemungkinan besar adalah screenshot
        if (hiddenDuration < 100 && hiddenDuration > 0) {
          this.onScreenshotDetected('Android Screenshot Detected');
        }
      }
    });
  }

  private detectIOSScreenshot() {
    // iOS tidak memiliki API screenshot, tapi kita bisa detect dengan cara lain
    // Menggunakan kombinasi events
    
    let touchStartTime = 0;
    let isTouchActive = false;

    window.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      isTouchActive = true;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      const touchDuration = Date.now() - touchStartTime;
      isTouchActive = false;
      
      // Screenshot iOS biasanya: Power + Volume Up (bersamaan)
      // Ini akan cause brief touch event yang sangat singkat
      if (touchDuration < 50) {
        this.onScreenshotDetected('Possible iOS Screenshot');
      }
    }, { passive: true });
  }

  private detectIOSScreenRecording() {
    // Deteksi screen recording di iOS menggunakan performance API
    if ('performance' in window && 'navigation' in performance) {
      const checkPerformance = () => {
        const navigation = performance.getEntriesByType('navigation')[0] as any;
        
        if (navigation && navigation.type === 'reload') {
          // Screen recording sering cause reload
          console.warn('Possible screen recording activity');
        }
      };

      setInterval(checkPerformance, 3000);
    }
  }

  private preventMobileContextMenu() {
    // Prevent long-press menu di mobile
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    }, { passive: false });

    // Prevent long-press selection
    let longPressTimer: NodeJS.Timeout;

    document.addEventListener('touchstart', (e) => {
      longPressTimer = setTimeout(() => {
        // Cancel long press
      }, 500);
    }, { passive: true });

    document.addEventListener('touchend', () => {
      clearTimeout(longPressTimer);
    }, { passive: true });

    document.addEventListener('touchmove', () => {
      clearTimeout(longPressTimer);
    }, { passive: true });
  }

  private disableMobileTextSelection() {
    // Tambahkan CSS untuk disable selection
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
      }
      
      input, textarea {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
    `;
    document.head.appendChild(style);
  }

  private onScreenshotDetected(method: string) {
    console.warn(`Screenshot attempt detected: ${method}`);
    
    // Trigger custom event yang bisa di-listen oleh aplikasi
    const event = new CustomEvent('screenshotAttempt', {
      detail: { method, timestamp: Date.now() }
    });
    window.dispatchEvent(event);

    // Tampilkan warning ke user
    this.showWarningToast();
  }

  private showWarningToast() {
    const toast = document.createElement('div');
    toast.className = 'screenshot-warning-toast';
    toast.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ef4444;
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 99999;
        font-weight: bold;
        animation: slideDown 0.3s ease-out;
      ">
        ⚠️ Screenshot tidak diperbolehkan!
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideUp 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Public method untuk enable/disable proteksi
  public enable() {
    this.secureFlag = true;
    this.initMobileProtection();
  }

  public disable() {
    this.secureFlag = false;
  }

  public isEnabled(): boolean {
    return this.secureFlag;
  }
}

// Animation CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from {
        transform: translateX(-50%) translateY(-100px);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes slideUp {
      from {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
      to {
        transform: translateX(-50%) translateY(-100px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Export singleton instance
export const mobileProtection = MobileScreenProtection.getInstance();
