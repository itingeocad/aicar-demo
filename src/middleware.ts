import { NextResponse, type NextRequest } from 'next/server';
import { getSessionFromRequest, hasPermissionEdge } from '@/lib/auth/session.edge';
import { PERM_ADMIN_ACCESS } from '@/lib/auth/constants';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin UI
  if (pathname.startsWith('/admin')) {
    const session = await getSessionFromRequest(req);
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    if (!hasPermissionEdge(session, PERM_ADMIN_ACCESS)) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', '/');
      url.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Protect admin APIs
  if (pathname.startsWith('/api/admin')) {
    const session = await getSessionFromRequest(req);
    if (!session || !hasPermissionEdge(session, PERM_ADMIN_ACCESS)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};
