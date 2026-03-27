import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth/session.server';
import { ROLE_SUPER_ADMIN } from '@/lib/auth/constants';
import { getCommentsSettings, updateCommentsSettings } from '@/lib/comments/store.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!hasRole(session, ROLE_SUPER_ADMIN)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const settings = await getCommentsSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!hasRole(session, ROLE_SUPER_ADMIN)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as {
    clipsEnabled?: boolean;
    listingsEnabled?: boolean;
  } | null;

  const settings = await updateCommentsSettings({
    clipsEnabled: typeof body?.clipsEnabled === 'boolean' ? body.clipsEnabled : undefined,
    listingsEnabled: typeof body?.listingsEnabled === 'boolean' ? body.listingsEnabled : undefined
  });

  return NextResponse.json({ ok: true, settings });
}