'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Compass, CheckCircle, Loader2, Award, TrendingUp, Clock, Target, Sparkles, Star } from 'lucide-react';

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
            <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
        </div>
    )
  }

  if (!user) {
    return <div className="p-8 text-center text-brand-danger">Akses ditolak. Silakan login terlebih dahulu.</div>;
  }

  const stats = [
    {
      title: 'Kursus Diikuti',
      value: '0',
      icon: BookOpen,
      color: 'from-brand-gold to-yellow-600',
      bgColor: 'bg-brand-gold/10',
      description: 'Kursus aktif'
    },
    {
      title: 'Kursus Selesai',
      value: '0',
      icon: CheckCircle,
      color: 'from-brand-success to-green-600',
      bgColor: 'bg-brand-success/10',
      description: 'Telah diselesaikan'
    },
    {
      title: 'Sertifikat',
      value: '0',
      icon: Award,
      color: 'from-brand-warning to-yellow-500',
      bgColor: 'bg-brand-warning/10',
      description: 'Telah diraih'
    },
  ];



  return (
    <div className="min-h-screen bg-brand-gray">
      {/* Hero Header */}
      <div className="relative bg-brand-black overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #C5A059 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-gold to-yellow-700 flex items-center justify-center shadow-lg border-2 border-white/20">
                  <Sparkles className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Assalamualaikum, {user?.name}!</h1>
                  <p className="text-brand-gold mt-1">Terus tingkatkan potensimu hari ini 🌟</p>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 -mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-105">
              <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} size={28} />
                  </div>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Learning Path */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-brand-gold to-yellow-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-black">Jalur Pembelajaran</h3>
                <p className="text-sm text-black/70 mt-1">Temukan kursus yang cocok untukmu</p>
              </div>
              <Target className="text-white/80" size={24} />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-brand-gold/10 to-yellow-100/20 rounded-xl border-2 border-brand-gold mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-gold to-yellow-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Compass className="text-white" size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-black text-lg">Jelajahi Katalog</h4>
                    <p className="text-sm text-gray-600">Temukan {courses.length}+ kursus berkualitas</p>
                  </div>
                </div>
                <Link href="/learning/catalog" className="px-6 py-3 bg-gradient-to-r from-brand-gold to-yellow-600 text-black rounded-xl hover:shadow-lg transition-all font-semibold">
                  Mulai Belajar
                </Link>
              </div>

              {/* Recommended Courses Preview */}
              <div>
                <h4 className="font-bold text-black mb-3">Rekomendasi Untukmu</h4>
                <div className="grid grid-cols-2 gap-3">
                  {courses.slice(0, 4).map((course) => (
                    <Link href={`/learning/course/${course.id}`} key={course.id}>
                      <div className="group p-3 border-2 border-gray-200 rounded-xl hover:border-brand-gold hover:shadow-md transition-all bg-white">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-brand-gold/10 rounded-lg flex items-center justify-center shrink-0">
                            <BookOpen className="text-black" size={16} />
                          </div>
                          <span className="text-xs font-bold text-black bg-brand-gold/10 px-2 py-1 rounded-full">
                            {course.categoryName}
                          </span>
                        </div>
                        <h5 className="font-semibold text-sm text-black line-clamp-2 group-hover:text-brand-gold transition-colors">
                          {course.title}
                        </h5>
                        <p className="text-xs text-gray-500 mt-2">{course.totalVideos} materi</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-black">Kursus yang Tersedia</h2>
              <p className="text-sm text-gray-600 mt-1">Pilih kursus untuk memulai pembelajaran</p>
            </div>
            <Link href="/learning/catalog" className="text-brand-gold hover:text-yellow-600 font-semibold text-sm flex items-center gap-1">
              Lihat Semua
              <Compass size={16} />
            </Link>
          </div>
          
          {isLoadingCourses ? (
            <div className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-brand-gold animate-spin mx-auto mb-3" />
              <p className="text-gray-500">Memuat kursus...</p>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((course) => (
                <Link href={`/learning/course/${course.id}`} key={course.id}>
                  <div className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all overflow-hidden border-2 border-gray-100 hover:border-brand-gold hover:scale-105 duration-300">
                    <div className="h-48 bg-gradient-to-br from-brand-gold/10 to-yellow-100/20 relative overflow-hidden">
                      {course.thumbnail || course.coverImage ? (
                        <img src={course.thumbnail || course.coverImage} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          📚
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-black shadow-lg border border-brand-gold/20">
                        {course.categoryName}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-base text-black mb-2 line-clamp-2 group-hover:text-brand-gold transition-colors" title={course.title}>
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-4">{course.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <BookOpen size={14} className="text-brand-gold" />
                          {course.totalVideos || 0} Materi
                        </div>
                        <span className="text-xs font-semibold text-black group-hover:text-yellow-600">
                          Mulai →
                        </span>
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