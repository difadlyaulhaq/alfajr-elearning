"use client";

import { VideoPlayer } from "@/components/learning/VideoPlayer";
import { Playlist } from "@/components/learning/Playlist";
import { Course, Lesson } from "@/types";
import { notFound } from "next/navigation";
import { ScreenProtection } from "@/components/shared/ScreenProtection";

interface LessonPlayerProps {
  course: Course;
  currentLesson: Lesson;
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
  completedLessons: string[];
}

export default function LessonPlayer({
  course,
  currentLesson,
  prevLesson,
  nextLesson,
  completedLessons,
}: LessonPlayerProps) {
  if (!course || !currentLesson) {
    notFound();
  }

  const isLessonCompleted = completedLessons.includes(currentLesson.id);

  return (
    <ScreenProtection
      watermarkText={`ALFAJR E-LEARNING - ${course.title.toUpperCase()}`}
      enableWatermark={true}
      enableBlurOnFocusLoss={true}
      enableKeyboardBlock={true}
      enableContextMenuBlock={true}
      enableDevToolsDetection={true}
      showWarningOnAttempt={true}
    >
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <VideoPlayer
            courseId={course.id}
            lesson={currentLesson}
            prevLesson={prevLesson}
            nextLesson={nextLesson}
            isCompleted={isLessonCompleted}
          />
        </div>
        <div className="w-80 border-l">
          <Playlist
            courseId={course.id}
            sections={course.sections}
            currentLessonId={currentLesson.id}
            completedLessons={completedLessons}
          />
        </div>
      </div>
    </ScreenProtection>
  );
}
