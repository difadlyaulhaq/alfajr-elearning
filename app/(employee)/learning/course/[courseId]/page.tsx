import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, Clock, PlayCircle, Link as LinkIcon } from "lucide-react";
import { getCoursePageData } from "@/lib/data/courses";
import Image from "next/image"; // Import Next.js Image component
import { getYouTubeThumbnail } from "@/lib/utils"; // Import helper function
import { Course, Section, Lesson } from "@/types";


export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params;
    const course = await getCoursePageData(courseId);

    if (!course) {
        notFound();
    }
    const firstLessonId = course.sections?.[0]?.lessons?.[0]?.id;

    return (
        <div className="bg-[#F8F9FA] min-h-full">
            {/* Header */}
            <div className="relative h-64 md:h-80 bg-gray-800">
                {/* Logic to find the first YouTube video URL for client-side thumbnail generation */}
                {/* This is a fallback in case course.thumbnail is not populated by server-side logic */}
                {/* However, the server-side logic has been updated to populate course.thumbnail */}
                {/* So, this client-side extraction is a strong fallback but course.thumbnail should usually be present */}
                {/* If course.thumbnail exists, it will be prioritized */}
                {(() => {
                    let firstYouTubeVideoUrl: string | undefined;
                    if (course.sections && course.sections.length > 0) {
                        for (const section of course.sections) {
                            if (section.lessons && section.lessons.length > 0) {
                                for (const lesson of section.lessons) {
                                    if (lesson.contentType === 'youtube' && lesson.url) {
                                        firstYouTubeVideoUrl = lesson.url;
                                        break;
                                    }
                                }
                            }
                            if (firstYouTubeVideoUrl) break;
                        }
                    }

                    const generatedThumbnail = firstYouTubeVideoUrl ? getYouTubeThumbnail(firstYouTubeVideoUrl) : null;

                    const initialBannerImageSrc = 
                        course.coverImage || 
                        course.thumbnail || 
                        generatedThumbnail || 
                        '/logo-alfajr.png';

                    let finalBannerImageSrc = initialBannerImageSrc;

                    // Final validation for Image src to prevent unconfigured host error
                    try {
                        const url = new URL(initialBannerImageSrc);
                        // List of allowed hostnames (from next.config.ts and internal)
                        const allowedHostnames = [
                            'img.youtube.com', 
                            'localhost', // For local development placeholder
                            // Add other allowed hostnames from next.config.ts here if any
                        ]; 
                        if (!allowedHostnames.includes(url.hostname)) {
                            console.warn(`Unconfigured hostname detected for Image src: ${url.hostname}. Falling back to default placeholder.`);
                            finalBannerImageSrc = '/logo-alfajr.png';
                        }
                    } catch (error) {
                        // If initialBannerImageSrc is not a valid URL (e.g., /logo-alfajr.png or a relative path)
                        // This is expected for relative paths, so no change needed unless it's genuinely invalid
                        if (!initialBannerImageSrc.startsWith('/')) { // If it's not a relative path, it's an invalid URL
                            console.warn(`Invalid URL format for Image src: ${initialBannerImageSrc}. Falling back to default placeholder.`);
                            finalBannerImageSrc = '/logo-alfajr.png';
                        }
                    }
                    
                    return (
                        <Image
                            src={finalBannerImageSrc}
                            alt={course.title}
                            fill
                            className="object-cover opacity-40"
                            priority
                            sizes="(max-width: 768px) 100vw, 
                                   (max-width: 1200px) 50vw, 
                                   33vw"
                        />
                    );
                })()}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 md:p-8">
                    <span className="bg-[#C5A059] text-black text-xs font-bold px-2 py-1 rounded mb-2 inline-block">
                        {course.categoryName}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 line-clamp-2">
                        {course.title}
                    </h1>
                    <p className="text-gray-200 text-sm max-w-3xl line-clamp-2">
                        {course.description}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {firstLessonId && (
                        <Link 
                            href={`/learning/course/${course.id}/lesson/${firstLessonId}`} 
                            className="lg:hidden w-full flex items-center justify-center gap-2 py-3 bg-[#C5A059] text-black rounded-lg font-bold text-lg mb-6 shadow-lg hover:bg-amber-500 transition-colors"
                        >
                            <PlayCircle />
                            Mulai Belajar
                        </Link>
                    )}

                    <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
                        <h2 className="text-xl font-bold text-black mb-3">Tentang Kursus Ini</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {course.description}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border shadow-sm">
                        <h2 className="text-xl font-bold text-black p-6">Materi Pembelajaran</h2>
                        {course.sections?.length > 0 ? (
                            course.sections.map((section, sIndex) => (
                                <div key={section.id} className="border-t">
                                    <div className="p-4 bg-gray-50">
                                        <h3 className="font-bold text-gray-800">
                                            Bab {sIndex + 1}: {section.title}
                                        </h3>
                                    </div>
                                    <ul className="divide-y">
                                        {section.lessons?.map((lesson, lIndex) => (
                                            <li 
                                                key={lesson.id} 
                                                className="p-4 hover:bg-gray-50/50"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 mr-4 font-mono text-sm shrink-0">
                                                            {lIndex + 1}
                                                        </div>
                                                        <span className="font-medium text-black">
                                                            {lesson.title}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Clock size={14} className="mr-1.5" />
                                                        {lesson.duration || '10'} menit
                                                    </div>
                                                </div>
                                                {/* Attachment Link */}
                                                {lesson.attachmentUrl && (
                                                    <div className="mt-3 pl-12">
                                                        <a
                                                            href={lesson.attachmentUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                                                        >
                                                            <LinkIcon size={14} className="mr-2" />
                                                            <span>{lesson.attachmentName || 'Lihat Lampiran'}</span>
                                                        </a>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-500">
                                <p>Belum ada materi tersedia untuk kursus ini.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:sticky top-8 self-start">
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        {firstLessonId ? (
                            <Link 
                                href={`/learning/course/${course.id}/lesson/${firstLessonId}`} 
                                className="w-full flex items-center justify-center gap-2 py-3 bg-[#C5A059] text-black rounded-lg font-bold text-lg mb-4 shadow-lg hover:bg-amber-500 transition-colors"
                            >
                                <PlayCircle />
                                Mulai Belajar
                            </Link>
                        ) : (
                            <div className="w-full text-center py-3 bg-gray-300 text-gray-600 rounded-lg font-bold text-lg mb-4">
                                Materi Belum Tersedia
                            </div>
                        )}
                        
                        <div className="space-y-3 mt-4">
                            <div className="flex items-center text-sm">
                                <BookOpen size={14} className="mr-2 text-gray-500"/>
                                <span className="font-semibold text-black">
                                    {course.totalVideos || 0} Materi
                                </span>
                            </div>
                            <div className="flex items-center text-sm capitalize">
                                <div className="w-3.5 h-3.5 mr-2 text-gray-500" />
                                <span className="text-gray-500 mr-1">Level:</span>
                                <span className="font-semibold text-black">
                                    {course.level || 'Semua Level'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}