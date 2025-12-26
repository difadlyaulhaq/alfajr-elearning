import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup, signInWithRedirect, UserCredential } from 'firebase/auth';
import { auth } from './firebase/config';

export const nativeSignInWithGoogle = async (): Promise<UserCredential | void> => {
  const isNative = Capacitor.isNativePlatform();
  console.log("Login Triggered. Platform is Native?", isNative);

  // 1. Cek apakah berjalan di Native App (Android/iOS)
  if (isNative) {
    try {
      console.log("Starting Native Google Sign In...");
      // 2. Login menggunakan Native Plugin
      const result = await FirebaseAuthentication.signInWithGoogle();
      console.log("Native Sign In Success. Result:", result);
      
      // 3. Ambil ID Token dari hasil login native
      const idToken = result.credential?.idToken;
      
      if (!idToken) {
        throw new Error('No ID Token found from Native Google Sign In');
      }

      // 4. Buat Credential untuk Firebase JS SDK
      const credential = GoogleAuthProvider.credential(idToken);
      
      // 5. Sign In ke Firebase JS SDK menggunakan credential tersebut
      return await signInWithCredential(auth, credential);
    } catch (error) {
      console.error('Native Google Sign In Error Details:', error);
      // Jangan fallback ke web popup jika di native, karena pasti gagal juga di webview
      alert(`Login Gagal: ${(error as any).message}`); 
      throw error;
    }
  } else {
    // 6. Jika di Web, gunakan signInWithPopup (Desktop) atau Redirect (Mobile Web)
    // Untuk konsistensi dan menghindari popup blocker di HP, Redirect sering lebih baik.
    // Namun, signInWithPopup memberikan UX lebih mulus di Desktop.
    
    const provider = new GoogleAuthProvider();
    
    try {
        return await signInWithPopup(auth, provider);
    } catch (error: any) {
        // Jika Popup diblokir atau gagal (biasanya error code: auth/popup-blocked), 
        // fallback ke Redirect
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
            console.warn("Popup blocked, falling back to redirect...");
            await signInWithRedirect(auth, provider);
            // signInWithRedirect tidak return apa-apa langsung, 
            // result diambil setelah reload page (perlu handle di useEffect)
            return; 
        }
        throw error;
    }
  }
};
