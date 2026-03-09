import { NextResponse } from 'next/server';
import { findUserByEmail, rolePermissions, saveUsers, getUsers } from '@/lib/auth/store.server';
import { hashPassword } from '@/lib/auth/crypto.server';
import { signSession } from '@/lib/auth/token';
import { sessionCookieOptions } from '@/lib/auth/cookies';

export const dynamic = 'force-dynamic';

function bootstrapToken() {
  return (process.env.AICAR_BOOTSTRAP_TOKEN || '').trim();
}

export async function POST(req: Request) {
  const tokenEnv = bootstrapToken();
  if (!tokenEnv) {
    return NextResponse.json(
      { error: 'Missing AICAR_BOOTSTRAP_TOKEN in environment' },
      { status: 500 }
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { token?: string; email?: string; password?: string }
    | null;

  const token = (body?.token || '').trim();
  if (!token || token !== tokenEnv) {
    return NextResponse.json({ error: 'invalid token' }, { status: 401 });
  }

  const email = (body?.email || '').trim().toLowerCase();
  const password = body?.password || '';

  if (!email || !password) {
    return NextResponse.json({ error: 'email/password required' }, { status: 400 });
  }

  const users = await getUsers();
  if (!users.length) {
    return NextResponse.json({ error: 'no users exist yet' }, { status: 404 });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: 'user not found' }, { status: 404 });
  }

  const now = new Date().toISOString();
  const passwordHash = await hashPassword(password);
  const nextUsers = users.map((u) =>
    u.id === user.id
      ? {
          ...u,
          passwordHash,
          isActive: true,
          updatedAt: now
        }
      : u
  );

  await saveUsers(nextUsers);

  const permissions = await rolePermissions(user.roleIds);
  const { token: sessionToken } = await signSession(
    {
      uid: user.id,
      email: user.email,
      displayName: user.displayName,
      roleIds: user.roleIds,
      permissions
    },
    60 * 60 * 24 * 7
  );

  const res = NextResponse.json({ ok: true, mode: 'reset-password' });
  res.cookies.set({
    ...sessionCookieOptions(),
    value: sessionToken,
    maxAge: 60 * 60 * 24 * 7
  });

  return res;
}
