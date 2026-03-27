import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import { listNotifications, unreadNotificationsCount } from '@/lib/notifications/store.server';

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