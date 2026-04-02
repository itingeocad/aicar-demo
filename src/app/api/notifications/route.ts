import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import {
  clearNotifications,
  listNotifications,
  unreadNotificationsCount
} from '@/lib/notifications/store.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const [notifications, unreadCount] = await Promise.all([
    listNotifications(session.uid),
    unreadNotificationsCount(session.uid)
  ]);

  return NextResponse.json({
    ok: true,
    unreadCount,
    notifications
  });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  await clearNotifications(session.uid);
  return NextResponse.json({ ok: true });
}