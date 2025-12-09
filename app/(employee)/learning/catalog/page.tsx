
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Loader2 } from 'lucide-react';

// --- Tipe Data ---
interface Course {
  id: string;
  title: string;
  categoryName: string;
  description: string;
  thumbnail?: string;
  coverImage?: string;
  totalVideos: number;
  status: 'active' | 'draft';
}

interface Category {
  id: string;
  name: string;
}

const CourseCatalogPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [coursesRes, catRes] = await Promise.all([
          fetch('/api/admin/courses'),
          fetch('/api/admin/categories')
        ]);
        
        const coursesData = await coursesRes.json();
        const catData = await catRes.json();

        if (coursesData.success) {
          setCourses(coursesData.data.filter((c: Course) => c.status === 'active'));
        }
        if (catData.success) {
          setCategories(catData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesCategory = activeCategory === 'all' || course.categoryName === activeCategory;
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [courses, activeCategory, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-black">Katalog Materi</h1>
        <p className="text-gray-600 mt-1">Temukan pengetahuan dan keahlian baru untuk menunjang karirmu.</p>
      </div>

      <div className="p-8">
        {/* Filter and Search */}
        <div className="mb-8">
            {/* Search Bar */}
            <div className="relative mb-4 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Cari judul kursus..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black"
                />
            </div>
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                        activeCategory === 'all' ? 'bg-[#C5A059] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    Semua
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.name)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                            activeCategory === cat.name ? 'bg-[#C5A059] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-[#C5A059] animate-spin" />
          </div>
        ) : (
            filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
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
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <h3 className="text-lg font-semibold">Tidak ada kursus yang ditemukan</h3>
                    <p>Coba ubah kata kunci pencarian atau filter kategori Anda.</p>
                </div>
            )
        )}
      </div>
    </div>
  );
};

export default CourseCatalogPage;
