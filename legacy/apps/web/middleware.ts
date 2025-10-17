import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const uid = request.cookies.get('firebase_uid')?.value;
  
  if (!uid && !request.nextUrl.pathname.startsWith('/sign-in')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  
  // Check profile completion for protected routes
  if (uid && !request.nextUrl.pathname.startsWith('/onboarding')) {
    // Verify user has primaryOrgId (server-side check via admin SDK)
    // If not, redirect to /onboarding
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sign-in).*)']
};
