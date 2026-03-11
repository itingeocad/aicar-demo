import { NextResponse, type NextRequest } from 'next/server';

/**
 * Temporary demo middleware bypass.
 * Admin/auth flow is unstable on edge, so for now we do not block /admin or /api/admin here.
 * Access control can be restored later after session handling is stabilized.
 */
export async function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};