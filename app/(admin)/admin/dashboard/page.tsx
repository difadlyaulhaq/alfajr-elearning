// app/(admin)/admin/dashboard/page.tsx
'use client';
import React from 'react';
import { Users, BookOpen, BarChart3, CheckCircle, Clock, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    {
      title: 'Total Pegawai',
      value: '127',
      icon: Users,
      color: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Total Kursus',
      value: '15',
      icon: BookOpen,
      color: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Peserta Aktif',
      value: '89',
      icon: CheckCircle,
      color: 'bg-purple-100',
      iconColor: 'text-black'
    },
    {
      title: 'Progress Rata-rata',
      value: '72%',
      icon: BarChart3,
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
      <div className="bg-white border-b  border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Dashboard Admin</h1>
            <p className="text-gray-600 mt-1">Ringkasan aktivitas sistem pembelajaran</p>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className={stat.iconColor} size={24} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-black">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span className="text-green-600 font-semibold">+12%</span>
                <span className="ml-1">dari bulan lalu</span>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Progress Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-black mb-4">Status Pembelajaran</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className="text-sm text-black font-medium">Selesai</span>
                </div>
                <span className="font-bold text-black">89 Pegawai</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="text-yellow-500" size={20} />
                  <span className="text-sm text-black font-medium">Dalam Progress</span>
                </div>
                <span className="font-bold text-black">32 Pegawai</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <XCircle className="text-gray-500" size={20} />
                  <span className="text-sm text-black font-medium">Belum Mulai</span>
                </div>
                <span className="font-bold text-black">6 Pegawai</span>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-black mb-4">Aktivitas Terbaru</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#C5A059] rounded-full mt-2"></div>
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
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-black mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="text-[#C5A059]" size={24} />
              <div className="text-left">
                <p className="font-semibold text-black">Tambah Pegawai</p>
                <p className="text-sm text-gray-600">Daftarkan user baru</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <BookOpen className="text-[#C5A059]" size={24} />
              <div className="text-left">
                <p className="font-semibold text-black">Buat Kursus</p>
                <p className="text-sm text-gray-600">Upload materi baru</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <BarChart3 className="text-[#C5A059]" size={24} />
              <div className="text-left">
                <p className="font-semibold text-black">Lihat Laporan</p>
                <p className="text-sm text-gray-600">Analisis progress</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;