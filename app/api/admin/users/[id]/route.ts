import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

// PATCH: Update data user (Edit)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, password, name, division, role } = body;

    // 1. Update data di Firebase Authentication (jika ada perubahan sensitif)
    const updateAuthParams: any = {};
    if (email) updateAuthParams.email = email;
    if (password && password.trim() !== '') updateAuthParams.password = password;
    if (name) updateAuthParams.displayName = name;

    if (Object.keys(updateAuthParams).length > 0) {
      await adminAuth.updateUser(id, updateAuthParams);
    }

    // 2. Update Custom Claims jika role berubah
    if (role) {
      await adminAuth.setCustomUserClaims(id, { role });
    }

    // 3. Update data di Firestore
    // Kita filter undefined/null values agar tidak menimpa data yang tidak dikirim
    const updateData: any = { ...body };
    // Hapus password dari object updateData karena tidak disimpan di Firestore (hanya di Auth)
    delete updateData.password;
    
    // Hapus id dari body jika ada, agar tidak redundant
    delete updateData.id;

    await adminDb.collection('users').doc(id).update(updateData);

    return NextResponse.json({ success: true, message: 'Data user berhasil diperbarui' });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus user permanen (Opsional, jika Anda butuh fitur delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Hapus dari Auth
    await adminAuth.deleteUser(id);

    // 2. Hapus dari Firestore
    await adminDb.collection('users').doc(id).delete();

    return NextResponse.json({ success: true, message: 'User berhasil dihapus permanen' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}