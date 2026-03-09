import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/kv/upstash.server';
import {
  findUserByEmail,
  getRoles,
  normalizeEmail,
  rolePermissions,
  saveRoles,
  upsertUserUniqueByEmail
} from '@/lib/auth/store.server';
import { hashPassword, verifyPassword } from '@/lib/auth/crypto.server';
import { ROLE_SUPER_ADMIN } from '@/lib/auth/constants';
import { signSession } from '@/lib/auth/token';
import { sessionCookieOptions } from '@/lib/auth/cookies';
import type { UserDoc } from '@/lib/auth/types';

export const dynamic = 'force-dynamic';

function bootstrapToken() {
  return (process.env.AICAR_BOOTSTRAP_TOKEN || '').trim();
}

function bootstrapFlagKey() {
  return process.env.AICAR_AUTH_BOOTSTRAP_DONE_KEY || 'aicar:auth:bootstrap_done';
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

  const email = normalizeEmail(body?.email || '');
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

  const roles = await getRoles();
  await saveRoles(roles);

  const existing = await findUserByEmail(email);
  const now = new Date().toISOString();
  const passwordHash = await hashPassword(password);

  const doc: UserDoc = {
    id: existing?.id || (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `u_${Date.now()}`),
    email,
    displayName: existing?.displayName || name,
    passwordHash,
    roleIds: [ROLE_SUPER_ADMIN],
    isActive: true,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };

  await upsertUserUniqueByEmail(doc);
  await redis.set(bootstrapFlagKey(), now);

  // Read back and verify to ensure the password really became usable for /login.
  const saved = await findUserByEmail(email);
  if (!saved) {
    return NextResponse.json({ error: 'user not persisted after reset' }, { status: 500 });
  }
  const verified = await verifyPassword(password, saved.passwordHash);
  if (!verified) {
    return NextResponse.json({ error: 'password verification failed after reset' }, { status: 500 });
  }

  const permissions = await rolePermissions(saved.roleIds);
  const { token: sessionToken } = await signSession(
    {
      uid: saved.id,
      email: saved.email,
      displayName: saved.displayName,
      roleIds: saved.roleIds,
      permissions
    },
    60 * 60 * 24 * 7
  );

  const res = NextResponse.json({ ok: true, recovered: Boolean(existing), roleIds: saved.roleIds, permissions });
  res.cookies.set({
    ...sessionCookieOptions(),
    value: sessionToken,
    maxAge: 60 * 60 * 24 * 7
  });

  return res;
}
