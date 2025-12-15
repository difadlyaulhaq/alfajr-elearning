// app/api/progress/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// GET: Ambil semua progress user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!adminDb) {
      throw new Error('Firebase Admin belum siap');
    }

    const progressSnapshot = await adminDb
      .collection('progress')
      .where('userId', '==', userId)
      .get();

    const progressData = progressSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, data: progressData });
  } catch (error: any) {
    console.error('[GET PROGRESS ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
