import React from 'react';
import Link from 'next/link';
import { Users, BookOpen, BarChart3, FolderKanban, Building2, TrendingUp } from 'lucide-react';
import { getCoursesCount, getUsersCount, getCategoriesCount, getDivisionsCount } from '@/lib/data/stats';
import { getRecentActivities } from '@/lib/data/activities';

// --- Tipe Data ---
interface Stat {
  title: string;
  value: string;
  icon: React.ElementType;
  href: string;
  color: string;
  iconColor: string;
}

// --- Komponen Utama ---
const AdminDashboard = async () => {
  // Memanggil fungsi data fetching secara langsung dan paralel
  const [coursesCount, usersCount, categoriesCount, divisionsCount, recentActivities] = await Promise.all([
    getCoursesCount(),
    getUsersCount(),
    getCategoriesCount(),
    getDivisionsCount(),
    getRecentActivities(5) // Fetch 5 recent activities
  ]);

  const stats: Stat[] = [
    {
      title: 'Total Kursus',
      value: coursesCount.toString(),
      icon: BookOpen,
      href: '/admin/courses',
      color: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Total Pegawai',
      value: usersCount.toString(),
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Total Kategori',
      value: categoriesCount.toString(),
      icon: FolderKanban,
      href: '/admin/categories',
      color: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Total Divisi',
      value: divisionsCount.toString(),
      icon: Building2,
      href: '/admin/divisions',
      color: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header - Desktop Only */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 md:px-8 md:py-6 hidden md:block">
        <div>
          <h1 className="text-2xl font-bold text-black">Dashboard Admin</h1>
          <p className="text-gray-600 mt-1">Ringkasan aktivitas sistem pembelajaran</p>
        </div>
      </div>

      {/* Mobile Header with Greeting */}
      <div className="md:hidden bg-gradient-to-br from-white to-gray-50 px-4 pt-20 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500 font-medium">Dashboard Admin</p>
            <h1 className="text-2xl font-bold text-black mt-1">
              Selamat Datang 👋
            </h1>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-[#C5A059] to-[#B08F4A] rounded-full flex items-center justify-center shadow-lg">
            <TrendingUp className="text-white" size={24} />
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Pantau dan kelola sistem pembelajaran
        </p>
      </div>

      {/* Stats Cards */}
      <div className="p-4 md:p-8">
        {/* Mobile: 2 columns, Desktop: 4 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <Link href={stat.href} key={stat.title}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-1">
                {/* Mobile Layout - Vertical Stack */}
                <div className="md:hidden p-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
                    <stat.icon className={stat.iconColor} size={20} />
                  </div>
                  <p className="text-2xl font-bold text-black mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs font-semibold text-gray-600 leading-tight">
                    {stat.title}
                  </p>
                </div>

                {/* Desktop Layout - Original */}
                <div className="hidden md:block p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className={stat.iconColor} size={24} />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-black">{stat.value}</p>
                      <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activities & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-4 md:px-6 md:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-base md:text-lg font-bold text-black flex items-center">
                <div className="w-1 h-5 bg-[#C5A059] rounded-full mr-3"></div>
                Aktivitas Terbaru
              </h3>
            </div>
            <div className="p-4 md:p-6">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start space-x-3 pb-4 last:pb-0 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-2 h-2 bg-[#C5A059] rounded-full mt-2 shrink-0 shadow-sm"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-black leading-relaxed">
                        <span className="font-semibold">{activity.user}</span>{' '}
                        <span className="text-gray-700">{activity.action}</span>
                      </p>
                      <div className="flex items-center mt-1.5">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                        <p className="text-xs text-gray-500 font-medium">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-4 md:px-6 md:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-base md:text-lg font-bold text-black flex items-center">
                <div className="w-1 h-5 bg-[#C5A059] rounded-full mr-3"></div>
                Aksi Cepat
              </h3>
            </div>
            <div className="p-4 md:p-6">
              {/* Mobile: 3 Column Grid, Desktop: Vertical Stack */}
              <div className="grid grid-cols-3 gap-3 md:flex md:flex-col md:gap-3">
                <Link 
                  href="/admin/courses" 
                  className="group flex flex-col items-center md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 p-3 md:p-4 border border-gray-200 rounded-xl hover:border-[#C5A059] hover:bg-[#FFF8E7] transition-all duration-200"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 group-hover:bg-white rounded-xl flex items-center justify-center transition-colors shadow-sm">
                    <BookOpen className="text-[#C5A059]" size={20} />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <p className="font-bold text-xs md:text-sm text-black">Kelola Kursus</p>
                    <p className="hidden md:block text-xs text-gray-600 mt-0.5">Buat, edit, dan publikasi kursus</p>
                  </div>
                </Link>

                <Link 
                  href="/admin/users" 
                  className="group flex flex-col items-center md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 p-3 md:p-4 border border-gray-200 rounded-xl hover:border-[#C5A059] hover:bg-[#FFF8E7] transition-all duration-200"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 group-hover:bg-white rounded-xl flex items-center justify-center transition-colors shadow-sm">
                    <Users className="text-[#C5A059]" size={20} />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <p className="font-bold text-xs md:text-sm text-black">Kelola Pegawai</p>
                    <p className="hidden md:block text-xs text-gray-600 mt-0.5">Tambah dan nonaktifkan pegawai</p>
                  </div>
                </Link>

                <Link 
                  href="/admin/reports" 
                  className="group flex flex-col items-center md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 p-3 md:p-4 border border-gray-200 rounded-xl hover:border-[#C5A059] hover:bg-[#FFF8E7] transition-all duration-200"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 group-hover:bg-white rounded-xl flex items-center justify-center transition-colors shadow-sm">
                    <BarChart3 className="text-[#C5A059]" size={20} />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <p className="font-bold text-xs md:text-sm text-black">Lihat Laporan</p>
                    <p className="hidden md:block text-xs text-gray-600 mt-0.5">Analisis progress pembelajaran</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;