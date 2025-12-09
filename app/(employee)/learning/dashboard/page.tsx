'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Compass, CheckCircle, Loader2 } from 'lucide-react';

// --- Tipe Data ---
interface Course {
  id: string;
  title: string;
  categoryName: string;
  description: string;
  thumbnail?: string;
  coverImage?: string;
  totalVideos: number;
}

const EmployeeDashboardPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const res = await fetch('/api/admin/courses');
        const data = await res.json();
        if (data.success) {
          // Filter hanya kursus yang statusnya 'active'
          setCourses(data.data.filter((c: any) => c.status === 'active'));
        }
      } catch (error) {
        console.error("Gagal mengambil data kursus:", error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);
  
  if (isAuthLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-12 h-12 text-[#C5A059] animate-spin" />
        </div>
    )
  }

  if (!user) {
    // Anda bisa redirect ke halaman login di sini jika diperlukan
    return <div className="p-8 text-center text-red-500">Akses ditolak. Silakan login terlebih dahulu.</div>;
  }

  // Placeholder stats
  const stats = [
    { title: 'Kursus Diikuti', value: '0' },
    { title: 'Kursus Selesai', value: '0' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-black">Assalamualaikum, {user?.name}!</h1>
        <p className="text-gray-600 mt-1">Selamat datang kembali. Terus tingkatkan potensimu hari ini.</p>
      </div>

      <div className="p-8">
        {/* Quick Stats - Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 bg-gradient-to-br from-[#C5A059] to-[#8B7355] text-white p-6 rounded-xl shadow-lg">
             <h3 className="font-bold text-lg mb-2">Progres Saya</h3>
             <div className="flex justify-around mt-4">
                {stats.map(stat => (
                    <div key={stat.title} className="text-center">
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <p className="text-sm opacity-80">{stat.title}</p>
                    </div>
                ))}
             </div>
          </div>
          <div className="md:col-span-2 bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-black">Temukan Pengetahuan Baru</h3>
              <p className="text-gray-600 mt-1">Jelajahi semua kursus yang tersedia untuk meningkatkan keahlianmu.</p>
            </div>
            <Link href="/learning/catalog" className="flex items-center space-x-2 bg-[#FFF8E7] text-[#C5A059] px-5 py-2.5 rounded-lg hover:bg-[#FFF3D6] transition-colors font-semibold shadow-sm">
                <Compass size={20} />
                <span>Lihat Katalog</span>
            </Link>
          </div>
        </div>

        {/* Course List */}
        <div>
          <h2 className="text-xl font-bold text-black mb-4">Kursus yang Tersedia</h2>
          {isLoadingCourses ? (
            <div className="text-center py-10">Memuat kursus...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link href={`/learning/course/${course.id}`} key={course.id}>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
                        <div className="h-40 bg-gray-200 relative">
                            <img src={course.thumbnail || course.coverImage || '/logo-alfajr.png'} alt={course.title} className="w-full h-full object-cover" />
                             <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-[#C5A059] shadow-sm">
                                {course.categoryName}
                            </div>
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className="font-bold text-base text-black mb-2 line-clamp-2" title={course.title}>{course.title}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-grow">{course.description}</p>
                            <div className="text-xs text-gray-500 flex items-center">
                                <BookOpen size={12} className="mr-1.5"/> {course.totalVideos || 0} Materi
                            </div>
                        </div>
                    </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;