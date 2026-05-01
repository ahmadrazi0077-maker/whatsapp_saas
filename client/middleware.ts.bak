import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get token from cookies or headers
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const isAuthPage = pathname.startsWith('/auth/login') || 
                     pathname.startsWith('/auth/register');
  const isPublicPath = pathname === '/' || 
                       pathname === '/api/auth/login' || 
                       pathname === '/api/auth/register';
  const isApiPath = pathname.startsWith('/api');
  
  // Protected paths that require authentication
  const isProtectedPath = pathname.startsWith('/dashboard');

  // Allow API routes to pass through (they handle their own auth)
  if (isApiPath) {
    return NextResponse.next();
  }

  // Redirect logic
  if (!token && isProtectedPath) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthPage) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
