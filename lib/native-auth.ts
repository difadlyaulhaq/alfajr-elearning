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
    // --- NATIVE (Android/iOS) ---
    // Cobalah gunakan plugin native terlebih dahulu.
    // Jika berjalan di web, ini akan melempar error "not implemented" atau sejenisnya,
    // yang akan kita tangkap untuk fallback ke web flow.
    
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

  } catch (error: any) {
    // 1. Handle user cancellation gracefully FIRST
    // Jangan fallback ke web jika user memang membatalkan login native
    if (error.code === 'auth/popup-closed-by-user' || 
        error.message?.includes('canceled') || 
        error.message?.includes('12501')) {
      return undefined;
    }

    // 2. Cek jika error karena berjalan di Web (plugin not implemented)
    // atau jika native plugin gagal inisialisasi.
    // Kita gunakan !Capacitor.isNativePlatform() sebagai hint tambahan,
    // tapi hanya jika error bukan cancellation.
    const isWebFallbackNeeded = 
      error.message?.includes('not implemented') || 
      error.code === 'UNIMPLEMENTED' ||
      !Capacitor.isNativePlatform(); 

    if (isWebFallbackNeeded) {
        // --- WEB (Browser/PWA) ---
        // Gunakan popup standar
        try {
            console.log("Falling back to Web Google Sign-In");
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            return await signInWithPopup(auth, provider);
        } catch (webError: any) {
            // Handle web specific errors
             if (webError.code === 'auth/popup-closed-by-user' || webError.message?.includes('canceled')) {
                return undefined;
            }
            throw webError;
        }
    }
    
    console.error("Native Google Sign-In Error:", error);
    throw error;
  }
};