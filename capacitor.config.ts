import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alfajr.elearning',
  appName: 'Alfajr E-Learning',
  webDir: 'public',
  server: {
    // ⚠️ PENTING: Ganti URL di bawah ini dengan domain Vercel/Web Anda yang sudah deploy!
    // Contoh: 'https://alfajr-elearning.vercel.app'
    // Jangan gunakan 192.168.x.x untuk production APK.
    url: 'https://alfajr-elearning.vercel.app/', 
    
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    PrivacyScreen: {
      enable: true,
      imageName: 'Splash',
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_INSIDE",
      showSpinner: false
    },
  },
};

export default config;
