import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'aicar_session';

function hasSessionCookie(req: NextRequest) {
  return Boolean(req.cookies.get(SESSION_COOKIE)?.value);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (!hasSessionCookie(req)) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/admin')) {
    if (!hasSessionCookie(req)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};