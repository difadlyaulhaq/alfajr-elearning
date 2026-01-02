import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, UserCredential } from 'firebase/auth';
import { auth } from './firebase/config';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

// Helper untuk deteksi mobile
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const signInWithBrowser = async () => {
  // URL Production
  const domain = 'https://alfajr-elearning.vercel.app'; 
  
  const callbackScheme = 'alfajrelearning';
  const redirectUrl = `${domain}/login?return_to=${callbackScheme}://auth/callback`;
  
  await Browser.open({ url: redirectUrl });
};

export const nativeSignInWithGoogle = async (): Promise<UserCredential | void> => {
  if (Capacitor.isNativePlatform()) {
      // Native App: Use Browser Flow to avoid Webview issues
      await signInWithBrowser();
      return;
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    if (isMobile()) {
      await signInWithRedirect(auth, provider);
      return;
    } 
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    console.error("Login Error:", error);
    if (error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, provider);
      return;
    }
    throw error;
  }
};
