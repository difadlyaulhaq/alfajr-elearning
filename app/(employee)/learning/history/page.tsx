// app/(employee)/learning/history/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  BookOpen, 
  CheckCircle, 
  Loader2, 
  History, 
  Search, 
  Clock, 
  Filter,
  PlayCircle
} from 'lucide-react';
import { CourseCard } from '@/components/learning/CourseCard';
import { Course, Progress } from '@/types';

const LearningHistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<(Omit<Course, 'status'> & Progress)[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Filter dan Search
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Logic Filtering
  const filteredCourses = useMemo(() => {
    return history.filter(item => {
      // Filter by Status Tab
      const statusMatch = 
        filter === 'all' ? true : 
        filter === 'completed' ? item.status === 'completed' :
        item.status !== 'completed'; // in-progress captures everything else

      // Filter by Search Query
      const searchMatch = item.title.toLowerCase().includes(searchQuery.toLowerCase());

      return statusMatch && searchMatch;
    });
  }, [history, filter, searchQuery]);

  // Stats sederhana
  const stats = useMemo(() => {
    const completed = history.filter(h => h.status === 'completed').length;
    const inProgress = history.length - completed;
    return { completed, inProgress, total: history.length };
  }, [history]);

  return (
    <div className="min-h-screen bg-brand-gray pb-20">
      
      {/* Hero Header - Konsisten dengan Dashboard */}
      <div className="relative bg-brand-black overflow-hidden mb-8 shadow-md">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #C5A059 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="relative container mx-auto px-6 py-12">
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-gold to-yellow-700 flex items-center justify-center shadow-lg border-2 border-white/10 text-white">
                  <History size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">Riwayat Belajar</h1>
                  <p className="text-brand-gold/80 mt-1 font-medium">Arsip perjalanan pengembangan diri Anda</p>
                </div>
              </div>

              {/* Mini Stats di Header */}
              <div className="flex gap-4 text-white">
                <div className="text-center px-4 py-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-brand-gold">{stats.total}</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-70">Total Kursus</div>
                </div>
                <div className="text-center px-4 py-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-70">Selesai</div>
                </div>
              </div>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        
        {/* Controls Bar: Search & Filter Tabs */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-4 z-10">
          
          {/* Tabs - FIXED VERSION */}
          <div className="flex p-1.5 bg-gray-50 rounded-lg w-full md:w-auto gap-1">
            <button 
              onClick={() => setFilter('all')}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-md text-sm font-semibold transition-all ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-brand-gold to-yellow-600 text-black shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Semua
            </button>
            <button 
              onClick={() => setFilter('in-progress')}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-md text-sm font-semibold transition-all ${
                filter === 'in-progress' 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Sedang Berjalan
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-md text-sm font-semibold transition-all ${
                filter === 'completed' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Selesai
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari kursus..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold sm:text-sm transition-all text-gray-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="text-center py-24">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-gold" />
              <p className="mt-4 text-gray-500 font-medium">Menyiapkan data riwayat...</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((item) => (
              <CourseCard key={item.id} course={item} />
            ))}
          </div>
        ) : history.length === 0 ? (
          <Link href="/learning/catalog" className="block">
            <div className="text-center py-20 px-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 border-dashed cursor-pointer hover:border-brand-gold">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="mt-2 text-xl font-bold text-gray-900">Mulai Perjalanan Belajar Anda</h3>
              <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                Anda belum terdaftar di kursus manapun. Jelajahi katalog kami untuk menemukan materi yang menarik!
              </p>
              <div className="mt-6 inline-flex items-center gap-2 bg-brand-black text-white font-bold py-3 px-8 rounded-xl transition shadow-lg">
                Jelajahi Katalog
              </div>
            </div>
          </Link>
        ) : (
          <div className="text-center py-20 px-4 bg-white rounded-2xl shadow-sm border border-gray-100 border-dashed">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="mt-2 text-xl font-bold text-gray-900">Tidak ada kursus ditemukan</h3>
            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
              {searchQuery 
                ? `Tidak ada hasil untuk pencarian "${searchQuery}" dengan filter yang diterapkan.`
                : "Tidak ada kursus yang cocok dengan filter yang Anda pilih."}
            </p>
            <button 
              onClick={() => setFilter('all')}
              className="mt-6 text-brand-gold font-semibold hover:underline"
            >
              Lihat Semua Kursus
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningHistoryPage;