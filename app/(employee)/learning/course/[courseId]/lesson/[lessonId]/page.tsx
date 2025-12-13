import { notFound } from "next/navigation";
import { getCoursePageData } from "@/lib/data/courses";
import LessonPlayer from "@/components/learning/LessonPlayer";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const course = await getCoursePageData(courseId);

  if (!course) {
    notFound();
  }

  const allLessons = course.sections.flatMap((section) => section.lessons);
  const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId);

  if (currentLessonIndex === -1) {
    notFound();
  }

  const currentLesson = allLessons[currentLessonIndex];
  const prevLesson = allLessons[currentLessonIndex - 1] || null;
  const nextLesson = allLessons[currentLessonIndex + 1] || null;

  return (
    <LessonPlayer
      course={course}
      currentLesson={currentLesson}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
    />
  );
}