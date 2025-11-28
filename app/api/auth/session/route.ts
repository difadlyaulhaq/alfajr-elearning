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

    // ⚠️ CRITICAL: These settings MUST be EXACTLY the same in logout route
    const isProduction = process.env.NODE_ENV === 'production';
    
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // false in development
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    };

    response.cookies.set('auth_token', token, cookieOptions);
    response.cookies.set('user_role', 'admin', cookieOptions);

    console.log('[SESSION] Cookies set successfully');
    console.log('[SESSION] Environment:', process.env.NODE_ENV);
    console.log('[SESSION] Cookie options:', cookieOptions);

    return response;

  } catch (error) {
    console.error('[SESSION] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}