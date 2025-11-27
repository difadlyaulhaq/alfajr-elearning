// lib/firebase/auth.ts
import { auth } from './config';
import { signOut } from 'firebase/auth';

export const verifyIdToken = async (token: string) => {
  try {
    // Untuk demo, return user data hardcoded
    // Di production, gunakan Firebase Admin SDK
    return { 
      uid: 'demo-admin', 
      email: 'admin@alfajrumroh.com', 
      name: 'Admin User',
      role: 'admin'
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

export const logoutUser = async (): Promise<boolean> => {
  try {
    // Sign out dari Firebase
    await signOut(auth);
    
    // Clear cookies via API
    const response = await fetch('/api/auth/logout', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};