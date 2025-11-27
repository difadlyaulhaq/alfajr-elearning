// app/(admin)/admin/layout.tsx
'use client';

import React, { useState } from 'react';
import { Home, Users, FolderTree, BookOpen, FileQuestion, BarChart3, Settings, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (key: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/admin/dashboard'
    },
    {
      key: 'users',
      label: 'Manajemen Pengguna',
      icon: Users,
      path: '/admin/users'
    },
    {
      key: 'master',
      label: 'Master Data',
      icon: FolderTree,
      hasSubmenu: true,
      subItems: [
        { key: 'categories', label: 'Kategori', path: '/admin/categories' },
        { key: 'divisions', label: 'Divisi', path: '/admin/divisions' }
      ]
    },
    {
      key: 'courses',
      label: 'Kelola Kursus',
      icon: BookOpen,
      path: '/admin/courses'
    },
    {
      key: 'quiz',
      label: 'Bank Soal',
      icon: FileQuestion,
      path: '/admin/quiz',
      badge: 'Tahap 2'
    },
    {
      key: 'reports',
      label: 'Laporan',
      icon: BarChart3,
      path: '/admin/reports'
    },
    {
      key: 'settings',
      label: 'Pengaturan Sistem',
      icon: Settings,
      path: '/admin/settings'
    }
  ];

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logging out...');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Sidebar */}
      <aside className="w-64 h-screen bg-black text-white flex flex-col fixed left-0 top-0 z-50">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C5A059] to-[#8B7355] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#C5A059]">Alfajr Umroh</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <div key={item.key}>
              <button
                onClick={() => {
                  if (item.hasSubmenu) {
                    toggleSubmenu(item.key);
                  } else {
                    router.push(item.path!);
                  }
                }}
                className={`w-full flex items-center justify-between px-6 py-3 text-left transition-all ${
                  isActive(item.path!)
                    ? 'bg-[#C5A059] text-black'
                    : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon size={20} className={isActive(item.path!) ? 'text-black' : 'text-[#C5A059]'} />
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <span className="text-xs bg-gray-800 text-[#C5A059] px-2 py-1 rounded">
                      {item.badge}
                    </span>
                  )}
                  {item.hasSubmenu && (
                    expandedMenus[item.key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                  )}
                </div>
              </button>

              {/* Submenu */}
              {item.hasSubmenu && expandedMenus[item.key] && (
                <div className="bg-gray-900">
                  {item.subItems?.map((subItem) => (
                    <button
                      key={subItem.key}
                      onClick={() => router.push(subItem.path)}
                      className={`w-full flex items-center px-6 pl-14 py-2.5 text-left text-sm transition-all ${
                        isActive(subItem.path)
                          ? 'bg-[#C5A059] text-black'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-800 p-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-red-900 hover:text-white rounded-lg transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}