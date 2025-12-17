// app/api/learning/complete/route.ts
import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    // 1. Verifikasi User
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized. No auth token found.' }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifyIdToken(authToken);
    const userId = decodedClaims.uid;
    
    // 2. Ambil Data dari Body
    const { courseId, lessonId } = await req.json();

    if (!courseId || !lessonId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // 3. Ambil Data Kursus untuk menghitung total pelajaran
    const courseRef = adminDb.collection('courses').doc(courseId);
    const courseSnap = await courseRef.get();

    if (!courseSnap.exists) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const courseData = courseSnap.data();
    // Hitung total semua lesson dari semua section
    const totalLessons = courseData?.sections?.reduce((acc: number, section: any) => {
      return acc + (section.lessons?.length || 0);
    }, 0) || 0;

    // 4. Update/Buat Dokumen Progress User
    const progressRef = adminDb.collection('users').doc(userId).collection('courses').doc(courseId);
    const progressSnap = await progressRef.get();

    let completedLessonIds: string[] = [];
    
    if (progressSnap.exists) {
      completedLessonIds = progressSnap.data()?.completedLessonIds || [];
    }

    // Tambahkan lessonId jika belum ada
    if (!completedLessonIds.includes(lessonId)) {
      completedLessonIds.push(lessonId);
    }

    // 5. Hitung progres baru
    const numCompleted = completedLessonIds.length;
    
    // Tentukan status selesai berdasarkan perbandingan jumlah, bukan persentase, untuk menghindari eror pembulatan.
    const isCompleted = totalLessons > 0 && numCompleted >= totalLessons;

    // Hitung persentase, dan pastikan nilainya 100 jika sudah selesai.
    let progressPercentage = totalLessons > 0 
      ? Math.round((numCompleted / totalLessons) * 100)
      : 0;
      
    if (isCompleted) {
      progressPercentage = 100;
    }
    
    const updateData: any = {
      courseId,
      userId,
      progress: progressPercentage,
      completedLessonIds,
      lastAccess: new Date(),
      status: isCompleted ? 'completed' : 'in-progress'
    };

    if (isCompleted && (!progressSnap.exists || progressSnap.data()?.status !== 'completed')) {
      updateData.completedAt = new Date();
    }

    await progressRef.set(updateData, { merge: true });

    return NextResponse.json({ 
      success: true, 
      progress: progressPercentage,
      isCourseCompleted: isCompleted 
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
