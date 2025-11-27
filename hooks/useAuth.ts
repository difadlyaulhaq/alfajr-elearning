// hooks/useAuth.ts
import { useState } from 'react';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Clear client storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to login
      window.location.href = '/login';
      
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  return { logout, isLoading };
};