import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// GET: Mengambil satu data kursus
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    if (!adminDb) {
      throw new Error('Firebase Admin belum siap');
    }

    const courseRef = adminDb.collection('courses').doc(courseId);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Kursus tidak ditemukan' },
        { status: 404 }
      );
    }

    const courseData = { id: courseDoc.id, ...courseDoc.data() };
    return NextResponse.json({ success: true, data: courseData });

  } catch (error: any) {
    console.error('[GET COURSE ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengambil data kursus' },
      { status: 500 }
    );
  }
}


// PATCH: Memperbarui kursus
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const body = await request.json();

    if (!adminDb) {
      throw new Error('Firebase Admin belum siap');
    }

    const courseRef = adminDb.collection('courses').doc(courseId);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Kursus tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Ambil categoryName berdasarkan categoryId jika berubah
    let categoryName = body.categoryName;
    if (body.categoryId && body.categoryId !== courseDoc.data()?.categoryId) {
        const categoryDoc = await adminDb.collection('categories').doc(body.categoryId).get();
        if (categoryDoc.exists) {
            categoryName = categoryDoc.data()?.name;
        }
    }
    
    // Hitung total video
    const totalVideos = body.sections?.reduce((acc: number, section: any) => acc + (section.lessons?.length || 0), 0) || 0;

    const updateData = {
      ...body,
      categoryName,
      totalVideos,
      updatedAt: new Date().toISOString(),
    };
    
    await courseRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Kursus berhasil diperbarui'
    });

  } catch (error: any) {
    console.error('[PATCH COURSE ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memperbarui kursus' },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus kursus
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    if (!adminDb) {
      throw new Error('Firebase Admin belum siap');
    }

    const courseRef = adminDb.collection('courses').doc(courseId);
    const doc = await courseRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Kursus tidak ditemukan' },
        { status: 404 }
      );
    }

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
