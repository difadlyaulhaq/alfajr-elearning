import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// GET: Detail course by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> } // 1. Change type to courseId
) {
  try {
    const { courseId } = await params; // 2. Destructure courseId
    
    if (!adminDb) {
      throw new Error('Firebase Admin belum siap');
    }

    // 3. Use courseId in the query
    const courseDoc = await adminDb.collection('courses').doc(courseId).get();

    if (!courseDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Kursus tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: courseDoc.id, ...courseDoc.data() }
    });

  } catch (error: any) {
    console.error('[GET COURSE DETAIL ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengambil detail kursus' },
      { status: 500 }
    );
  }
}

// PATCH: Update course
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> } // 1. Change type
) {
  try {
    const { courseId } = await params; // 2. Destructure
    const body = await request.json();
    const { 
      title, 
      categoryId, 
      description, 
      coverImage, 
      sections,
      status
    } = body;

    if (!adminDb) {
      throw new Error('Firebase Admin belum siap');
    }

    // 3. Use courseId
    const courseRef = adminDb.collection('courses').doc(courseId);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Kursus tidak ditemukan' },
        { status: 404 }
      );
    }

    const currentData = courseDoc.data();
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    // ... (Logika update lainnya tetap sama) ...
    // Pastikan referensi variable "id" di dalam logika update diganti menjadi "courseId" jika ada

    if (title) updateData.title = title.trim();

    if (categoryId && categoryId !== currentData?.categoryId) {
        // ... (Logika kategori tetap sama)
    }

    if (description !== undefined) updateData.description = description;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (status) updateData.status = status;

    if (sections) {
      updateData.sections = sections;
      updateData.totalVideos = sections.reduce((sum: number, section: any) => {
        return sum + (section.lessons?.length || 0);
      }, 0);
    }

    await courseRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Kursus berhasil diperbarui'
    });

  } catch (error: any) {
    console.error('[PATCH COURSE ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengupdate kursus' },
      { status: 500 }
    );
  }
}

// DELETE: Hapus course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> } // 1. Change type
) {
  try {
    const { courseId } = await params; // 2. Destructure

    if (!adminDb) {
      throw new Error('Firebase Admin belum siap');
    }

    // 3. Use courseId
    const courseRef = adminDb.collection('courses').doc(courseId);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Kursus tidak ditemukan' },
        { status: 404 }
      );
    }

    const courseData = courseDoc.data();

    // Check enrollments using courseId
    const enrollments = await adminDb
      .collection('enrollments')
      .where('courseId', '==', courseId)
      .get();

    if (!enrollments.empty) {
      return NextResponse.json(
        {
          success: false,
          error: `Kursus tidak bisa dihapus karena masih memiliki ${enrollments.size} peserta aktif`
        },
        { status: 400 }
      );
    }

    // ... (Logika update kategori tetap sama) ...

    await courseRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Kursus berhasil dihapus'
    });

  } catch (error: any) {
    console.error('[DELETE COURSE ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menghapus kursus' },
      { status: 500 }
    );
  }
}