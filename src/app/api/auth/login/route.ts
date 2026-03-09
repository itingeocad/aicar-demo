import { NextResponse } from 'next/server';
import { findUserByEmail, rolePermissions } from '@/lib/auth/store.server';
import { verifyPassword } from '@/lib/auth/crypto.server';
import { signSession } from '@/lib/auth/token';
import { sessionCookieOptions } from '@/lib/auth/cookies';
import { PERM_ADMIN_ACCESS, PERM_ALL, ROLE_SUPER_ADMIN } from '@/lib/auth/constants';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = (body?.email || '').trim().toLowerCase();
  const password = body?.password || '';

  if (!email || !password) {
    return NextResponse.json({ error: 'email/password required' }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });
  }

  const permissions = await rolePermissions(user.roleIds);
  const effectivePermissions = new Set(permissions);

  // Safety net for legacy data in Redis.
  if (user.roleIds.includes(ROLE_SUPER_ADMIN)) {
    effectivePermissions.add(PERM_ALL);
    effectivePermissions.add(PERM_ADMIN_ACCESS);
    effectivePermissions.add('site:write');
  }

  const payloadBase = {
    uid: user.id,
    email: user.email,
    displayName: user.displayName,
    roleIds: user.roleIds,
    permissions: Array.from(effectivePermissions)
  };

  const { token, payload } = await signSession(payloadBase, 60 * 60 * 24 * 7);

  const res = NextResponse.json({
    ok: true,
    user: {
      email: payload.email,
      displayName: payload.displayName,
      permissions: payload.permissions,
      roleIds: payload.roleIds
    }
  });
  res.cookies.set({
    ...sessionCookieOptions(),
    value: token,
    maxAge: 60 * 60 * 24 * 7
  });

  return res;
}
