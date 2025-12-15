// app/(employee)/learning/history/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import { Course, Progress } from '@/types';

// Perbaikan Tipe: Mengatasi konflik properti 'status'
// Kita ambil semua properti Course KECUALI status, lalu gabungkan dengan Progress
type CourseWithProgress = Omit<Course, 'status'> & Progress;

// Copied and updated from the dashboard page for styling consistency
const CourseCard: React.FC<{ course: CourseWithProgress }> = ({ course }) => {
  const isCompleted = course.status === 'completed';
  const isInProgress = course.status === 'in-progress';

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
                <span className="text-xs font-bold text-black">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-yellow-500 h-1.5 rounded-full"
                  style={{ width: `${course.progress}%` }}
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
              {isCompleted ? "Lihat Lagi" : "Lanjutkan Belajar"} →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};


const LearningHistoryPage = () => {
  const { user } = useAuth();
  // Gunakan tipe baru di sini juga
  const [history, setHistory] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch('/api/learning/history');
        const result = await response.json();
        if (result.success) {
          setHistory(result.data);
        } else {
          console.error('Failed to fetch history:', result.message);
        }
      } catch (error) {
        console.error('An error occurred while fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const myCourses = useMemo(() => {
    return history.filter(item => ['in-progress', 'completed'].includes(item.status));
  }, [history]);

  return (
    <div className="container mx-auto p-8 bg-brand-gray min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 text-gray-900">Kursus Saya</h1>
        <p className="text-gray-600">Berikut adalah daftar semua materi yang sedang Anda pelajari dan yang telah diselesaikan.</p>
      </div>
      
      {loading ? (
        <div className="text-center py-20">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-gold" />
            <p className="mt-4 text-gray-500">Memuat kursus...</p>
        </div>
      ) : myCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {myCourses.map((item) => (
            <CourseCard key={item.id} course={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-white rounded-lg shadow-md border">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Anda Belum Memiliki Kursus</h3>
          <p className="mt-2 text-sm text-gray-500">Jelajahi katalog untuk menemukan kursus pertama Anda!</p>
          <Link href="/learning/catalog" className="mt-6 inline-block bg-brand-gold hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transition">
            Jelajahi Katalog
          </Link>
        </div>
      )}
    </div>
  );
};

export default LearningHistoryPage;