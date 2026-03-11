import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/kv/upstash.server';
import { getRoles, getUsers, saveRoles, saveUsers, rolePermissions } from '@/lib/auth/store.server';
import { hashPassword } from '@/lib/auth/crypto.server';
import { ROLE_SUPER_ADMIN, PERM_ALL, PERM_ADMIN_ACCESS } from '@/lib/auth/constants';
import { signSession } from '@/lib/auth/token';
import { sessionCookieOptions } from '@/lib/auth/cookies';

export const dynamic = 'force-dynamic';

function bootstrapToken() {
  return (process.env.AICAR_BOOTSTRAP_TOKEN || '').trim();
}

function bootstrapFlagKey() {
  return process.env.AICAR_AUTH_BOOTSTRAP_DONE_KEY || 'aicar:auth:bootstrap_done';
}

function enrichPermissions(roleIds: string[], permissions: string[]) {
  const perms = new Set<string>(permissions || []);
  if (roleIds.includes(ROLE_SUPER_ADMIN)) {
    perms.add(PERM_ALL);
    perms.add(PERM_ADMIN_ACCESS);
  }
  return Array.from(perms);
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
    | { token?: string; email?: string; password?: string; name?: string }
    | null;

  const token = (body?.token || '').trim();
  if (!token || token !== tokenEnv) {
    return NextResponse.json({ error: 'invalid token' }, { status: 401 });
  }

  const email = (body?.email || '').trim().toLowerCase();
  const password = body?.password || '';
  const name = (body?.name || 'Super Admin').trim();

  if (!email || !password) {
    return NextResponse.json({ error: 'email/password required' }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: 'Upstash is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.' },
      { status: 500 }
    );
  }

  const done = await redis.get<string>(bootstrapFlagKey());
  if (done) {
    return NextResponse.json(
      { error: `already initialized (${done})` },
      { status: 409 }
    );
  }

  const roles = await getRoles();
  await saveRoles(roles);

  const users = await getUsers();

  const now = new Date().toISOString();
  const passwordHash = await hashPassword(password);

  const existing = users.find((u) => u.email.toLowerCase() === email);
  const id = existing?.id || (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `u_${Date.now()}`);

  const doc = {
    id,
    email,
    displayName: name,
    passwordHash,
    roleIds: [ROLE_SUPER_ADMIN],
    isActive: true,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };

  const nextUsers = existing ? users.map((u) => (u.id === existing.id ? doc : u)) : [...users, doc];
  await saveUsers(nextUsers);

  await redis.set(bootstrapFlagKey(), now);

  const permissions = enrichPermissions([ROLE_SUPER_ADMIN], await rolePermissions([ROLE_SUPER_ADMIN]));
  const { token: sessionToken } = await signSession(
    {
      uid: doc.id,
      email: doc.email,
      displayName: doc.displayName,
      roleIds: doc.roleIds,
      permissions
    },
    60 * 60 * 24 * 7
  );

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    ...sessionCookieOptions(),
    value: sessionToken,
    maxAge: 60 * 60 * 24 * 7
  });

  return res;
}