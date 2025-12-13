"use client";

import { VideoPlayer } from "@/components/learning/VideoPlayer";
import { Playlist } from "@/components/learning/Playlist";
import { Course, Lesson } from "@/types";
import { notFound } from "next/navigation";

interface LessonPlayerProps {
  course: Course;
  currentLesson: Lesson;
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
}

export default function LessonPlayer({
  course,
  currentLesson,
  prevLesson,
  nextLesson,
}: LessonPlayerProps) {
  if (!course || !currentLesson) {
    notFound();
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <VideoPlayer
          courseId={course.id}
          lesson={currentLesson}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
          isCompleted={false}
        />
      </div>
      <div className="w-80 border-l">
        <Playlist
          courseId={course.id}
          sections={course.sections}
          currentLessonId={currentLesson.id}
        />
      </div>
    </div>
  );
}
