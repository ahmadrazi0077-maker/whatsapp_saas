import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register');
  
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isPublicRoute = request.nextUrl.pathname === '/' || 
                        request.nextUrl.pathname === '/pricing' ||
                        request.nextUrl.pathname === '/about';

  // Redirect logic
  if (!token && !isAuthPage && !isPublicRoute && !isApiRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Add region detection header
  const response = NextResponse.next();
  response.headers.set('x-region', request.geo?.country || 'PK');
  response.headers.set('x-timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};