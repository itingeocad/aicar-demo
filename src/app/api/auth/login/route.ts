import { NextResponse } from 'next/server';
import { findUserByEmail, rolePermissions } from '@/lib/auth/store.server';
import { verifyPassword } from '@/lib/auth/crypto.server';
import { signSession } from '@/lib/auth/token';
import { sessionCookieOptions } from '@/lib/auth/cookies';
import { PERM_ADMIN_ACCESS, PERM_ALL, ROLE_SUPER_ADMIN } from '@/lib/auth/constants';

export const dynamic = 'force-dynamic';

function enrichPermissions(roleIds: string[], permissions: string[]) {
  const perms = new Set<string>(permissions || []);
  if (roleIds.includes(ROLE_SUPER_ADMIN)) {
    perms.add(PERM_ALL);
    perms.add(PERM_ADMIN_ACCESS);
  }
  return Array.from(perms);
}

function safeNext(next: string, isAdmin: boolean) {
  const value = (next || '').trim();
  if (!value.startsWith('/')) return isAdmin ? '/admin' : '/profile';
  if (value.startsWith('//')) return isAdmin ? '/admin' : '/profile';
  if (!isAdmin && value.startsWith('/admin')) return '/profile';
  return value || (isAdmin ? '/admin' : '/profile');
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    email?: string;
    password?: string;
    next?: string;
  } | null;

  const email = (body?.email || '').trim().toLowerCase();
  const password = body?.password || '';
  const next = body?.next || '';

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

  const permissions = enrichPermissions(user.roleIds, await rolePermissions(user.roleIds));
  const isAdmin = permissions.includes(PERM_ALL) || permissions.includes(PERM_ADMIN_ACCESS);
  const redirect = safeNext(next, isAdmin);

  const payloadBase = {
    uid: user.id,
    email: user.email,
    displayName: user.displayName,
    roleIds: user.roleIds,
    permissions
  };

  const { token, payload } = await signSession(payloadBase, 60 * 60 * 24 * 7);

  const res = NextResponse.json({
    ok: true,
    redirect,
    isAdmin,
    user: {
      email: payload.email,
      displayName: payload.displayName,
      roleIds: payload.roleIds,
      permissions: payload.permissions
    }
  });

  res.cookies.set({
    ...sessionCookieOptions(),
    value: token,
    maxAge: 60 * 60 * 24 * 7
  });

  return res;
}