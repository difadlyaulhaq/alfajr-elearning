
'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { logoutUser } from '@/lib/firebase/auth';

// --- Tipe Data ---
interface User {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  division: string;
  status: 'active' | 'inactive';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

// --- Buat Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Buat Provider ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.isAuthenticated) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const logout = async () => {
    await logoutUser();
    setUser(null);
    window.location.href = '/login';
  };
  
  const isAuthenticated = !isLoading && user !== null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Buat Hook ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
