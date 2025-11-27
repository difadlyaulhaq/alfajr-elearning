import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json(); // 'active' atau 'inactive'
    
    // inactive = disabled di Auth
    const isDisabled = status === 'inactive';

    // 1. Update status di Firebase Auth (Mencegah login)
    await adminAuth.updateUser(id, {
      disabled: isDisabled
    });

    // 2. Update status di Firestore (Untuk UI)
    await adminDb.collection('users').doc(id).update({
      status: status
    });

    return NextResponse.json({ success: true, message: `Status user diubah menjadi ${status}` });
  } catch (error: any) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}