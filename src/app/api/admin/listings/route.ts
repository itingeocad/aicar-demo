import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth/session.server';
import { ROLE_SUPER_ADMIN } from '@/lib/auth/constants';
import { listAllListings } from '@/lib/listings/admin.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!hasRole(session, ROLE_SUPER_ADMIN)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const listings = await listAllListings();
  return NextResponse.json({ ok: true, listings });
}