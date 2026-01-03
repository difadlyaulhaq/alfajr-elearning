import { GoogleAuthProvider, signInWithPopup, UserCredential } from 'firebase/auth';
import { auth } from './firebase/config';
import { Capacitor } from '@capacitor/core';

export const nativeSignInWithGoogle = async (): Promise<UserCredential | undefined> => {
  try {
    // Disable native Google Sign-In for Android/iOS as requested
    if (Capacitor.isNativePlatform()) {
      throw new Error('Google Sign-In is disabled on mobile app for security reasons. Please use manual login.');
    }

    // --- WEB (Browser/PWA) ---
    // Gunakan popup standar
    console.log("Using Web Google Sign-In");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return await signInWithPopup(auth, provider);

  } catch (error: any) {
    // Handle user cancellation gracefully
    if (error.code === 'auth/popup-closed-by-user' || 
        error.message?.includes('canceled') || 
        error.message?.includes('12501')) {
      return undefined;
    }
    
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};