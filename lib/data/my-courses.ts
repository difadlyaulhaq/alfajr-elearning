
import { adminDb } from '@/lib/firebase/admin';
import { Course, User, Division, Progress } from '@/types';

type CourseWithProgress = Omit<Course, 'status'> & Progress;

// This function will be used by the server component for "My Courses"
export async function getMyEnrolledCourses(userId: string): Promise<CourseWithProgress[]> {
  if (!userId) return [];

  // 1. Get User's Division Name
  const userDoc = await adminDb.collection('users').doc(userId).get();
  if (!userDoc.exists) return [];
  const user = userDoc.data() as User;
  const userDivisionName = user.division;

  // 2. Find Division ID from Division Name (as enrollment is by ID)
  let divisionId: string | null = null;
  if (userDivisionName) {
    const divisionSnapshot = await adminDb.collection('divisions').where('name', '==', userDivisionName).limit(1).get();
    if (!divisionSnapshot.empty) {
      divisionId = divisionSnapshot.docs[0].id;
    }
  }

  // 3. Build queries
  const coursesRef = adminDb.collection('courses');
  const queries = [
    coursesRef.where('enrolledUserIds', 'array-contains', userId).get(),
  ];

  if (divisionId) {
    queries.push(coursesRef.where('enrolledDivisionIds', 'array-contains', divisionId).get());
  }
  
  // 4. Execute queries and merge results
  const results = await Promise.all(queries);
  const coursesMap = new Map<string, Course>();

  results.forEach(snapshot => {
    snapshot.forEach(doc => {
      if (!coursesMap.has(doc.id)) {
        coursesMap.set(doc.id, { id: doc.id, ...doc.data() } as Course);
      }
    });
  });
  
  const enrolledCourses = Array.from(coursesMap.values());
  if (enrolledCourses.length === 0) return [];

  // 5. Get progress for each enrolled course
  const progressPromises = enrolledCourses.map(course => 
    adminDb.collection('users').doc(userId).collection('courses').doc(course.id).get()
  );
  
  const progressResults = await Promise.all(progressPromises);
  const coursesWithProgress: CourseWithProgress[] = [];

  for (let i = 0; i < enrolledCourses.length; i++) {
    const course = enrolledCourses[i];
    const progressDoc = progressResults[i];
    
    let progressData: Progress;
    if (progressDoc.exists) {
      progressData = progressDoc.data() as Progress;
    } else {
      progressData = {
        userId,
        courseId: course.id,
        status: 'not-started',
        progress: 0,
        completedLessons: [],
        lastAccess: new Date(),
      };
    }

    const combinedData = {
      ...course,
      ...progressData,
    };

    // Sanitize Firestore Timestamps and JS Dates into serializable strings
    const sanitizedData = Object.fromEntries(
      Object.entries(combinedData).map(([key, value]: [string, any]) => {
        // Check for Firestore Timestamp
        if (value && typeof value.toDate === 'function') {
          return [key, value.toDate().toISOString()];
        }
        // Check for Javascript Date
        if (value instanceof Date) {
          return [key, value.toISOString()];
        }
        return [key, value];
      })
    );

    coursesWithProgress.push(sanitizedData as CourseWithProgress);
  }

  return coursesWithProgress;
}
