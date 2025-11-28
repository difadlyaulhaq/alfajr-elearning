// app/api/admin/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// PATCH: Update kategori
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, icon, color, status } = body;

    if (!adminDb) {
      throw new Error('Firebase Admin belum siap');
    }

    // Cek apakah kategori ada
    const categoryRef = adminDb.collection('categories').doc(id);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cek duplikat nama (jika nama diubah)
    if (name && name !== categoryDoc.data()?.name) {
      const duplicateCheck = await adminDb
        .collection('categories')
        .where('name', '==', name)
        .get();

      if (!duplicateCheck.empty) {
        return NextResponse.json(
          { success: false, error: 'Nama kategori sudah digunakan' },
          { status: 409 }
        );
      }
    }

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (icon) updateData.icon = icon;
    if (color) updateData.color = color;
    if (status) updateData.status = status;

    await categoryRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil diperbarui'
    });

  } catch (error: any) {
    console.error('[PATCH CATEGORY ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengupdate kategori' },
      { status: 500 }
    );
  }
}

// DELETE: Hapus kategori
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!adminDb) {
      throw new Error('Firebase Admin belum siap');
    }

    const categoryRef = adminDb.collection('categories').doc(id);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cek apakah ada kursus yang menggunakan kategori ini
    const coursesWithCategory = await adminDb
      .collection('courses')
      .where('categoryId', '==', id)
      .get();

    if (!coursesWithCategory.empty) {
      return NextResponse.json(
        {
          success: false,
          error: `Kategori tidak bisa dihapus karena masih digunakan oleh ${coursesWithCategory.size} kursus`
        },
        { status: 400 }
      );
    }

    await categoryRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil dihapus'
    });

  } catch (error: any) {
    console.error('[DELETE CATEGORY ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menghapus kategori' },
      { status: 500 }
    );
  }
}