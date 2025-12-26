import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, UserCredential } from 'firebase/auth';
import { auth } from './firebase/config';

// Helper untuk deteksi mobile
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const nativeSignInWithGoogle = async (): Promise<UserCredential | void> => {
  const provider = new GoogleAuthProvider();
  
  // Tambahkan prompt select_account agar user bisa ganti akun
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  try {
    // Jika di Mobile (baik itu Web Browser HP atau Native App WebView)
    // Kita gunakan Redirect karena Popup sering diblokir di lingkungan mobile
    if (isMobile()) {
      console.log("Mobile detected, using signInWithRedirect...");
      await signInWithRedirect(auth, provider);
      return; // Fungsi akan berhenti di sini karena halaman akan pindah/reload
    } 
    
    // Jika di Desktop, gunakan Popup (UX lebih bagus)
    console.log("Desktop detected, using signInWithPopup...");
    return await signInWithPopup(auth, provider);
    
  } catch (error: any) {
    console.error("Login Error:", error);
    
    // Fallback terakhir jika Popup gagal
    if (error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, provider);
      return;
    }
    
    alert(`Gagal login: ${error.message}`);
    throw error;
  }
};