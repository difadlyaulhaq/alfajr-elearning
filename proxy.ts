// proxy.ts (ROOT PROJECT) - Updated middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login', 
  '/forgot-password',
];

// API routes that should bypass proxy completely
const PUBLIC_API_ROUTES = [
  '/api/auth/session',
  '/api/auth/logout',
  '/api/auth/check',
  '/api/admin',
];

// Routes that are only accessible when NOT authenticated
const GUEST_ONLY_ROUTES = [
  '/login',
  '/forgot-password',
];

// Admin routes prefix
const ADMIN_ROUTES = '/admin';
const EMPLOYEE_ROUTES = '/learning';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('[PROXY] Processing:', pathname);
  
  // ============================================
  // 0. BYPASS PROXY FOR API ROUTES (CRITICAL!)
  // ============================================
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    console.log('[PROXY] ✅ Bypassing API route:', pathname);
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }
  
  // Get authentication cookies
  const authToken = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  
  console.log('[PROXY] Auth Status - Token:', !!authToken, 'Role:', userRole);
  
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isGuestOnlyRoute = GUEST_ONLY_ROUTES.includes(pathname);
  const isAdminRoute = pathname.startsWith(ADMIN_ROUTES);
  const isEmployeeRoute = pathname.startsWith(EMPLOYEE_ROUTES);

  // ============================================
  // 1. HANDLE PUBLIC ROUTES
  // ============================================
  if (isPublicRoute) {
    if (isGuestOnlyRoute && authToken) {
      console.log('[PROXY] Guest-only route but authenticated, redirecting based on role');
      return redirectBasedOnRole(userRole, request.url);
    }
    console.log('[PROXY] ✅ Allowing public route');
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  // ============================================
  // 2. CHECK AUTHENTICATION
  // ============================================
  if (!authToken) {
    console.log('[PROXY] ❌ No auth token, redirecting to login');
    return redirectToLogin(request.url, pathname);
  }

  // ============================================
  // 3. ROLE-BASED ACCESS CONTROL
  // ============================================
  if (isAdminRoute) {
    if (userRole !== 'admin') {
      console.log('[PROXY] ❌ Not admin, redirecting to employee dashboard');
      return NextResponse.redirect(new URL('/learning/dashboard', request.url));
    }
    console.log('[PROXY] ✅ Admin access granted');
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  /* 
    NONAKTIFKAN SEMENTARA: Logika ini mengalihkan admin secara paksa dari halaman pegawai.
    Dinonaktifkan agar admin bisa memilih untuk melihat panel pegawai.
  if (isEmployeeRoute) {
    if (userRole === 'admin') {
      console.log('[PROXY] Admin accessing employee route, redirecting to admin dashboard');
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    console.log('[PROXY] ✅ Employee access granted');
    return NextResponse.next();
  }
  */

  // ============================================
  // 4. ROOT PATH REDIRECT
  // ============================================
  if (pathname === '/') {
    console.log('[PROXY] Root path, redirecting based on role');
    return redirectBasedOnRole(userRole, request.url);
  }

  console.log('[PROXY] ✅ Default allow');
  const response = NextResponse.next();
  addSecurityHeaders(response);
  return response;
}

// Add security headers for screenshot/screen recording protection
function addSecurityHeaders(response: NextResponse) {
  // Prevent embedding in iframes from other domains
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self'; upgrade-insecure-requests;"
  );
  
  // Permissions Policy (experimental - untuk block screen capture di beberapa browser)
  response.headers.set(
    'Permissions-Policy',
    'screen-wake-lock=(), display-capture=()'
  );
  
  return response;
}

function redirectToLogin(originalUrl: string, currentPath: string) {
  const loginUrl = new URL('/login', originalUrl);
  if (!currentPath.startsWith('/api/')) {
    loginUrl.searchParams.set('redirect', currentPath);
  }
  console.log('[PROXY] Redirecting to:', loginUrl.toString());
  return NextResponse.redirect(loginUrl);
}

function redirectBasedOnRole(role: string | undefined, originalUrl: string) {
  const redirectUrl = role === 'admin' 
    ? new URL('/admin/dashboard', originalUrl)
    : new URL('/learning/dashboard', originalUrl);
  
  console.log('[PROXY] Role-based redirect to:', redirectUrl.toString());
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
