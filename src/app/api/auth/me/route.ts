import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      uid: session.uid,
      email: session.email,
      displayName: session.displayName,
      roleIds: session.roleIds,
      permissions: session.permissions
    }
  });
}
