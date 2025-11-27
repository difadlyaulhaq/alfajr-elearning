// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      );
    }

    // Create response
    const response = NextResponse.json({ 
      success: true,
      message: 'Login berhasil'
    });

    // CRITICAL: Set cookies dengan config yang konsisten
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/', // PENTING: Path harus /
      maxAge: 60 * 60 * 24 * 7 // 7 days
    };

    response.cookies.set('auth_token', token, cookieOptions);
    response.cookies.set('user_role', 'admin', cookieOptions); // For demo

    console.log('[SESSION] Cookies set successfully');

    return response;

  } catch (error) {
    console.error('[SESSION] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}