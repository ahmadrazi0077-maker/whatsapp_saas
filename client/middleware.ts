import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public paths
  const isAuthPage = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register');
  const isPublicPath = pathname === '/' || pathname === '/_next' || pathname.startsWith('/api');
  
  // Protected paths
  const isDashboardPath = pathname.startsWith('/dashboard');

  // Redirect logic
  if (!token && isDashboardPath) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
