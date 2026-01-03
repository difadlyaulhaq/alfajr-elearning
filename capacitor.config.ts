import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alfajr.elearning',
  appName: 'Alfajr E-Learning',
  webDir: 'out',
  server: {
    // ⚠️ PRODUCTION MODE: Menggunakan domain Vercel
    url: 'https://alfajr-elearning.vercel.app', 
    allowNavigation: [
      "alfajr-elearning.vercel.app",
      "*.alfajr-elearning.vercel.app",
      "alfajr-elearning-*.vercel.app"
    ],
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
