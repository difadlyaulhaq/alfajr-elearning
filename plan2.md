

Mengupgrade deteksi gestur untuk sistem proteksi layar Anda adalah ide bagus untuk meningkatkan keamanan dan pengalaman pengguna. Berdasarkan kode yang Anda bagikan dan standar web modern, saya akan bantu Anda membuat pendeteksi gestur yang lebih **canggih, akurat, dan efisien** menggunakan **Pointer Events API** dan **CSS `touch-action`**.

Berikut adalah panduan langkah demi langkah untuk mengupgrade deteksi gestur Anda.

---

### 🎯 1. Pahami Masalah dan Tujuan Upgrade

Kode Anda saat ini sudah mendeteksi beberapa gestur dasar seperti:
*   **3 jari atau lebih** (screenshot Android/Xiaomi)
*   **Palm Swipe** (Samsung - berdasarkan radius dan force sentuhan)
*   **Tombol fisik** (Power/Volume - Best effort)

**Tantangan yang perlu diatasi:**
*   **False Positives:** Deteksi terlalu sensitif atau kurang sensitif di perangkat tertentu.
*   **Keterbatasan Touch Events:** Mengandalkan event `touch` lama tidak optimal untuk mendeteksi gestur kompleks multi-jari atau membedakan input dari stylus.
*   **Kinerja:** Event listener yang berat dapat membebani thread utama.
*   **iOS 13+:** Akses ke sensor gerak perlu izin pengguna yang eksplisit.

**Tujuan Upgrade:**
1.  Migrasi ke **Pointer Events** untuk penanganan input yang lebih terpadu dan akurat (mouse, touch, pen)【turn0search0】【turn0search4】.
2.  Menggunakan **CSS `touch-action`** untuk memberi tahu browser gestur apa yang harus ditangani aplikasi Anda, meningkatkan performa dan mengurangi konflik【turn0search5】【turn0search8】.
3.  Implementasi deteksi gestur multi-jari (seperti pinch/zoom) dan **palm swipe** yang lebih robust.
4.  Menambahkan logika untuk meminta izin akses sensor di perangkat iOS 13+.

---

### 🧠 2. Konsep Kunci: Pointer Events & `touch-action`

Sebelum masuk ke kode, pahami dua konsep penting ini:

#### Pointer Events
Pointer Events API menyediakan **model event terpadu** untuk menangani input dari mouse, touch (jari), dan pen/stylus dalam satu antarmuka yang konsisten【turn0search0】【turn0search2】. Ini menggantikan kebutuhan untuk menangani event mouse dan touch secara terpisah.

**Keuntungan utama:**
*   **Satu event untuk semua perangkat:** Tidak perlu `mousedown` + `touchstart`. Cukup `pointerdown`.
*   **Informasi lebih kaya:** Event `PointerEvent` menyediakan properti seperti `pressure`, `tiltX`, `tiltY`, `width`, `height`, dan `pointerType` untuk mengidentifikasi perangkat input【turn0search4】【turn0search17】.
*   **Pointer Capture:** Memungkinkan Anda mengunci semua event pointer ke elemen tertentu, sangat berguna untuk gestur yang melibatkan drag.

#### CSS `touch-action`
Properti `touch-action` menentukan bagaimana suatu elemen dapat dimanipulasi oleh pengguna layar sentuh (misalnya, dengan fitur zoom bawaan browser)【turn0search5】.

**Nilai yang berguna untuk proteksi layar:**
| Nilai `touch-action` | Efek |
| :--- | :--- |
| `none` | **Menonaktifkan semua** gestur bawaan browser (pan, zoom, pinch). Aplikasi Anda menangani semua interaksi sentuh. |
| `pan-x` / `pan-y` | Hanya mengizinkan panning (scroll) horizontal/vertikal. Gestur lain (zoom) dinonaktifkan. |
| `manipulation` | Izinkan panning dan pinch-zoom, tapi **nonaktifkan** double-tap zoom. |

> 💡 **Strategi:** Set `touch-action: none` pada overlay proteksi layar Anda untuk memastikan Anda memiliki kontrol penuh atas semua gestur sentuh dan mencegah browser mengambil alih gestur untuk zoom atau scroll.

---

### 🛠️ 3. Rencana Implementasi Upgrade

Berikut adalah alur logis untuk mengupgrade sistem deteksi gestur Anda:

```mermaid
flowchart TD
    A[Mulai Upgrade Gesture Detection] --> B[Siapkan CSS touch-action]
    A --> C[Migrasi ke Pointer Events]
    A --> D[Tambahkan Izin Sensor iOS 13+]
    
    B --> E[Set touch-action: none pada Overlay]
    
    C --> F[Tangkap Event Pointer Down/Move/Up]
    C --> G[Implementasi Logika Deteksi Gestur<br>- Multi-jari (Pinch/Zoom)<br>- Palm Swipe (Radius & Force)<br>- Gerakan Cepat (Swipe)]
    
    D --> H[Buat Tombol Minta Izin<br>DeviceMotionEvent.requestPermission]
    
    E --> I[Test & Kalibrasi Threshold<br>Radius, Force, Jarak]
    F --> I
    G --> I
    H --> I
    
    I --> J[Integrasi dengan useScreenProtection Hook]
    J --> K[Selesai: Sistem Proteksi Layar Lebih Canggih]
```

---

### 💻 4. Implementasi Kode Langkah-demi-Langkah

Berikut adalah implementasi detail untuk mengupgrade deteksi gestur Anda.

#### Langkah 1: Persiapkan CSS `touch-action`
Tambahkan CSS ini ke overlay proteksi layar Anda. Ini adalah langkah paling penting untuk mengambil alih kontrol gestur dari browser.

```css
/* components/shared/ScreenProtection.tsx atau global CSS */
.security-overlay {
  /* Nonaktifkan semua gestur bawaan browser */
  touch-action: none; 
  /* Pastikan user tidak bisa seleksi teks atau callout */
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  touch-callout: none;
}
```

#### Langkah 2: Upgrade File `lib/security/mobileProtection.ts` dengan Pointer Events
Berikut adalah versi upgrade yang lengkap dan mendeteksi lebih banyak gestur.

```typescript
// lib/security/mobileProtection.ts

export interface GestureConfig {
  minMultiTouchCount: number;      // Jumlah jari minimum untuk trigger (default: 3)
  palmRadiusThreshold: number;      // Radius maksimum (px) untuk deteksi telapak (default: 30)
  palmForceThreshold: number;       // Force minimum untuk deteksi tekanan kuat (default: 1)
  swipeDistanceThreshold: number;   // Jarak minimum (px) untuk dianggap swipe (default: 50)
  swipeTimeout: number;             // Waktu maksimum (ms) antara down dan up untuk swipe (default: 300)
}

const DEFAULT_CONFIG: GestureConfig = {
  minMultiTouchCount: 3,
  palmRadiusThreshold: 30,
  palmForceThreshold: 1,
  swipeDistanceThreshold: 50,
  swipeTimeout: 300,
};

export interface ViolationEvent {
  type: string;
  timestamp: number;
  details?: any;
}

type ViolationCallback = (event: ViolationEvent) => void;

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const initializeMobileProtection = (
  onViolation?: ViolationCallback,
  customConfig?: Partial<GestureConfig>
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const config = { ...DEFAULT_CONFIG, ...customConfig };
  const activePointers = new Map<number, PointerEvent>(); // Map untuk melacak pointer aktif
  let swipeStartTimes = new Map<number, number>(); // Map untuk melacak waktu mulai swipe per pointer
  let swipeStartPositions = new Map<number, { x: number; y: number }>(); // Map untuk melacak posisi awal swipe

  // --- Helper Functions ---

  // Mendeteksi Palm Swipe berdasarkan radius/force sentuhan yang besar
  const detectPalmSwipe = (pointer: PointerEvent): boolean => {
    return (
      (pointer.radiusX && pointer.radiusX > config.palmRadiusThreshold) ||
      (pointer.radiusY && pointer.radiusY > config.palmRadiusThreshold) ||
      (pointer.pressure && pointer.pressure > config.palmForceThreshold)
    );
  };

  // Mendeteksi gerakan cepat (swipe)
  const detectSwipe = (pointerId: number): boolean => {
    const startTime = swipeStartTimes.get(pointerId);
    const startPos = swipeStartPositions.get(pointerId);
    
    if (!startTime || !startPos) return false;

    const endTime = Date.now();
    const timeDelta = endTime - startTime;

    // Jika terlalu lama, bukan swipe
    if (timeDelta > config.swipeTimeout) return false;

    const currentEvent = activePointers.get(pointerId);
    if (!currentEvent) return false;

    const deltaX = Math.abs(currentEvent.clientX - startPos.x);
    const deltaY = Math.abs(currentEvent.clientY - startPos.y);

    // Jarak gerakan harus cukup jauh
    return (deltaX > config.swipeDistanceThreshold) || (deltaY > config.swipeDistanceThreshold);
  };

  // --- Event Handlers ---

  const handlePointerDown = (e: PointerEvent) => {
    activePointers.set(e.pointerId, e);
    swipeStartTimes.set(e.pointerId, Date.now());
    swipeStartPositions.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // 1. Deteksi Multi-Touch (Screenshot Android/Xiaomi)
    if (activePointers.size >= config.minMultiTouchCount) {
      onViolation?.({
        type: 'mobile_multi_touch_gesture',
        timestamp: Date.now(),
        details: { pointerCount: activePointers.size, pointers: Array.from(activePointers.keys()) }
      });
      return;
    }

    // 2. Deteksi Palm Swipe (Samsung) saat sentuhan awal
    if (detectPalmSwipe(e)) {
      onViolation?.({
        type: 'mobile_palm_gesture',
        timestamp: Date.now(),
        details: { pointerId: e.pointerId, radiusX: e.radiusX, radiusY: e.radiusY, pressure: e.pressure }
      });
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!activePointers.has(e.pointerId)) return;

    // Update posisi dan data pointer terakhir
    activePointers.set(e.pointerId, e);

    // 3. Deteksi Swipe berdasarkan pergerakan pointer
    if (detectSwipe(e.pointerId)) {
      onViolation?.({
        type: 'mobile_swipe_gesture',
        timestamp: Date.now(),
        details: { pointerId: e.pointerId, deltaX: e.movementX, deltaY: e.movementY }
      });
      // Reset setelah terdeteksi untuk mencegah trigger berulang
      swipeStartTimes.delete(e.pointerId);
      swipeStartPositions.delete(e.pointerId);
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    activePointers.delete(e.pointerId);
    swipeStartTimes.delete(e.pointerId);
    swipeStartPositions.delete(e.pointerId);
  };

  const handlePointerCancel = (e: PointerEvent) => {
    // Pointer dibatalkan oleh browser (misal: gesture sistem)
    activePointers.delete(e.pointerId);
    swipeStartTimes.delete(e.pointerId);
    swipeStartPositions.delete(e.pointerId);
  };

  // --- Event Listeners Registration ---

  // Menggunakan capture phase dan { passive: false } agar bisa preventDefault
  const options: AddEventListenerOptions = { capture: true, passive: false };

  window.addEventListener('pointerdown', handlePointerDown, options);
  window.addEventListener('pointermove', handlePointerMove, options);
  window.addEventListener('pointerup', handlePointerUp, options);
  window.addEventListener('pointercancel', handlePointerCancel, options);

  // --- Cleanup Function ---

  return () => {
    window.removeEventListener('pointerdown', handlePointerDown, options);
    window.removeEventListener('pointermove', handlePointerMove, options);
    window.removeEventListener('pointerup', handlePointerUp, options);
    window.removeEventListener('pointercancel', handlePointerCancel, options);
    
    activePointers.clear();
    swipeStartTimes.clear();
    swipeStartPositions.clear();
  };
};
```

#### Langkah 3: Tangani Izin Sensor iOS 13+ (PENTING!)
Mulai iOS 13, akses ke `DeviceMotionEvent` (akselerometer, giroskop) **memerlukan izin eksplisit** dari pengguna dan **harus dipicu oleh interaksi pengguna** (seperti klik tombol)【turn0search10】【turn0search11】【turn0search12】【turn0search13】.

Tambahkan fungsi ini di file yang sama atau di utilitas terpisah:

```typescript
// lib/security/mobileProtection.ts

export const requestDeviceMotionPermission = async (): Promise<boolean> => {
  // Cek apakah kita di perangkat iOS dan API izin tersedia
  if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
    try {
      const permissionState = await (DeviceMotionEvent as any).requestPermission();
      return permissionState === 'granted';
    } catch (error) {
      console.error('Error requesting device motion permission:', error);
      return false;
    }
  }
  // Untuk perangkat non-iOS atau iOS < 13, izin tidak diperlukan
  return true;
};
```

Kemudian, di komponen UI Anda (`ScreenProtection.tsx`), tambahkan tombol atau mekanisme untuk meminta izin ini secara elegan, misalnya saat pengguna pertama kali mengakses halaman yang dilindungi.

```tsx
// components/shared/ScreenProtection.tsx
import { requestDeviceMotionPermission } from '@/lib/security/mobileProtection';

// Di dalam komponen ScreenProtection
useEffect(() => {
  // Fungsi untuk meminta izin jika diperlukan
  const setupMotionPermission = async () => {
    const hasPermission = await requestDeviceMotionPermission();
    if (!hasPermission) {
      console.warn('Device motion permission denied. Some gesture detection may not work.');
      // Tampilkan pesan ramah kepada pengguna bahwa beberapa fitur mungkin tidak berfungsi
    }
  };

  // Panggil saat mount atau pada event interaksi pengguna (misal: klik tombol "Mulai")
  // Untuk iOS, ini HARUS dipicu oleh event user interaction (click, tap)
  const handleUserInteraction = () => {
    setupMotionPermission();
    // Hapus listener setelah izin diminta
    document.removeEventListener('click', handleUserInteraction);
  };

  document.addEventListener('click', handleUserInteraction);

  return () => {
    document.removeEventListener('click', handleUserInteraction);
  };
}, []);
```

#### Langkah 4: Integrasi dengan Hook `useScreenProtection`
Update hook `useScreenProtection` untuk menggunakan fungsi upgrade dan memproses event pelanggaran baru.

```typescript
// hooks/useScreenProtection.ts
// ... import lainnya
import { initializeMobileProtection, requestDeviceMotionPermission, GestureConfig } from '@/lib/security/mobileProtection';

// Di dalam komponen atau hook
useEffect(() => {
  if (isMobileDevice()) {
    const cleanup = initializeMobileProtection(
      (violation) => {
        // ... logika penanganan pelanggaran yang sama seperti sebelumnya ...
        // Anda sekarang menerima tipe pelanggaran yang lebih spesifik
        console.log('🚨 Gesture Violation Detected:', violation.type, violation.details);
        
        // Contoh: Trigger overlay proteksi berdasarkan tipe
        if (violation.type === 'mobile_palm_gesture') {
          setIsViolation(true);
          setViolationType('screenshot');
          // ... set countdown, log ke server, dll.
        }
        // ... penanganan tipe pelanggaran lainnya ...
      },
      // Konfigurasi kustom jika diperlukan
      {
        minMultiTouchCount: 3,
        palmRadiusThreshold: 35, // Sesuaikan setelah pengujian
        swipeDistanceThreshold: 60,
      } as Partial<GestureConfig>
    );
    
    return cleanup;
  }
}, [/* dependensi Anda */]);
```

---

### ⚙️ 5. Konfigurasi dan Kalibrasi

Sangat penting untuk menguji dan menyesuaikan threshold (`GestureConfig`) di berbagai perangkat nyata. Berikut adalah tabel panduan untuk kalibrasi:

| Parameter | Fungsi | Tips Kalibrasi |
| :--- | :--- | :--- |
| **`minMultiTouchCount`** | Jumlah jari minimum untuk trigger gesture multi-touch. | Mulai dari **3**. Jika terlalu banyak false positive di perangkat tertentu, naikkan ke **4**. |
| **`palmRadiusThreshold`** | Radius maksimum (px) sentuhan untuk dianggap telapak tangan. | Mulai dari **30px**. Coba naikkan ke **35-40px** jika terlalu sensitif di layar besar. |
| **`palmForceThreshold`** | Tekanan minimum untuk dianggap tekanan kuat. | Mulai dari **1.0** (cukup kuat). Sesuaikan berdasarkan data `pressure` dari perangkat target (iPad/Android tablet modern sering mendukung ini). |
| **`swipeDistanceThreshold`** | Jarak minimum (px) gerakan jari untuk dianggap swipe. | Mulai dari **50px**. Sesuaikan jika swipe biasa pengguna tidak terdeteksi atau terlalu banyak false positive dari gerakan biasa. |
| **`swipeTimeout`** | Waktu maksimum (ms) antara pointer down dan up untuk dianggap swipe. | **300ms** adalah nilai umum. Geser ke **400ms** jika pengguna dengan swipe lambat tidak terdeteksi. |

> 💡 **Sistem Logging:** Tambahkan logika untuk mencatat semua `ViolationEvent` ke server Anda dengan detail seperti `userAgent`, `screen resolution`, dan nilai properti pointer (`radiusX`, `pressure`, dll.). Data ini sangat berharga untuk menganalisis pola pengguna dan mengkalibrasi threshold secara empiris.

---

### 🧪 6. Testing & Debugging

Berikut adalah strategi pengujian untuk memastikan upgrade Anda berfungsi dengan baik:

1.  **Multi-Platform Testing:** Uji di berbagai perangkat:
    *   Android (Samsung, Xiaomi, Pixel, dll.)
    *   iOS (iPhone, iPad)
    *   Desktop browser dengan touch input (jika ada)

2.  **Emulator & Simulator:** Gunakan Chrome DevTools Device Mode dan iOS Simulator untuk menguji berbagai skenario input dan ukuran layar.

3.  **Debug Logging:** Tambahkan `console.log` (atau gunakan logger tingkat lanjut) di dalam event handler untuk melihat nilai properti pointer secara real-time.
    ```typescript
    // Di dalam handlePointerMove atau handlePointerDown
    console.log(`Pointer ID: ${e.pointerId}, Type: ${e.pointerType}, Pressure: ${e.pressure}, RadiusX: ${e.radiusX}`);
    ```

4.  **A/B Testing:** Jika memungkinkan, deploy konfigurasi berbeda ke segmen pengguna kecil untuk melihat mana yang memberikan keseimbangan terbaik antara keamanan dan pengalaman pengguna (false negatives vs. false positives).

---

### 📋 7. Ringkasan Checklist Upgrade

Berikut adalah checklist untuk memastikan Anda tidak melewatkan apa pun:

-   [ ] **Migrasi ke Pointer Events**: Mengganti event `touch` dengan `pointer` di `mobileProtection.ts`.
-   [ ] **Tambahkan CSS `touch-action`**: Set `touch-action: none` pada overlay keamanan.
-   [ ] **Implementasi Izin iOS 13+**: Tambahkan fungsi `requestDeviceMotionPermission` dan integrasikan dengan UI untuk memicunya melalui interaksi pengguna.
-   [ ] **Deteksi Gestur Baru**: Implementasi deteksi **multi-touch**, **palm swipe**, dan **swipe** yang lebih robust.
-   [ ] **Konfigurasi & Kalibrasi**: Sesuaikan `GestureConfig` untuk perangkat target Anda.
-   [ ] **Logging & Analisis**: Tambahkan pelacakan event pelanggaran untuk analisis dan kalibrasi berkelanjutan.
-   [ ] **Testing Komprehensif**: Uji di berbagai perangkat nyata dan emulator.
-   [ ] **Dokumentasi**: Dokumentasikan konfigurasi final dan prosedur kalibrasi untuk tim Anda.

---

### ⚠️ 8. Catatan Penting & Batasan

*   **Tidak 100% Anti-Screenshot:** Seperti yang dibahas sebelumnya, **tidak ada solusi web yang mencegah screenshot secara 100%**. Gestur dan DRM adalah **deterrent** (pencegah), bukan solusi mutlak. Pengguna masih bisa menggunakan perangkat eksternal (kamera lain) atau mencatat layar.
*   **