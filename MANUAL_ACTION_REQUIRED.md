# 🚨 MANUAL ACTION REQUIRED: Setup Security & Build APK

Karena kamu belum melakukan apa-apa, ikuti panduan langkah demi langkah ini. Ini **WAJIB** dilakukan agar Login Google berfungsi dan APK bisa diinstall di HP user.

---

## 1. Membuat Kunci Rahasia (Keystore)
Kita perlu membuat "tanda tangan digital" agar aplikasi kamu dipercaya oleh Android dan Google.

1.  Buka terminal di VS Code (pastikan di folder root project).
2.  Copy-paste perintah ini dan tekan **Enter**:

    ```powershell
    keytool -genkey -v -keystore android/app/my-release-key.keystore -alias alfajr_key -keyalg RSA -keysize 2048 -validity 10000
    ```

3.  **PENTING:** Saat diminta password:
    *   Buat password yang mudah diingat (misal: `alfajr123`).
    *   **Catat password ini!** Kamu akan butuh nanti.
    *   Untuk pertanyaan nama, organisasi, dll: Boleh diisi bebas atau tekan Enter saja sampai selesai.
    *   Ketik `yes` jika ditanya konfirmasi.

---

## 2. Mengambil Kode Sidik Jari (SHA-1)
Firebase butuh kode unik dari keystore yang baru saja kamu buat.

1.  Di terminal yang sama, jalankan perintah ini:

    ```powershell
    keytool -keystore android/app/my-release-key.keystore -list -v
    ```

2.  Masukkan password yang tadi kamu buat (`alfajr123`).
3.  Layar akan menampilkan banyak teks. Cari bagian **Certificate fingerprints**:
4.  Copy kode di sebelah tulisan **SHA1**.
    *   Contoh: `AA:BB:CC:11:22:33:44...` (Copy semuanya).

---

## 3. Daftarkan ke Firebase Console
1.  Buka browser, masuk ke [Firebase Console](https://console.firebase.google.com/).
2.  Pilih project **Alfajr E-Learning**.
3.  Klik icon **Gear (Pengaturan)** di kiri atas > **Project settings**.
4.  Scroll ke bawah sampai bagian **Your apps**.
5.  Pilih App Android kamu (`com.alfajr.elearning`).
6.  Klik tombol **Add fingerprint**.
7.  **Paste** kode SHA1 yang tadi kamu copy.
8.  Klik **Save**.

---

## 4. Update File Konfigurasi
Karena ada perubahan SHA1, file konfigurasi lama sudah kadaluarsa.

1.  Masih di halaman Firebase yang sama, cari tombol **google-services.json**.
2.  Download file tersebut.
3.  Cari file hasil download tadi.
4.  Pindahkan/Copy file `google-services.json` yang baru ke dalam folder project kamu di:
    `D:\project\alfajrelearning\alfajr-elearning\android\app\`
5.  **Timpa (Replace)** file yang lama.

---

## 5. Build Aplikasi (Final)
Sekarang saatnya membuat file APK yang siap disebar.

1.  **Build Next.js:**
    Jalankan perintah ini di terminal VS Code:
    ```powershell
    npx next build
    ```

2.  **Sinkronisasi ke Android:**
    Jalankan perintah ini:
    ```powershell
    npx cap sync
    ```

3.  **Buka Android Studio:**
    Jalankan perintah ini:
    ```powershell
    npx cap open android
    ```
    *(Tunggu sampai Android Studio terbuka sempurna & loading selesai)*

---

## 6. Generate APK Release (Di Android Studio)
Lakukan langkah ini di dalam aplikasi **Android Studio**:

1.  Klik menu **Build** (di baris atas) > **Generate Signed Bundle / APK**.
2.  Pilih **APK** > Klik **Next**.
3.  Di kolom **Key store path**, klik tombol folder, lalu cari file:
    `D:\project\alfajrelearning\alfajr-elearning\android\app\my-release-key.keystore`
4.  Isi password:
    *   **Key store password:** `alfajr123` (sesuai yang kamu buat)
    *   **Key alias:** `alfajr_key` (klik panah bawah jika tidak muncul)
    *   **Key password:** `alfajr123`
5.  Centang **Remember passwords** agar tidak repot nanti. Klik **Next**.
6.  Pilih **release**.
7.  **PENTING:** Centang kedua kotak Signature Versions:
    *   [x] **V1 (Jar Signature)**
    *   [x] **V2 (Full APK Signature)**
8.  Klik **Create**.

---

## 7. Ambil File APK
Setelah proses selesai (muncul notifikasi "Build Successful"):

1.  Klik notifikasi **locate** di pojok kanan bawah Android Studio, ATAU;
2.  Buka File Explorer di Windows, masuk ke:
    `D:\project\alfajrelearning\alfajr-elearning\android\app\release\`
3.  Kamu akan menemukan file `app-release.apk`.
4.  **Rename** file itu menjadi `Alfajr-Elearning.apk`.
5.  File inilah yang kamu kirim ke HP user untuk diinstall.

---

## ✅ Selesai!
Aplikasi sekarang sudah:
1.  Aman (Browser HP diblokir).
2.  Bisa Login Google (Native).
3.  Siap digunakan.
