// app/api/learning/history/route.ts
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { adminDb } from '@/lib/firebase/admin';

// Helper untuk menangani format tanggal (Timestamp atau String)
const safeDate = (val: any): string | null => {
  if (!val) return null;
  // Jika tipe data adalah Firestore Timestamp (punya method toDate)
  if (typeof val.toDate === 'function') {
    return val.toDate().toISOString();
  }
  // Jika tipe data sudah string atau date object
  try {
    return new Date(val).toISOString();
  } catch (e) {
    console.error('Invalid date format:', val);
    return null;
  }
};

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    
    // Fetch dari root collection 'progress' berdasarkan userId
    const progressSnapshot = await adminDb
      .collection('progress')
      .where('userId', '==', userId)
      .get();

    if (progressSnapshot.empty) {
      return NextResponse.json({ success: true, data: [] });
    }

    const historyPromises = progressSnapshot.docs.map(async (progressDoc) => {
      const progressData = progressDoc.data();
      // Pastikan field courseId ada di dokumen progress
      const courseId = progressData.courseId || progressDoc.id;

      // Fetch detail course master untuk mendapatkan gambar, deskripsi, dll.
      const courseRef = adminDb.collection('courses').doc(courseId);
      const courseDoc = await courseRef.get();
      
      let courseData: any = {};

      if (courseDoc.exists) {
        courseData = courseDoc.data();
      } else {
        // Fallback jika course master tidak ditemukan
        courseData = {
          title: progressData.courseName || progressData.title || 'Kursus Tidak Ditemukan',
          description: 'Data detail kursus tidak ditemukan di database.',
          categoryName: 'N/A',
          totalVideos: progressData.totalLessons || 0,
        };
      }

      // Gabungkan data
      return {
        id: courseId,
        ...courseData, 
        ...progressData, 
        // Gunakan helper safeDate agar aman untuk Timestamp maupun String
        startedAt: safeDate(progressData.startedAt),
        // Cek kedua kemungkinan nama field (lastAccessed / lastAccess)
        lastAccessed: safeDate(progressData.lastAccessed || progressData.lastAccess),
        completedAt: safeDate(progressData.completedAt),
      };
    });

    const history = await Promise.all(historyPromises);

    // Sorting manual descending (terbaru di atas)
    history.sort((a: any, b: any) => {
      const dateA = a.lastAccessed ? new Date(a.lastAccessed).getTime() : 0;
      const dateB = b.lastAccessed ? new Date(b.lastAccessed).getTime() : 0;
      return dateB - dateA; 
    });

    return NextResponse.json({ success: true, data: history });

  } catch (error) {
    console.error('Error fetching learning history:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}