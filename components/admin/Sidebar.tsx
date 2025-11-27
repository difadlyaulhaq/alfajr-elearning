// components/admin/Sidebar.tsx
import React, { useState } from 'react';
import { Home, Users, FolderTree, BookOpen, FileQuestion, BarChart3, Settings, LogOut, ChevronDown, ChevronRight, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const toggleSubmenu = (key: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLogout = async () => {
  setIsLoggingOut(true);
  
  try {
    console.log('[CLIENT] 🚀 Starting logout...');
    
    // Step 1: Call logout API
    const response = await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('[CLIENT] Logout API status:', response.status);
    
    // Check response body
    const data = await response.json();
    console.log('[CLIENT] Logout API response:', data);
    
    if (!response.ok) {
      throw new Error(`Logout failed: ${response.status}`);
    }
    
    // Step 2: Clear ALL storage
    console.log('[CLIENT] Clearing storage...');
    localStorage.clear();
    sessionStorage.clear();
    
    // Step 3: Clear ALL cookies (aggressive)
    console.log('[CLIENT] Clearing cookies...');
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      
      // Clear dengan berbagai kombinasi
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;`;
      
      console.log(`[CLIENT] Cleared cookie: ${name}`);
    }
    
    // Step 4: Wait a bit for cookies to clear
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('[CLIENT] ✅ Logout complete, redirecting...');
    
    // Step 5: Hard redirect (force reload)
    window.location.href = '/login';
    
  } catch (error) {
    console.error('[CLIENT] ❌ Logout error:', error);
    
    // Fallback: Nuclear option
    console.log('[CLIENT] Using fallback logout method...');
    
    // Clear everything
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies aggressively
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // Force redirect
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
    
  } finally {
    setIsLoggingOut(false);
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
    <div className="w-64 h-screen bg-black text-white flex flex-col fixed left-0 top-0">
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
                  setActiveMenu(item.key);
                  if (item.path) {
                    router.push(item.path);
                  }
                }
              }}
              className={`w-full flex items-center justify-between px-6 py-3 text-left transition-all ${
                activeMenu === item.key
                  ? 'bg-[#C5A059] text-black'
                  : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={20} className={activeMenu === item.key ? 'text-black' : 'text-[#C5A059]'} />
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
                    onClick={() => {
                      setActiveMenu(subItem.key);
                      router.push(subItem.path);
                    }}
                    className={`w-full flex items-center px-6 pl-14 py-2.5 text-left text-sm transition-all ${
                      activeMenu === subItem.key
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
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center space-x-3 px-4 py-3 text-gray-300 hover:bg-red-900 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            <LogOut size={20} />
          )}
          <span className="font-medium">
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;