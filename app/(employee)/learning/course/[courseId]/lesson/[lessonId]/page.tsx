'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import VideoPlayer from '@/components/learning/VideoPlayer';
import Playlist from '@/components/learning/Playlist';

// --- Tipe Data ---
interface Lesson {
  id: string;
  title: string;
  contentType: 'video' | 'youtube' | 'text';
  url: string;
  textContent: string;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  sections: Section[];
}

export default function LessonPage({ params }: { params: { courseId: string, lessonId: string } }) {
  const { courseId, lessonId } = params;
  const { user, isLoading: isAuthLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCourseData = async () => {
      if (!courseId) return;
      setIsLoadingCourse(true);
      try {
        const res = await fetch(`/api/admin/courses/${courseId}`);
        if (!res.ok) {
          throw new Error('Gagal memuat data kursus.');
        }
        const data = await res.json();
        if (data.success) {
          setCourse(data.data);
        } else {
          throw new Error(data.error || 'Gagal memuat data kursus.');
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoadingCourse(false);
      }
    };
    getCourseData();
  }, [courseId]);

  if (isAuthLoading || isLoadingCourse) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return notFound();
  }
  
  // Find the current lesson and its neighbors
  const allLessons = course.sections.flatMap(section => section.lessons);
  const currentLessonIndex = allLessons.findIndex(l => l.id === lessonId);

  if (currentLessonIndex === -1) {
    return notFound();
  }

  const currentLesson = allLessons[currentLessonIndex];
  const prevLesson = allLessons[currentLessonIndex - 1];
  const nextLesson = allLessons[currentLessonIndex + 1];

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white p-4 border-b flex items-center justify-between sticky top-0 z-10">
          <div className='flex-1'>
            <Link href={`/learning/course/${courseId}`} className="text-sm text-gray-600 hover:text-black transition-colors flex items-center gap-2">
              <ArrowLeft size={16} /> Kembali ke Detail Kursus
            </Link>
            <h1 className="text-xl font-bold text-black mt-1 truncate">{course.title}</h1>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {prevLesson && (
              <Link href={`/learning/course/${courseId}/lesson/${prevLesson.id}`} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg hover:bg-gray-100">
                Sebelumnya
              </Link>
            )}
            {nextLesson && (
              <Link href={`/learning/course/${courseId}/lesson/${nextLesson.id}`} className="px-4 py-2 text-sm font-semibold text-white bg-[#C5A059] rounded-lg hover:bg-amber-500">
                Selanjutnya
              </Link>
            )}
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1">
          {/* Kirim 'user' ke VideoPlayer */}
          <VideoPlayer lesson={currentLesson} user={user} />
          
          <div className="mt-6 bg-white p-6 rounded-lg border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-black">{currentLesson.title}</h2>
              <p className="text-sm text-gray-500">Tonton video hingga selesai untuk melanjutkan.</p>
            </div>
            <button disabled className="flex items-center gap-2 px-5 py-2.5 font-semibold text-white bg-gray-400 rounded-lg cursor-not-allowed">
              <CheckCircle size={18} />
              Tandai Selesai
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Sidebar */}
      <div className="w-80 hidden lg:block h-full border-l border-gray-200 shrink-0">
        <Playlist courseId={courseId} sections={course.sections} currentLessonId={lessonId} />
      </div>
    </div>
  );
}