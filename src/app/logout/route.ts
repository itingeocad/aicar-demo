import { NextResponse } from 'next/server';
import { sessionCookieOptions } from '@/lib/auth/cookies';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get('next') || '/';
  const res = NextResponse.redirect(new URL(next, url.origin));
  res.cookies.set({
    ...sessionCookieOptions(),
    value: '',
    maxAge: 0
  });
  return res;
}
