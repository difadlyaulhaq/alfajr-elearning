// components/learning/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Compass, BookCopy, Award, LogOut, ChevronLeft, Loader2, Sparkles, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Beranda', icon: LayoutDashboard, href: '/learning/dashboard', color: 'from-[#C5A059] to-[#B08F4A]' },
    { name: 'Katalog Materi', icon: Compass, href: '/learning/catalog', color: 'from-gray-700 to-gray-900' },
    { name: 'Kursus Saya', icon: BookCopy, href: '/learning/my-courses', color: 'from-[#28A745] to-[#1E7E34]' },
    { name: 'Riwayat', icon: Award, href: '/learning/history', color: 'from-[#FFC107] to-[#FFA000]' },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const handleNavigation = () => {
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="relative p-4 md:p-6 border-b border-gray-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C5A059]/10 to-transparent"></div>
        <Link href="/learning/dashboard" className="relative block" onClick={handleNavigation}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C5A059] to-[#8B7355] rounded-xl blur-lg opacity-30"></div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-xl p-2 md:p-3 shadow-xl border border-[#C5A059]/30">
              <Image 
                src="/logo-alfajr.png" 
                alt="Alfajr E-Learning" 
                width={150} 
                height={40} 
                className="w-full h-auto" 
              />
            </div>
          </div>
          <div className="mt-2 md:mt-3 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Sparkles className="text-[#C5A059]" size={12} />
              <p className="text-[10px] md:text-xs font-bold bg-gradient-to-r from-[#C5A059] to-[#D4AF37] bg-clip-text text-transparent">
                Learning Portal
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* User Info Card */}
      {user && (
        <div className="px-3 md:px-4 py-3 md:py-4">
          <div className="bg-gradient-to-br from-gray-800/40 to-black/40 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-700/30 shadow-lg">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#C5A059] to-[#8B7355] rounded-full blur-md opacity-50"></div>
                <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#C5A059] to-[#8B7355] rounded-full flex items-center justify-center font-bold text-white shadow-xl border-2 border-white/20 text-sm md:text-base">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] md:text-xs text-[#C5A059] truncate">{user.division}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 md:px-4 py-3 md:py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-black">
        {menuItems.map((item) => {
          const isCurrentPath = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavigation}
              className={`group flex items-center px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium rounded-xl transition-all relative overflow-hidden ${
                isCurrentPath
                  ? 'bg-gradient-to-r from-[#C5A059] to-[#B08F4A] text-white shadow-lg shadow-[#C5A059]/30'
                  : 'text-gray-300 hover:bg-gray-800/30 hover:text-white'
              }`}
            >
              {/* Icon Container */}
              <div className={`relative mr-2 md:mr-3 ${isCurrentPath ? '' : 'group-hover:scale-110 transition-transform'}`}>
                {isCurrentPath && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} blur-lg opacity-50`}></div>
                )}
                <div className={`relative p-1 md:p-1.5 rounded-lg ${
                  isCurrentPath 
                    ? 'bg-white/20' 
                    : 'bg-black/50 group-hover:bg-gray-800/50'
                }`}>
                  <item.icon 
                    className={`w-4 h-4 md:w-5 md:h-5 ${
                      isCurrentPath 
                        ? 'text-white' 
                        : 'text-brand-gold'
                    }`} 
                  />
                </div>
              </div>

              <span className={isCurrentPath ? 'font-bold' : ''}>{item.name}</span>

              {/* Shine Effect */}
              {!isCurrentPath && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 md:px-4 py-3 md:py-4 border-t border-gray-800/50 space-y-2 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
        
        {/* Back to Admin */}
        {user && user.role === 'admin' && (
          <Link 
            href="/admin/dashboard"
            onClick={handleNavigation}
            className="relative flex items-center px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium rounded-xl text-gray-300 hover:bg-gradient-to-r hover:from-gray-800/30 hover:to-gray-700/30 hover:text-[#C5A059] transition-all group border border-gray-800/30 hover:border-[#C5A059]/30"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-[#C5A059]" />
            <span>Kembali ke Admin</span>
          </Link>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="relative w-full flex items-center justify-center px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-semibold rounded-xl transition-all border disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#DC3545]/20 to-[#C82333]/20 text-[#DC3545] border-[#DC3545]/30 hover:from-[#DC3545]/40 hover:to-[#C82333]/40 hover:border-[#DC3545]/50 hover:shadow-lg hover:shadow-[#DC3545]/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 animate-spin" />
              Keluar...
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
              Keluar
            </>
          )}
        </button>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none"></div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-black text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile Drawer / Desktop Fixed */}
      <div className={`
        fixed top-0 left-0 h-screen bg-gradient-to-b from-black via-gray-900 to-black text-gray-100 border-r border-gray-800/30 flex flex-col shadow-2xl z-40 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:w-64 w-64
      `}>
        <SidebarContent />
      </div>

      {/* Spacer for desktop layout */}
      <div className="hidden md:block w-64" />
    </>
  );
};

export default Sidebar;
