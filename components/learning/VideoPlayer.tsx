"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Lesson } from "@/types";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Lock,
  PlayCircle,
} from "lucide-react";

interface VideoPlayerProps {
  courseId: string;
  lesson: Lesson;
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
  isCompleted: boolean;
}

export function VideoPlayer({
  courseId,
  lesson,
  prevLesson,
  nextLesson,
  isCompleted,
}: VideoPlayerProps) {
  const { user, isLoading } = useAuth();

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;

    if (videoId) {
      const params = new URLSearchParams({
        rel: "0",
        showinfo: "0",
        iv_load_policy: "3",
        modestbranding: "1",
        controls: "1",
        disablekb: "0",
      });
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    }
    return null;
  };

  const embedUrl = useMemo(() => {
    if (lesson.contentType === "youtube") {
      return getYouTubeEmbedUrl(lesson.url);
    }
    return lesson.url;
  }, [lesson]);

  const watermarkAnimation = `
    @keyframes float-watermark {
      0% { transform: translate(0%, 0%); }
      25% { transform: translate(10%, 20%); }
      50% { transform: translate(25%, 5%); }
      75% { transform: translate(5%, 25%); }
      100% { transform: translate(0%, 0%); }
    }
  `;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA]">
      <header className="bg-white p-4 border-b flex items-center justify-between sticky top-0 z-10">
        <div className="flex-1">
          <Link
            href={`/learning/course/${courseId}`}
            className="text-sm text-gray-600 hover:text-black transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Kembali ke Detail Kursus
          </Link>
          <h1 className="text-xl font-bold text-black mt-1 truncate">
            {lesson.title}
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {prevLesson && (
            <Link
              href={`/learning/course/${courseId}/lesson/${prevLesson.id}`}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg hover:bg-gray-100"
            >
              Sebelumnya
            </Link>
          )}
          {nextLesson && (
            <Link
              href={`/learning/course/${courseId}/lesson/${nextLesson.id}`}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#C5A059] rounded-lg hover:bg-amber-500"
            >
              Selanjutnya
            </Link>
          )}
        </div>
      </header>

      <div className="p-4 md:p-8 flex-1">
        {lesson.contentType === "text" ? (
          <div className="bg-white p-6 md:p-8 rounded-lg border">
            <h2 className="text-2xl font-bold text-black mb-4">
              {lesson.title}
            </h2>
            <div
              className="prose prose-lg max-w-none text-black"
              dangerouslySetInnerHTML={{ __html: lesson.textContent }}
            />
          </div>
        ) : (
          <div
            className="relative w-full bg-black rounded-lg overflow-hidden"
            style={{ paddingTop: "56.25%" }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <style>{watermarkAnimation}</style>
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={lesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
            ) : (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white">
                <p>URL video tidak valid atau tidak didukung.</p>
              </div>
            )}
            {user && (
              <div
                className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none"
                style={{
                  animation: "float-watermark 20s infinite ease-in-out",
                }}
              >
                <p
                  className="text-white/20 font-sans text-xl md:text-2xl select-none"
                  style={{ textShadow: "1px 1px 2px black" }}
                >
                  alfajrumroh
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 bg-white p-6 rounded-lg border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-black">{lesson.title}</h2>
            <p className="text-sm text-gray-500">
              Tonton video hingga selesai untuk melanjutkan.
            </p>
          </div>
          <button
            disabled={isCompleted}
            className={`flex items-center gap-2 px-5 py-2.5 font-semibold text-white rounded-lg ${
              isCompleted
                ? "bg-green-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <CheckCircle size={18} />
            {isCompleted ? "Selesai" : "Tandai Selesai"}
          </button>
        </div>
      </div>
    </div>
  );
}
