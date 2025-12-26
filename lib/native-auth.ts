import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup, UserCredential } from 'firebase/auth';
import { auth } from './firebase/config';

export const nativeSignInWithGoogle = async (): Promise<UserCredential> => {
  // 1. Cek apakah berjalan di Native App (Android/iOS)
  if (Capacitor.isNativePlatform()) {
    try {
      // 2. Login menggunakan Native Plugin
      const result = await FirebaseAuthentication.signInWithGoogle();
      
      // 3. Ambil ID Token dari hasil login native
      const idToken = result.credential?.idToken;
      
      if (!idToken) {
        throw new Error('No ID Token found from Native Google Sign In');
      }

      // 4. Buat Credential untuk Firebase JS SDK
      // Ini penting agar state 'auth' di aplikasi React ikut berubah (login)
      const credential = GoogleAuthProvider.credential(idToken);
      
      // 5. Sign In ke Firebase JS SDK menggunakan credential tersebut
      const userCredential = await signInWithCredential(auth, credential);
      
      return userCredential;
    } catch (error) {
      console.error('Native Google Sign In Error:', error);
      throw error;
    }
  } else {
    // 6. Jika di Web, gunakan cara biasa (Popup)
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  }
};
