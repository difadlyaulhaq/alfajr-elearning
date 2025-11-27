// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  console.log('[LOGOUT API] 🚀 Starting logout process...');
  
  try {
    const response = NextResponse.json(
      { success: true, message: 'Logout berhasil' },
      { status: 200 }
    );

    // ⚠️ CRITICAL FIX: Secure MUST be false in development!
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log('[LOGOUT API] Environment:', process.env.NODE_ENV);
    console.log('[LOGOUT API] isProduction:', isProduction);

    // Cookie options MUST be IDENTICAL to session/route.ts
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // ← FALSE in development (localhost)
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0 // Delete immediately
    };

    console.log('[LOGOUT API] Cookie options:', cookieOptions);

    // Delete both cookies
    response.cookies.set('auth_token', '', cookieOptions);
    response.cookies.set('user_role', '', cookieOptions);

    // ALTERNATIVE: Use delete method (more explicit)
    response.cookies.delete({
      name: 'auth_token',
      path: '/',
    });
    
    response.cookies.delete({
      name: 'user_role',
      path: '/',
    });

    console.log('[LOGOUT API] ✅ Cookies deleted successfully');

    return response;

  } catch (error) {
    console.error('[LOGOUT API] ❌ Error:', error);
    
    // Force clear cookies even on error
    const response = NextResponse.json(
      { success: true, message: 'Logout completed' },
      { status: 200 }
    );
    
    response.cookies.delete({ name: 'auth_token', path: '/' });
    response.cookies.delete({ name: 'user_role', path: '/' });
    
    return response;
  }
}

export async function GET() {
  return POST();
}