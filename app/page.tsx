'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Jika sudah login, redirect ke dashboard
        // Cek role jika perlu, tapi default ke learning dashboard
        if (user.role === 'admin') {
           router.replace('/admin/dashboard');
        } else {
           router.replace('/learning/dashboard');
        }
      } else {
        // Jika belum login, redirect ke login page
        router.replace('/login');
      }
    }
  }, [user, isLoading, isAuthenticated, router]);

  // Tampilkan loading screen branding Alfajr sementara cek auth
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
       <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#C5A059]/20 blur-xl rounded-full"></div>
          <Image 
            src="/logo-alfajr.png" 
            alt="Alfajr Logo" 
            width={150} 
            height={150} 
            className="relative z-10 object-contain"
            priority
          />
       </div>
       <div className="flex items-center gap-3 text-[#C5A059]">
          <Loader className="animate-spin" size={24} />
          <span className="font-medium">Memuat Aplikasi...</span>
       </div>
    </div>
  );
}