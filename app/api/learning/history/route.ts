// app/api/learning/history/route.ts
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const userCoursesRef = adminDb.collection('users').doc(userId).collection('courses');
    
    const progressSnapshot = await userCoursesRef.orderBy('lastAccessed', 'desc').get();

    if (progressSnapshot.empty) {
      return NextResponse.json({ success: true, data: [] });
    }

    const historyPromises = progressSnapshot.docs.map(async (progressDoc) => {
      const progressData = progressDoc.data();
      const courseId = progressDoc.id;

      // Fetch the main course details
      const courseRef = adminDb.collection('courses').doc(courseId);
      const courseDoc = await courseRef.get();

      if (!courseDoc.exists) {
        // Handle case where progress exists but course doesn't (e.g., deleted)
        return null;
      }

      const courseData = courseDoc.data();

      // Merge progress and course data
      return {
        id: courseId,
        ...courseData, // full course data (title, description, thumbnail, etc.)
        ...progressData, // user's progress data (status, progress, etc.)
        // Convert Firestore Timestamps to JSON-serializable format
        startedAt: progressData.startedAt?.toDate().toISOString() || null,
        lastAccessed: progressData.lastAccessed?.toDate().toISOString() || null,
        completedAt: progressData.completedAt?.toDate().toISOString() || null,
      };
    });

    const history = (await Promise.all(historyPromises)).filter(item => item !== null);

    return NextResponse.json({ success: true, data: history });

  } catch (error) {
    console.error('Error fetching learning history:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
