// hooks/useAuth.ts
import { useState } from 'react';
import { logoutUser } from '../lib/firebase/auth';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);
    try {
      const success = await logoutUser();
      if (success) {
        // Redirect to login
        window.location.href = '/login';
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Optional: Tampilkan pesan error kepada user
      window.location.href = '/login'; // Tetap redirect meski ada error
    } finally {
      setIsLoading(false);
    }
  };

  return { logout, isLoading };
};