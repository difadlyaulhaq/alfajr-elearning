// lib/data/courses.ts
import 'server-only'; // Ensures this module is only used on the server

import { adminDb } from '@/lib/firebase/admin';
import { Course } from '@/types';




export async function getCoursePageData(
  courseId: string
): Promise<Course | null> {
  try {
    if (!adminDb) {
      console.error(
        "[FIREBASE_GET_COURSE] Firebase Admin has not been initialized."
      );
      throw new Error("Firebase Admin has not been initialized.");
    }

    const courseRef = adminDb.collection("courses").doc(courseId);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      console.warn(
        `[FIREBASE_GET_COURSE] Course with ID "${courseId}" not found.`
      );
      return null;
    }

    const courseData = courseDoc.data();

    return { id: courseDoc.id, ...courseData } as Course;
  } catch (error) {
    console.error(
      `[FIREBASE_GET_COURSE_BY_ID_ERROR] Failed to fetch course ${courseId}:`,
      error
    );

    return null;
  }
}

export async function getAllCourses(): Promise<Course[]> {
    try {
        if (!adminDb) {
            console.error('[FIREBASE_GET_ALL_COURSES] Firebase Admin has not been initialized.');
            throw new Error('Firebase Admin has not been initialized.');
        }

        const coursesSnapshot = await adminDb.collection('courses').orderBy('createdAt', 'desc').get();
        
        if (coursesSnapshot.empty) {
            return [];
        }

        const courses = coursesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            } as Course;
        });

        return courses;

    } catch (error) {
        console.error('[FIREBASE_GET_ALL_COURSES_ERROR]', error);
        return []; // Return an empty array on error
    }
}

