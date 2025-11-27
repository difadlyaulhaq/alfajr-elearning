// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login', 
  '/forgot-password',
  '/api/auth/session', // Login API
  '/api/auth/logout',  // Logout API
  '/api/auth/check',   // Auth check API
];

// Routes that are only accessible when NOT authenticated
const GUEST_ONLY_ROUTES = [
  '/login',
  '/forgot-password',
];

// Admin routes prefix
const ADMIN_ROUTES = '/admin';
const EMPLOYEE_ROUTES = '/learning';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get authentication cookies
  const authToken = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route)
  );
  const isGuestOnlyRoute = GUEST_ONLY_ROUTES.includes(pathname);
  const isAdminRoute = pathname.startsWith(ADMIN_ROUTES);
  const isEmployeeRoute = pathname.startsWith(EMPLOYEE_ROUTES);

  // ============================================
  // 1. ALLOW PUBLIC API ROUTES
  // ============================================
  if (isPublicRoute) {
    // For guest-only routes (login, forgot-password), redirect if already authenticated
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

/**
 * Redirect user to login page with return URL
 */
function redirectToLogin(originalUrl: string, currentPath: string) {
  const loginUrl = new URL('/login', originalUrl);
  // Only set redirect for non-API routes
  if (!currentPath.startsWith('/api/')) {
    loginUrl.searchParams.set('redirect', currentPath);
  }
  return NextResponse.redirect(loginUrl);
}

/**
 * Redirect user based on their role
 */
function redirectBasedOnRole(role: string | undefined, originalUrl: string) {
  if (role === 'admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', originalUrl));
  } else {
    return NextResponse.redirect(new URL('/learning/dashboard', originalUrl));
  }
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (auth APIs are handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};