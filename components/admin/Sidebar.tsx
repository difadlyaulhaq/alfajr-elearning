// components/admin/Sidebar.tsx
import React, { useState } from 'react';
import { Home, Users, FolderTree, BookOpen, FileQuestion, BarChart3, Settings, LogOut, ChevronDown, ChevronRight, Loader } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface MenuItem {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  path?: string;
  hasSubmenu?: boolean;
  subItems?: SubMenuItem[];
  badge?: string;
}

interface SubMenuItem {
  key: string;
  label: string;
  path: string;
}

const AdminSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleSubmenu = (key: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // 🔥 Helper function untuk hapus cookie di client side
  const deleteCookie = (name: string) => {
    // Hapus dengan berbagai kombinasi path dan domain
    const paths = ['/', '/admin', '/learning'];
    const domains = [window.location.hostname, `.${window.location.hostname}`];
    
    paths.forEach(path => {
      domains.forEach(domain => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
      });
    });
    
    // Fallback: hapus tanpa domain
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // 1. Panggil API Logout
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // Pastikan cookie dikirim
      });

      // 2. Hapus cookie secara manual di client (backup method)
      deleteCookie('auth_token');
      deleteCookie('user_role');
      
      // 3. Hapus localStorage dan sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      if (response.ok) {
        console.log('[LOGOUT] Server logout successful');
      } else {
        console.warn('[LOGOUT] Server logout failed, but proceeding with client cleanup');
      }
      
      // 4. Redirect dengan force reload
      window.location.href = '/login';
      
    } catch (error) {
      console.error('[LOGOUT] Error:', error);
      
      // Tetap hapus cookie dan redirect meskipun ada error
      deleteCookie('auth_token');
      deleteCookie('user_role');
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  const menuItems: MenuItem[] = [
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

  return (
    <div className="w-64 h-screen bg-black text-white flex flex-col fixed left-0 top-0 z-40">
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
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {menuItems.map((item) => (
          <div key={item.key}>
            <button
              onClick={() => {
                if (item.hasSubmenu) {
                  toggleSubmenu(item.key);
                } else if (item.path) {
                  router.push(item.path);
                }
              }}
              className={`w-full flex items-center justify-between px-6 py-3 text-left transition-all hover:bg-gray-900 ${
                isActive(item.path)
                  ? 'bg-[#C5A059] text-black hover:bg-[#B08F4A]'
                  : 'text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={20} className={isActive(item.path) ? 'text-black' : 'text-[#C5A059]'} />
                <span className="font-medium">{item.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                {item.badge && (
                  <span className="text-[10px] bg-gray-800 text-[#C5A059] px-2 py-0.5 rounded border border-gray-700">
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
              <div className="bg-gray-900/50 border-l-2 border-[#C5A059]/20 ml-6 my-1">
                {item.subItems?.map((subItem) => (
                  <button
                    key={subItem.key}
                    onClick={() => router.push(subItem.path)}
                    className={`w-full flex items-center px-4 py-2 text-left text-sm transition-all hover:text-white ${
                      isActive(subItem.path)
                        ? 'text-[#C5A059] font-semibold'
                        : 'text-gray-400'
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
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center space-x-3 px-4 py-3 text-gray-300 hover:bg-red-900/20 hover:text-red-400 rounded-lg transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            <LogOut size={20} className="group-hover:stroke-red-400" />
          )}
          <span className="font-medium">
            {isLoggingOut ? 'Keluar...' : 'Logout'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;