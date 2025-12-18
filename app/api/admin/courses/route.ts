// app/api/admin/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Course, Section, Lesson } from '@/types'; // Import Section and Lesson types

function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function generateYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

// GET: Mengambil semua data kursus
export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    const coursesSnapshot = await adminDb.collection('courses').orderBy('createdAt', 'desc').get();
    
    const courses = coursesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure createdAt is a serializable format if it's a Timestamp
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      };
    });

    return NextResponse.json({ success: true, data: courses });

  } catch (error: any) {
    console.error('[GET ALL COURSES ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data kursus' },
      { status: 500 }
    );
  }
}

// POST: Membuat kursus baru
export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    const body = await request.json();
    
    // Simple validation
    if (!body.title || !body.categoryId) {
      return NextResponse.json(
        { success: false, error: 'Judul dan Kategori wajib diisi' },
        { status: 400 }
      );
    }
    
    // Get categoryName from categoryId
    const categoryDoc = await adminDb.collection('categories').doc(body.categoryId).get();
    const categoryName = categoryDoc.exists ? categoryDoc.data()?.name : 'Uncategorized';

    let courseThumbnail: string | undefined;

    // Iterate through sections and lessons to find the first YouTube video thumbnail
    if (body.sections && Array.isArray(body.sections)) {
      for (const section of body.sections as Section[]) { // Cast to Section[] for type safety
        if (section.lessons && Array.isArray(section.lessons)) {
          for (const lesson of section.lessons as Lesson[]) { // Cast to Lesson[]
            if (lesson.contentType === 'youtube' && lesson.url) {
              const videoId = getYouTubeVideoId(lesson.url);
              if (videoId) {
                courseThumbnail = generateYouTubeThumbnailUrl(videoId);
                break; 
              }
            }
          }
        }
        if (courseThumbnail) break; 
      }
    }

    const newCourse: Omit<Course, 'id'> = {
      ...body,
      categoryName: categoryName,
      thumbnail: courseThumbnail || body.thumbnail, 
      totalVideos: body.sections?.reduce((acc: number, section: any) => acc + (section.lessons?.length || 0), 0) || 0,
      totalStudents: 0, 
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection('courses').add(newCourse);

    return NextResponse.json({ 
        success: true, 
        message: 'Kursus berhasil dibuat', 
        data: { id: docRef.id, ...newCourse } 
    }, { status: 201 });

  } catch (error: any) {
    console.error('[POST COURSE ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat kursus' },
      { status: 500 }
    );
  }
}
