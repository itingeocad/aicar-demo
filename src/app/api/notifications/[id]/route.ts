import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import { deleteNotification } from '@/lib/notifications/store.server';

export const dynamic = 'force-dynamic';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const ok = await deleteNotification(session.uid, params.id);
  if (!ok) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}