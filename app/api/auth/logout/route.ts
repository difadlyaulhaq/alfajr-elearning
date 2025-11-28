// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Logout berhasil' },
      { status: 200 }
    );

    // 🔥 CRITICAL: Gunakan serialize dari 'cookie' package untuk kontrol penuh
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Opsi HARUS identik dengan login, kecuali maxAge/expires
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      expires: new Date(0) // Set ke epoch (1 Jan 1970)
    };

    // Set cookie dengan nilai kosong + expired
    response.cookies.set('auth_token', '', cookieOptions);
    response.cookies.set('user_role', '', cookieOptions);

    // Header tambahan
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    console.log('[LOGOUT] Cookies cleared with options:', cookieOptions);

    return response;

  } catch (error) {
    console.error('[LOGOUT API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal melakukan logout' },
      { status: 500 }
    );
  }
}