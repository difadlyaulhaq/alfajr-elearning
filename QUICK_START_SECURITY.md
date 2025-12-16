# Quick Start Guide - Fitur Keamanan Anti-Screenshot

## � File yang Digunakan

```
hooks/useScreenProtection.ts          # Hook proteksi
components/shared/ScreenProtection.tsx # Component wrapper
lib/security/mobileProtection.ts      # Mobile protection
proxy.ts                               # Security headers
app/api/security/log/route.ts         # Logging API
```

## �🚀 Implementasi Cepat (5 Menit)

### Sudah Aktif Otomatis ✅
Proteksi sudah terimplementasi di:
- ✅ Halaman Video/Lesson Player
- ✅ Semua halaman `/learning/*`

### Test Proteksi

1. **Buka halaman video pembelajaran**
   ```
   http://localhost:3000/learning/course/[courseId]/lesson/[lessonId]
   ```

2. **Test Screenshot Block (PC)**
   - Tekan `PrtScn` → Muncul warning
   - Tekan `Win + Shift + S` → Terblock
   - Klik kanan → Menu tidak muncul
   - Tekan `F12` → DevTools terblock

3. **Test Blur Protection**
   - Alt+Tab ke aplikasi lain
   - Konten akan blur otomatis
   - Kembali ke browser → Konten clear kembali

4. **Test Watermark**
   - Watermark muncul di berbagai posisi
   - Watermark bergerak secara dinamis

## 📱 Untuk Mobile

### Android
1. Buka website di Chrome Android
2. Coba screenshot (Volume Down + Power)
3. Akan terdeteksi dan muncul warning

### iOS
1. Buka website di Safari iOS
2. Coba screenshot (Power + Volume Up)
3. Sistem akan mendeteksi attempt

## 🎛️ Kustomisasi

### 1. Tambah Proteksi di Halaman Lain

```tsx
// Di halaman manapun yang perlu proteksi
import { ScreenProtection } from "@/components/shared/ScreenProtection";

export default function YourPage() {
  return (
    <ScreenProtection>
      <YourContent />
    </ScreenProtection>
  );
}
```

### 2. Kustomisasi Watermark

```tsx
<ScreenProtection
  watermarkText="KONTEN TERLINDUNGI - JANGAN DISEBARKAN"
  enableWatermark={true}
>
  <YourContent />
</ScreenProtection>
```

### 3. Nonaktifkan Fitur Tertentu

```tsx
<ScreenProtection
  enableWatermark={false}          // Matikan watermark
  enableBlurOnFocusLoss={false}    // Matikan blur
  enableKeyboardBlock={true}        // Tetap block keyboard
  showWarningOnAttempt={true}       // Tetap tampilkan warning
>
  <YourContent />
</ScreenProtection>
```

## 📊 Monitoring (Admin Only)

### Akses Security Monitor
```
http://localhost:3000/admin/security
```

Fitur:
- ✅ Lihat semua screenshot attempts
- ✅ Filter berdasarkan user/action
- ✅ Export logs ke CSV
- ✅ Real-time statistics

## 🔧 Troubleshooting

### Proteksi Tidak Bekerja?

1. **Clear Browser Cache**
   ```bash
   Ctrl + Shift + Delete
   ```

2. **Restart Dev Server**
   ```bash
   npm run dev
   ```

3. **Check Browser Console**
   - F12 (jika bisa)
   - Lihat error messages

### Performance Issue?

Kurangi jumlah watermark:
```tsx
// Di components/shared/ScreenProtection.tsx
// Ubah line: for (let i = 0; i < 8; i++)
// Menjadi: for (let i = 0; i < 4; i++)
```

## ⚙️ Konfigurasi Lanjutan

### Environment Variables (Optional)

Tambahkan di `.env.local`:
```env
# Security Settings
NEXT_PUBLIC_ENABLE_SCREENSHOT_PROTECTION=true
NEXT_PUBLIC_WATERMARK_TEXT="ALFAJR E-LEARNING"
NEXT_PUBLIC_SECURITY_LOGGING=true
```

### Update Sidebar Admin

Tambahkan menu Security di [components/admin/Sidebar.tsx](components/admin/Sidebar.tsx):
```tsx
{
  name: "Security",
  path: "/admin/security",
  icon: Shield,
}
```

## 📈 Metrics & Analytics

### Track Attempts
Semua attempts otomatis ter-log ke:
- Firestore collection: `security_logs`
- Fields: userId, action, timestamp, page, IP

### Query Logs via Console
```javascript
// Firebase Console
db.collection('security_logs')
  .where('action', '==', 'screenshot_attempt')
  .orderBy('timestamp', 'desc')
  .limit(10)
```

## 🔒 Best Practices

1. **Educate Users**
   - Tambahkan Terms & Conditions
   - Jelaskan kebijakan copyright
   - Display warning di awal course

2. **Regular Monitoring**
   - Check security logs mingguan
   - Identifikasi repeat offenders
   - Update proteksi jika ada bypass method baru

3. **Balance Security & UX**
   - Jangan terlalu agresif
   - Berikan feedback yang jelas
   - Allow legitimate use cases

## 📞 Support

Untuk masalah atau pertanyaan:
- Check [SECURITY_DOCUMENTATION.md](SECURITY_DOCUMENTATION.md)
- Review code di `hooks/useScreenProtection.ts`
- Check component di `components/shared/ScreenProtection.tsx`

## 🎯 Next Steps

1. ✅ Test di berbagai browser (Chrome, Firefox, Safari, Edge)
2. ✅ Test di mobile (iOS Safari, Chrome Android)
3. ✅ Monitor logs untuk 1 minggu pertama
4. ✅ Adjust sensitivity based on user feedback
5. ⏳ Implement DRM untuk video (advanced - tahap lanjutan)

---

**Developed with ❤️ for Alfajr E-Learning**
