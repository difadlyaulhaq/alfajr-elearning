// app/api/admin/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// GET: Detail course by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!adminDb) {
      throw new Error('Firebase Admin belum siap');
    }

    const courseDoc = await adminDb.collection('courses').doc(id).get();

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const courseRef = adminDb.collection('courses').doc(id);
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

    // Update title
    if (title) updateData.title = title.trim();

    // Update kategori jika berubah
    if (categoryId && categoryId !== currentData?.categoryId) {
      const categoryDoc = await adminDb.collection('categories').doc(categoryId).get();
      if (!categoryDoc.exists) {
        return NextResponse.json(
          { success: false, error: 'Kategori tidak ditemukan' },
          { status: 404 }
        );
      }
      
      updateData.categoryId = categoryId;
      updateData.categoryName = categoryDoc.data()?.name;

      // Update courseCount di kategori lama dan baru
      if (currentData?.categoryId) {
        const oldCategoryDoc = await adminDb.collection('categories').doc(currentData.categoryId).get();
        if (oldCategoryDoc.exists) {
          await adminDb.collection('categories').doc(currentData.categoryId).update({
            courseCount: Math.max((oldCategoryDoc.data()?.courseCount || 1) - 1, 0)
          });
        }
      }
      
      await adminDb.collection('categories').doc(categoryId).update({
        courseCount: (categoryDoc.data()?.courseCount || 0) + 1
      });
    }

    if (description !== undefined) updateData.description = description;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (status) updateData.status = status;

    // Update sections dan hitung ulang totalVideos
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!adminDb) {
      throw new Error('Firebase Admin belum siap');
    }

    const courseRef = adminDb.collection('courses').doc(id);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Kursus tidak ditemukan' },
        { status: 404 }
      );
    }

    const courseData = courseDoc.data();

    // Cek apakah ada student yang sedang mengikuti
    const enrollments = await adminDb
      .collection('enrollments')
      .where('courseId', '==', id)
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

    // Update courseCount di kategori
    if (courseData?.categoryId) {
      const categoryDoc = await adminDb.collection('categories').doc(courseData.categoryId).get();
      if (categoryDoc.exists) {
        await adminDb.collection('categories').doc(courseData.categoryId).update({
          courseCount: Math.max((categoryDoc.data()?.courseCount || 1) - 1, 0),
          updatedAt: new Date().toISOString()
        });
      }
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