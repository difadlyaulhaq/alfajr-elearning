// app/api/admin/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// GET: Fetch all courses
export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    const coursesSnapshot = await adminDb
      .collection('courses')
      .orderBy('createdAt', 'desc')
      .get();
    
    const courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, data: courses });
  } catch (error: any) {
    console.error('[GET COURSES ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengambil data kursus' },
      { status: 500 }
    );
  }
}

// POST: Create new course
export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    const body = await request.json();
    const { 
      title, 
      categoryId, 
      description, 
      coverImage, 
      sections,
      status = 'draft'
    } = body;

    // Validation
    if (!title || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Judul dan Kategori wajib diisi' },
        { status: 400 }
      );
    }

    // Fetch Category Data to link/denormalize
    const categoryDoc = await adminDb.collection('categories').doc(categoryId).get();
    if (!categoryDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    // Calculate total videos/lessons
    const totalVideos = sections?.reduce((sum: number, section: any) => {
      return sum + (section.lessons?.length || 0);
    }, 0) || 0;

    const courseData = {
      title: title.trim(),
      categoryId,
      categoryName: categoryDoc.data()?.name || 'Uncategorized',
      description: description || '',
      coverImage: coverImage || '',
      sections: sections || [],
      totalVideos,
      totalStudents: 0,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('courses').add(courseData);

    // Increment course count in Category
    await adminDb.collection('categories').doc(categoryId).update({
      courseCount: (categoryDoc.data()?.courseCount || 0) + 1,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Kursus berhasil dibuat',
      data: { id: docRef.id, ...courseData }
    });

  } catch (error: any) {
    console.error('[POST COURSE ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal membuat kursus' },
      { status: 500 }
    );
  }
}