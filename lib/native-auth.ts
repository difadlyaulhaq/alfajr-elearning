import { GoogleAuthProvider, signInWithCredential, signInWithPopup, UserCredential } from 'firebase/auth';
import { auth } from './firebase/config';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

export const signInWithBrowser = async () => {
  // URL Production Anda
  const domain = 'https://alfajr-elearning.vercel.app'; 
  const callbackScheme = 'alfajrelearning';
  const redirectUrl = `${domain}/login?return_to=${callbackScheme}://auth/callback`;
  
  await Browser.open({ url: redirectUrl });
};

export const nativeSignInWithGoogle = async (): Promise<UserCredential | undefined> => {
  try {
    if (Capacitor.isNativePlatform()) {
      // --- NATIVE (Android/iOS) ---
      // Menggunakan plugin @capacitor-firebase/authentication untuk bypass batasan WebView
      
      const result = await FirebaseAuthentication.signInWithGoogle();
      
      // Ambil ID Token dari hasil login native
      const idToken = result.credential?.idToken;
      
      if (!idToken) {
        throw new Error('No ID token found in native Google Sign-In result');
      }

      // Buat credential Firebase dari ID token
      const credential = GoogleAuthProvider.credential(idToken);
      
      // Sign in ke Firebase JS SDK menggunakan credential tersebut
      // Ini penting agar state auth tersinkronisasi di JS layer (context/AuthContext)
      return await signInWithCredential(auth, credential);

    } else {
      // --- WEB (Browser/PWA) ---
      // Gunakan popup standar
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      return await signInWithPopup(auth, provider);
    }
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);
    
    // Handle user cancellation gracefully
    if (error.code === 'auth/popup-closed-by-user' || error.message?.includes('canceled')) {
      return undefined;
    }
    
    throw error;
  }
};
