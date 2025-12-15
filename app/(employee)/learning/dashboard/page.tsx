'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Compass, CheckCircle, Loader2, Award, Target, Sparkles } from 'lucide-react';
import { Course, Progress } from '@/types';

// --- Helper Components ---
const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; color: string; bgColor: string; description: string }> = 
({ title, value, icon: Icon, color, bgColor, description }) => (
  <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-105">
    <div className={`h-2 bg-gradient-to-r ${color}`}></div>
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`${bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
          <Icon className={`bg-gradient-to-br ${color} bg-clip-text text-transparent`} size={28} />
        </div>
      </div>
      <p className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
        {value}
      </p>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  </div>
);

const CourseCard: React.FC<{ course: Course; progress?: Progress }> = ({ course, progress }) => {
  const isCompleted = progress?.status === 'completed';
  const isInProgress = progress?.status === 'in-progress';

  return (
    <Link href={`/learning/course/${course.id}`} key={course.id}>
      <div className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all overflow-hidden border-2 border-gray-100 hover:border-brand-gold hover:scale-105 duration-300 h-full flex flex-col">
        <div className="h-48 bg-gradient-to-br from-brand-gold/10 to-yellow-100/20 relative overflow-hidden">
          {course.thumbnail || course.coverImage ? (
            <img src={course.thumbnail || course.coverImage} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">📚</div>
          )}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-black shadow-lg border border-brand-gold/20">
            {course.categoryName}
          </div>
          {isCompleted && (
            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle size={12} />
              <span>Selesai</span>
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-bold text-base text-black mb-2 line-clamp-2 group-hover:text-brand-gold transition-colors" title={course.title}>
            {course.title}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-2 mb-4 flex-grow">{course.description}</p>
          
          {isInProgress && (
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-yellow-600">Dalam Pengerjaan</span>
                <span className="text-xs font-bold text-black">{progress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-yellow-500 h-1.5 rounded-full"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <BookOpen size={14} className="text-brand-gold" />
              {course.totalVideos || 0} Materi
            </div>
            <span className="text-xs font-semibold text-black group-hover:text-yellow-600">
              {isCompleted ? "Lihat Lagi" : "Mulai Belajar"} →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};


// --- Main Component ---
const EmployeeDashboardPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoadingData(true);
      try {
        const [coursesRes, progressRes] = await Promise.all([
          fetch('/api/admin/courses'),
          fetch(`/api/progress/${user.uid}`)
        ]);
        
        const coursesData = await coursesRes.json();
        if (coursesData.success) {
          setCourses(coursesData.data.filter((c: any) => c.status === 'active'));
        }

        const progressData = await progressRes.json();
        if (progressData.success) {
          const progressMap = progressData.data.reduce((acc: Record<string, Progress>, p: Progress) => {
            acc[p.courseId] = p;
            return acc;
          }, {});
          setProgress(progressMap);
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user) {
      fetchData();
    } else if (!isAuthLoading) {
      setIsLoadingData(false);
    }
  }, [user, isAuthLoading]);
  
  const stats = useMemo(() => {
    const progressValues = Object.values(progress);
    const inProgressCount = progressValues.filter(p => p.status === 'in-progress').length;
    const completedCount = progressValues.filter(p => p.status === 'completed').length;
    
    return [
      {
        title: 'Kursus Diikuti',
        value: inProgressCount.toString(),
        icon: BookOpen,
        color: 'from-brand-gold to-yellow-600',
        bgColor: 'bg-brand-gold/10',
        description: 'Kursus aktif'
      },
      {
        title: 'Kursus Selesai',
        value: completedCount.toString(),
        icon: CheckCircle,
        color: 'from-brand-success to-green-600',
        bgColor: 'bg-brand-success/10',
        description: 'Telah diselesaikan'
      },
      {
        title: 'Sertifikat',
        value: completedCount.toString(),
        icon: Award,
        color: 'from-brand-warning to-yellow-500',
        bgColor: 'bg-brand-warning/10',
        description: 'Telah diraih'
      },
    ];
  }, [progress]);

  const ongoingCourses = useMemo(() => {
    return courses.filter(c => progress[c.id] && progress[c.id].status === 'in-progress');
  }, [courses, progress]);

  if (isAuthLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
        </div>
    )
  }

  if (!user) {
    return <div className="p-8 text-center text-red-500">Akses ditolak. Silakan login terlebih dahulu.</div>;
  }

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
      </div>

      <div className="p-8 -mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Area */}
        <div className="space-y-8">
            {/* Ongoing Courses */}
            {isLoadingData ? (
                <div className="bg-white rounded-2xl shadow-lg border p-6 text-center"><Loader2 className="mx-auto animate-spin text-brand-gold"/></div>
            ) : ongoingCourses.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-xl font-bold text-black">Lanjutkan Belajar</h2>
                        <p className="text-sm text-gray-600 mt-1">Selesaikan kursus yang sedang kamu ikuti</p>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ongoingCourses.map(course => (
                            <CourseCard key={course.id} course={course} progress={progress[course.id]} />
                        ))}
                    </div>
                </div>
            )}

            {/* Explore Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-brand-gold to-yellow-600 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-black">Jelajahi Kursus Lainnya</h3>
                        <p className="text-sm text-black/70 mt-1">Temukan {courses.length}+ kursus berkualitas untukmu</p>
                    </div>
                    <Target className="text-white/80" size={24} />
                </div>
                {isLoadingData ? (
                     <div className="p-12 text-center">
                        <Loader2 className="w-12 h-12 text-brand-gold animate-spin mx-auto mb-3" />
                        <p className="text-gray-500">Memuat kursus...</p>
                    </div>
                ) : (
                    <div className="p-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.slice(0, 6).map((course) => (
                                <CourseCard key={course.id} course={course} progress={progress[course.id]} />
                            ))}
                        </div>
                        <div className="text-center mt-6">
                             <Link href="/learning/catalog" className="px-8 py-3 bg-gradient-to-r from-brand-gold to-yellow-600 text-black rounded-xl hover:shadow-lg transition-all font-semibold">
                                Lihat Semua Kursus
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;