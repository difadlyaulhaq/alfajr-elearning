
'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, PlayCircle, Lock } from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
}

interface Section {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface PlaylistProps {
    courseId: string;
    sections: Section[];
    currentLessonId: string;
    // TODO: Tambahkan progress pengguna untuk menandai mana yg sudah selesai
}

const Playlist = ({ courseId, sections, currentLessonId }: PlaylistProps) => {
    
    return (
        <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
            <div className="p-4 border-b">
                <h2 className="font-bold text-lg text-black">Daftar Materi</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {sections.map((section, sIndex) => (
                    <div key={section.id} className="border-b last:border-0">
                        {/* Section Header */}
                        <div className="p-4 bg-gray-50/70">
                            <h3 className="font-semibold text-gray-800 text-sm">
                                Bab {sIndex + 1}: {section.title}
                            </h3>
                            {/* TODO: Tampilkan progress per bab (misal: 3/5 selesai) */}
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                <div className="bg-[#C5A059] h-1.5 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                        </div>

                        {/* Lessons List */}
                        <ul className="divide-y divide-gray-100">
                            {section.lessons.map((lesson) => {
                                const isActive = lesson.id === currentLessonId;
                                // TODO: Ganti dengan logic progress asli
                                const isCompleted = false; 
                                const isLocked = false; 

                                return (
                                    <li key={lesson.id}>
                                        <Link href={isLocked ? '#' : `/learning/course/${courseId}/lesson/${lesson.id}`}>
                                            <div className={`p-4 flex items-center transition-colors text-sm ${
                                                isActive 
                                                    ? 'bg-[#FFF8E7] text-[#C5A059]' 
                                                    : isLocked
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'hover:bg-gray-50 text-black'
                                            }`}>
                                                <div className="mr-3 shrink-0">
                                                    {isCompleted ? (
                                                        <CheckCircle size={20} className="text-green-500"/>
                                                    ) : isActive ? (
                                                        <PlayCircle size={20} />
                                                    ) : isLocked ? (
                                                        <Lock size={20} />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full border-2 border-gray-300"/>
                                                    )}
                                                </div>
                                                <span className="font-medium flex-1">{lesson.title}</span>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Playlist;
