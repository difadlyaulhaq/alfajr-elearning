
'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, User, Mail, Building2, Award, Download } from 'lucide-react';
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
                <Loader2 className="w-12 h-12 text-[#C5A059] animate-spin" />
            </div>
        )
    }

    if (!user) {
        return <div className="p-8 text-center text-red-500">Gagal memuat profil. Silakan login kembali.</div>;
    }


    return (
        <div className="min-h-screen bg-[#F8F9FA]">
             {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6">
                <h1 className="text-2xl font-bold text-black">Profil Saya</h1>
                <p className="text-gray-600 mt-1">Lihat informasi akun dan riwayat pembelajaran Anda.</p>
            </div>

            <div className="p-8">
                {/* Profile Card */}
                <div className="bg-white p-8 rounded-xl border shadow-sm mb-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                        <Image 
                            src={`https://ui-avatars.com/api/?name=${user.name}&background=C5A059&color=fff&size=128`}
                            alt={user.name}
                            width={128}
                            height={128}
                            className="rounded-full"
                        />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-black">{user.name}</h2>
                        <div className="mt-2 space-y-2 text-gray-600">
                             <div className="flex items-center gap-3 justify-center md:justify-start">
                                <Mail size={16} />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <Building2 size={16} />
                                <span>Divisi {user.division}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Learning History */}
                <div className="bg-white rounded-xl border shadow-sm">
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold text-black flex items-center gap-2">
                            <Award size={22} />
                            Riwayat Belajar
                        </h3>
                         <p className="text-sm text-gray-500 mt-1">Kursus yang telah Anda selesaikan.</p>
                    </div>
                    <div className="divide-y">
                        {completedCourses.length > 0 ? (
                            completedCourses.map(course => (
                                <div key={course.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div>
                                        <p className="font-bold text-black">{course.title}</p>
                                        <p className="text-sm text-gray-500 mt-1">Selesai pada: {course.completedDate}</p>
                                    </div>
                                    <button 
                                        disabled={!course.certificateUrl}
                                        className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold border rounded-lg transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed text-[#C5A059] border-[#C5A059] hover:bg-[#FFF8E7]"
                                    >
                                        <Download size={16} />
                                        Sertifikat
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <p>Anda belum memiliki riwayat kursus yang selesai.</p>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
