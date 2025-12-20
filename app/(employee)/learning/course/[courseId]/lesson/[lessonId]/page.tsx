import { notFound } from "next/navigation";
import { getCoursePageData } from "@/lib/data/courses";
import { getCurrentUser } from "@/lib/session";
import { adminDb } from "@/lib/firebase/admin";
import { LessonPlayerMobile } from "@/components/learning/LessonPlayerMobile";
import { LessonPlayerDesktop } from "@/components/learning/LessonPlayerDesktop";

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
  const currentLessonIndex = allLessons.findIndex(
    (l) => String(l.id) === String(lessonId)
  );

  if (currentLessonIndex === -1) {
    notFound();
  }

  const currentLesson = allLessons[currentLessonIndex];
  const prevLesson = allLessons[currentLessonIndex - 1] || null;
  const nextLesson = allLessons[currentLessonIndex + 1] || null;

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden">
        <LessonPlayerMobile
          courseId={courseId}
          courseTitle={course.title}
          lesson={currentLesson}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
          completedLessons={completedLessons}
          isCompleted={completedLessons.includes(currentLesson.id)}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <LessonPlayerDesktop
          courseId={courseId}
          courseTitle={course.title}
          lesson={currentLesson}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
          completedLessons={completedLessons}
          isCompleted={completedLessons.includes(currentLesson.id)}
        />
      </div>
    </>
  );
}
