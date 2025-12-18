'use client';

import Link from 'next/link';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  PlayCircle
} from 'lucide-react';
import { Course, Progress } from '@/types';

// Komponen Badge Status
export const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
        <CheckCircle size={12} />
        Selesai
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
      <Clock size={12} />
      Proses
    </span>
  );
};

// Kartu Kursus dengan Desain Baru (Black & Gold Theme)
export const CourseCard: React.FC<{ course: Omit<Course, 'status'> & Progress & { lastAccessedLessonId?: string } }> = ({ course }) => {
  const isCompleted = course.status === 'completed';

  const continueUrl =
    course.status === 'in-progress' && course.lastAccessedLessonId
      ? `/learning/course/${course.id}/lesson/${course.lastAccessedLessonId}`
      : `/learning/course/${course.id}`;

  return (
    <Link href={continueUrl} className="block h-full">
      <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-brand-gold h-full flex flex-col relative">
        
        {/* Thumbnail Area */}
        <div className="h-44 relative overflow-hidden bg-brand-black">
          {course.thumbnail || course.coverImage ? (
            <img 
              src={course.thumbnail || course.coverImage} 
              alt={course.title} 
              className="w-full h-full text-[#C5A059] object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-black to-gray-800">
              <BookOpen className="text-black opacity-50" size={48} />
            </div>
          )}
          
          {/* Overlay Gradient for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
             <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white text-[#C5A059] shadow-lg">
              {course.categoryName}
             </span>
          </div>

          {/* Status Badge Positioned on Image */}
          <div className="absolute bottom-3 left-3">
            <StatusBadge status={course.status || 'in-progress'} />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex flex-col flex-grow relative">
          <h3 className="font-bold text-lg text-black mb-2 line-clamp-2 leading-snug group-hover:text-brand-gold transition-colors">
            {course.title}
          </h3>
          
          <div className="text-xs text-black mb-4 line-clamp-2 flex-grow">
            {course.description || "Tidak ada deskripsi tersedia."}
          </div>

          {/* Progress Section */}
          <div className="space-y-3 mt-auto pt-4 border-t border-gray-500">
            {!isCompleted ? (
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-gray-500">Progress Belajar</span>
                  <span className="text-black">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-[#C5A059] h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 text-xs font-medium bg-green-50 p-2 rounded-lg">
                <CheckCircle size={14} />
                <span>Kursus telah diselesaikan pada {course.completedAt ? new Date(course.completedAt).toLocaleDateString('id-ID') : '-'}</span>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
               <div className="flex items-center text-xs text-gray-400 gap-1">
                  <PlayCircle size={14} />
                  <span>{course.totalVideos || 0} Materi</span>
               </div>
               <span className="text-xs font-bold text-[#C5A059] group-hover:translate-x-1 transition-transform inline-flex items-center">
                  {isCompleted ? "Lihat Kembali" : "Lanjutkan"} 
                  <span className="ml-1">→</span>
               </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
