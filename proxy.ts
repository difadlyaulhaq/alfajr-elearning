// proxy.ts (ROOT PROJECT) - Renamed from middleware.ts
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
];

// Routes that are only accessible when NOT authenticated
const GUEST_ONLY_ROUTES = [
  '/login',
  '/forgot-password',
];

// Admin routes prefix
const ADMIN_ROUTES = '/admin';
const EMPLOYEE_ROUTES = '/learning';

// ✅ RENAMED: middleware → proxy
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ============================================
  // 0. BYPASS PROXY FOR API ROUTES (CRITICAL!)
  // ============================================
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    console.log('[PROXY] Bypassing:', pathname);
    return NextResponse.next();
  }
  
  // Get authentication cookies
  const authToken = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  
  console.log('[PROXY] Path:', pathname, 'Auth:', !!authToken, 'Role:', userRole);
  
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isGuestOnlyRoute = GUEST_ONLY_ROUTES.includes(pathname);
  const isAdminRoute = pathname.startsWith(ADMIN_ROUTES);
  const isEmployeeRoute = pathname.startsWith(EMPLOYEE_ROUTES);

  // ============================================
  // 1. HANDLE PUBLIC ROUTES
  // ============================================
  if (isPublicRoute) {
    if (isGuestOnlyRoute && authToken) {
      return redirectBasedOnRole(userRole, request.url);
    }
    return NextResponse.next();
  }

  // ============================================
  // 2. CHECK AUTHENTICATION
  // ============================================
  if (!authToken) {
    return redirectToLogin(request.url, pathname);
  }

  // ============================================
  // 3. ROLE-BASED ACCESS CONTROL
  // ============================================
  if (isAdminRoute) {
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/learning/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (isEmployeeRoute) {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ============================================
  // 4. ROOT PATH REDIRECT
  // ============================================
  if (pathname === '/') {
    return redirectBasedOnRole(userRole, request.url);
  }

  return NextResponse.next();
}

function redirectToLogin(originalUrl: string, currentPath: string) {
  const loginUrl = new URL('/login', originalUrl);
  if (!currentPath.startsWith('/api/')) {
    loginUrl.searchParams.set('redirect', currentPath);
  }
  console.log('[PROXY] Redirecting to login');
  return NextResponse.redirect(loginUrl);
}

function redirectBasedOnRole(role: string | undefined, originalUrl: string) {
  if (role === 'admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', originalUrl));
  } else {
    return NextResponse.redirect(new URL('/learning/dashboard', originalUrl));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};