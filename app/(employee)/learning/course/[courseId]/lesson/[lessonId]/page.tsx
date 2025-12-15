import { notFound } from "next/navigation";
import { getCoursePageData } from "@/lib/data/courses";
import LessonPlayer from "@/components/learning/LessonPlayer";
import { getCurrentUser } from "@/lib/session";
import { adminDb } from "@/lib/firebase/admin";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;

  const [user, course] = await Promise.all([
    getCurrentUser(),
    getCoursePageData(courseId),
  ]);

  if (!course) {
    notFound();
  }

  let completedLessons: string[] = [];
  if (user && adminDb) {
    const progressDoc = await adminDb
      .collection("progress")
      .doc(`${user.id}_${courseId}`)
      .get();
    
    if (progressDoc.exists) {
      completedLessons = progressDoc.data()?.completedLessons || [];
    }
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
      completedLessons={completedLessons}
    />
  );
}