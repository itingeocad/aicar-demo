import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import { markNotificationsRead } from '@/lib/notifications/store.server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { ids?: string[] } | null;
  const ids = Array.isArray(body?.ids) ? body!.ids.map(String) : undefined;

  await markNotificationsRead(session.uid, ids);
  return NextResponse.json({ ok: true });
}