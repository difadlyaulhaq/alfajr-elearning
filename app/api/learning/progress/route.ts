import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  console.log('--- Progress Update API Start ---');
  
  const user = await getCurrentUser();
  if (!user) {
    console.log('Unauthorized access attempt.');
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  
  console.log(`Authenticated user: ${user.id}`);

  try {
    const { courseId, lessonId } = await request.json();
    console.log('Request Payload:', { courseId, lessonId });

    const userId = user.id;

    if (!courseId || !lessonId) {
      console.log('Missing courseId or lessonId in payload.');
      return NextResponse.json({ success: false, message: 'Missing courseId or lessonId' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(userId);
    const userCourseRef = userRef.collection('courses').doc(courseId);
    const courseRef = adminDb.collection('courses').doc(courseId);

    const userCourseDoc = await userCourseRef.get();

    if (userCourseDoc.exists && userCourseDoc.data()?.completedLessons?.includes(lessonId)) {
        console.log('Lesson already marked as completed.');
        return NextResponse.json({ success: true, message: 'Lesson already completed', data: userCourseDoc.data() });
    }
    
    const completedLessons = userCourseDoc.exists 
        ? [...(userCourseDoc.data()?.completedLessons || []), lessonId]
        : [lessonId];
    console.log('Updated completed lessons list:', completedLessons);

    const courseDoc = await courseRef.get();
    if (!courseDoc.exists) {
        console.log(`Course with ID ${courseId} not found in main 'courses' collection.`);
        return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
    }
    const courseData = courseDoc.data();
    const totalLessons = courseData?.sections?.reduce((acc: number, section: any) => acc + (section.lessons?.length || 0), 0) || 0;
    console.log(`Total lessons for course: ${totalLessons}`);

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
    const isCourseCompleted = progressPercentage >= 100;
    console.log(`Calculated progress: ${progressPercentage}%, Course completed: ${isCourseCompleted}`);

    let progressData;

    if (userCourseDoc.exists) {
        const updateData = {
            progress: progressPercentage,
            status: isCourseCompleted ? 'completed' : 'in-progress',
            completedLessons: completedLessons,
            lastAccessed: FieldValue.serverTimestamp(),
            ...(isCourseCompleted && { completedAt: FieldValue.serverTimestamp() }),
        };
        console.log('Updating existing course progress document with:', updateData);
        await userCourseRef.update(updateData);
        progressData = updateData;
    } else {
        const setData = {
            courseId,
            progress: progressPercentage,
            status: isCourseCompleted ? 'completed' : 'in-progress',
            completedLessons: completedLessons,
            startedAt: FieldValue.serverTimestamp(),
            lastAccessed: FieldValue.serverTimestamp(),
            completedAt: isCourseCompleted ? FieldValue.serverTimestamp() : null,
            title: courseData?.title || 'Unknown Title',
            description: courseData?.description || ''
        };
        console.log('Creating new course progress document with:', setData);
        await userCourseRef.set(setData);
        progressData = setData;
    }

    console.log('--- Progress Update API End: Success ---');
    return NextResponse.json({ 
        success: true, 
        message: 'Progress updated successfully',
        isCourseCompleted: isCourseCompleted, // <-- Tambahkan flag ini
        data: progressData 
    });

  } catch (error) {
    console.error('--- Progress Update API End: Error ---');
    console.error('Error updating progress:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
