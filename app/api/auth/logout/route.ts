// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export async function POST() {
  try {
    // Sign out dari Firebase
    if (auth.currentUser) {
      await signOut(auth);
    }
    
    // Create response
    const response = NextResponse.json({ 
      success: true,
      message: 'Logout berhasil'
    });

    // Clear auth cookies dengan cara yang lebih aggressive
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Immediately expire
      path: '/'
    });

    response.cookies.set('user_role', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Immediately expire
      path: '/'
    });

    console.log('Cookies cleared successfully');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    
    // Tetap clear cookies meski ada error Firebase
    const response = NextResponse.json(
      { success: true, message: 'Logout completed with warnings' },
      { status: 200 }
    );
    
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    response.cookies.set('user_role', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    
    return response;
  }
}

export async function GET() {
  return POST();
}