import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth/session.server';
import { PERM_ADMIN_ACCESS } from '@/lib/auth/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({
      authenticated: false
    });
  }

  const isAdmin = hasPermission(session, PERM_ADMIN_ACCESS);

  return NextResponse.json({
    authenticated: true,
    isAdmin,
    redirect: isAdmin ? '/admin' : '/profile',
    user: {
      uid: session.uid,
      email: session.email,
      displayName: session.displayName,
      roleIds: session.roleIds,
      permissions: session.permissions
    }
  });
}