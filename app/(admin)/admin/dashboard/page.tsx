import React from 'react';
import Link from 'next/link';
import { Users, BookOpen, BarChart3, FolderKanban, Building2 } from 'lucide-react';
import { getCoursesCount, getUsersCount, getCategoriesCount, getDivisionsCount } from '@/lib/data/stats';

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
  const [coursesCount, usersCount, categoriesCount, divisionsCount] = await Promise.all([
    getCoursesCount(),
    getUsersCount(),
    getCategoriesCount(),
    getDivisionsCount()
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

  const recentActivities = [
    { id: 1, user: 'Ahmad Fulan', action: 'menyelesaikan kursus SOP Pelayanan', time: '2 jam lalu' },
    { id: 2, user: 'Siti Aminah', action: 'memulai kursus Marketing Digital', time: '5 jam lalu' },
    { id: 3, user: 'Budi Santoso', action: 'mengupload materi baru', time: '1 hari lalu' }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Dashboard Admin</h1>
          <p className="text-gray-600 mt-1">Ringkasan aktivitas sistem pembelajaran</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Link href={stat.href} key={stat.title}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full hover:shadow-md hover:border-gray-300 transition-all">
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
            </Link>
          ))}
        </div>

        {/* Recent Activities & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-black mb-4">Aktivitas Terbaru</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#C5A059] rounded-full mt-2 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-black">
                      <span className="font-semibold">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-black mb-4">Aksi Cepat</h3>
            <div className="flex flex-col gap-4">
              <Link href="/admin/courses" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <BookOpen className="text-[#C5A059]" size={24} />
                <div className="text-left">
                  <p className="font-semibold text-black">Kelola Kursus</p>
                  <p className="text-sm text-gray-600">Buat, edit, dan publikasi kursus</p>
                </div>
              </Link>
              <Link href="/admin/users" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="text-[#C5A059]" size={24} />
                <div className="text-left">
                  <p className="font-semibold text-black">Kelola Pegawai</p>
                  <p className="text-sm text-gray-600">Tambah dan nonaktifkan pegawai</p>
                </div>
              </Link>
              <Link href="/admin/reports" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <BarChart3 className="text-[#C5A059]" size={24} />
                <div className="text-left">
                  <p className="font-semibold text-black">Lihat Laporan</p>
                  <p className="text-sm text-gray-600">Analisis progress pembelajaran</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
