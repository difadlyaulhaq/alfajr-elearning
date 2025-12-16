// app/api/security/log/route.ts
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, page, details } = body;

    // Log security event ke Firestore
    await adminDb.collection('security_logs').add({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action, // 'screenshot_attempt', 'recording_detected', dll
      page,
      details,
      timestamp: new Date(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
    });

    // Optional: Send notification ke admin jika attempt > threshold
    // Simplified query - no composite index needed
    const recentAttempts = await adminDb
      .collection('security_logs')
      .where('userId', '==', user.id)
      .where('timestamp', '>', new Date(Date.now() - 3600000)) // Last 1 hour
      .get();

    // Filter by action in memory instead of query
    const screenshotAttempts = recentAttempts.docs.filter(
      doc => doc.data().action === 'screenshot_attempt'
    );

    if (screenshotAttempts.length > 5) {
      // Send alert ke admin (implement your notification logic)
      console.warn(`User ${user.email} has ${screenshotAttempts.length} screenshot attempts in last hour`);
    }

    return NextResponse.json({
      success: true,
      message: 'Security event logged',
    });
  } catch (error) {
    console.error('Error logging security event:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint untuk admin melihat security logs
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = adminDb.collection('security_logs').orderBy('timestamp', 'desc');

    if (userId) {
      query = query.where('userId', '==', userId) as any;
    }

    if (action) {
      query = query.where('action', '==', action) as any;
    }

    const snapshot = await query.limit(limit).get();

    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: logs,
      total: snapshot.size,
    });
  } catch (error) {
    console.error('Error fetching security logs:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
