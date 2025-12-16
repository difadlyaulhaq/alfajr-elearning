
'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Mail, Building2, Award, Download, MapPin, Calendar } from 'lucide-react';
import Image from 'next/image';

// Placeholder data
const completedCourses = [
  {
    id: '1',
    title: 'SOP Pelayanan Jamaah Umroh',
    completedDate: '15 November 2025',
    certificateUrl: '#',
  },
  {
    id: '2',
    title: 'Dasar-dasar Digital Marketing untuk Travel',
    completedDate: '28 Oktober 2025',
    certificateUrl: null,
  },
];


const ProfilePage = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
            </div>
        )
    }

    if (!user) {
        return <div className="p-8 text-center text-red-500">Gagal memuat profil. Silakan login kembali.</div>;
    }

    return (
        <div className="min-h-screen bg-brand-gray pb-20">
            {/* --- HERO BANNER SECTION --- */}
            <div className="relative h-48 bg-brand-black overflow-hidden">
                {/* Dekorasi Latar Belakang */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-gold to-transparent" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-gold rounded-full blur-3xl" />
                </div>
                
                <div className="absolute bottom-0 left-0 w-full px-8 pb-6 pt-20 bg-gradient-to-t from-black/80 to-transparent">
                     <h1 className="text-3xl font-bold text-white tracking-tight">Profil Saya</h1>
                     <p className="text-brand-gold/80 text-sm mt-1">Kelola informasi pribadi dan pencapaian Anda</p>
                </div>
            </div>

            <div className="px-6 md:px-12 -mt-12 relative z-10">
                {/* --- PROFILE CARD UTAMA --- */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                    
                    {/* Bagian Kiri: Foto & Info Dasar */}
                    <div className="p-8 md:w-1/3 bg-gray-50 border-r border-gray-100 flex flex-col items-center text-center">
                        <div className="relative w-32 h-32 mb-4">
                            <div className="absolute inset-0 bg-brand-gold rounded-full blur-md opacity-40 animate-pulse"></div>
                            <Image 
                                src={`https://ui-avatars.com/api/?name=${user.name}&background=C5A059&color=fff&size=128`}
                                alt={user.name}
                                width={128}
                                height={128}
                                className="rounded-full border-4 border-white shadow-lg relative z-10"
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-black">{user.name}</h2>
                        <span className="inline-block mt-2 px-3 py-1 bg-brand-gold/10 text-brand-gold text-xs font-bold rounded-full uppercase tracking-wide border border-brand-gold/20">
                            {user.role === 'admin' ? 'Administrator' : 'Karyawan'}
                        </span>
                    </div>

                    {/* Bagian Kanan: Detail & Statistik */}
                    <div className="p-8 md:w-2/3">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Informasi Kontak & Pekerjaan</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Email</p>
                                    <p className="text-gray-900 font-medium break-all">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Divisi</p>
                                    <p className="text-gray-900 font-medium">{user.division || '-'}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Bergabung Sejak</p>
                                    <p className="text-gray-900 font-medium">
                                        {/* Fallback tanggal jika tidak ada di DB */}
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                                    </p>
                                </div>
                            </div>

                             <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Lokasi Kantor</p>
                                    <p className="text-gray-900 font-medium">Pusat (Yogyakarta)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIWAYAT BELAJAR --- */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b bg-gray-50/50 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-brand-black flex items-center gap-2">
                                <Award className="text-brand-gold" size={24} />
                                Sertifikat & Riwayat
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Unduh sertifikat kursus yang telah diselesaikan</p>
                        </div>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                        {completedCourses.length > 0 ? (
                            completedCourses.map(course => (
                                <div key={course.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                            <Award size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg group-hover:text-brand-gold transition-colors">{course.title}</p>
                                            <p className="text-sm text-gray-500">Diselesaikan pada: <span className="font-medium text-gray-700">{course.completedDate}</span></p>
                                        </div>
                                    </div>
                                    <button 
                                        disabled={!course.certificateUrl}
                                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold border-2 rounded-xl transition-all disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-brand-gold border-brand-gold hover:bg-brand-gold hover:text-white shadow-sm hover:shadow-md"
                                    >
                                        <Download size={18} />
                                        {course.certificateUrl ? 'Unduh Sertifikat' : 'Sertifikat Belum Tersedia'}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Award className="text-gray-400" size={40} />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">Belum Ada Riwayat</h4>
                                <p className="text-gray-500 max-w-sm mx-auto mt-2">Anda belum menyelesaikan kursus apapun. Mulai belajar sekarang untuk mendapatkan sertifikat!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
