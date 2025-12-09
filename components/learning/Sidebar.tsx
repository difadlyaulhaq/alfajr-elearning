
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Compass, BookCopy, Award, LifeBuoy, LogOut, ChevronLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext'; // Import useAuth hook

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth(); // Gunakan hook useAuth

  const menuItems = [
    { name: 'Beranda', icon: LayoutDashboard, href: '/learning/dashboard' },
    { name: 'Katalog Materi', icon: Compass, href: '/learning/catalog' },
    { name: 'Kursus Saya', icon: BookCopy, href: '/learning/my-courses' },
    { name: 'Riwayat', icon: Award, href: '/learning/history' },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex flex-col w-64 bg-gray-900 text-gray-100 border-r border-gray-800 h-screen sticky top-0">
      <div className="flex items-center justify-center p-6 border-b border-gray-800">
        <Link href="/learning/dashboard">
            <Image src="/logo-alfajr.png" alt="Alfajr E-Learning" width={150} height={40} className="bg-white/10 rounded" />
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              pathname.startsWith(item.href)
                ? 'bg-[#C5A059] text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <item.icon className={`w-5 h-5 mr-3 ${pathname.startsWith(item.href) ? 'text-white' : 'text-[#C5A059]'}`} />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="px-4 py-6 border-t border-gray-800 space-y-2">
        {user && user.role === 'admin' && (
            <Link href="/admin/dashboard" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800">
                <ChevronLeft className="w-5 h-5 mr-3 text-[#C5A059]" />
                Kembali ke Admin
            </Link>
        )}
        
        <Link href="/learning/help" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800">
            <LifeBuoy className="w-5 h-5 mr-3 text-[#C5A059]" />
            Bantuan
        </Link>

        <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors text-red-400 hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            ) : (
                <LogOut className="w-5 h-5 mr-3" />
            )}
            {isLoading ? 'Keluar...' : 'Keluar'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
