// app/api/progress/course/[courseId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// GET: Ambil progress user untuk course tertentu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId required' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      throw new Error('Firebase Admin belum siap');
    }

    const progressDoc = await adminDb
      .collection('progress')
      .doc(`${userId}_${courseId}`)
      .get();

    if (!progressDoc.exists) {
      return NextResponse.json({
        success: true,
        data: {
          progress: 0,
          status: 'not-started',
          completedLessons: []
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: progressDoc.data()
    });
  } catch (error: any) {
    console.error('[GET COURSE PROGRESS ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
