import { NextResponse } from 'next/server';
import { getUsers, saveUsers, findUserByEmail, normalizeEmail } from '@/lib/auth/store.server';
import { hashPassword } from '@/lib/auth/crypto.server';
import { ROLE_USER } from '@/lib/auth/constants';
import type { UserDoc } from '@/lib/auth/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    email?: string;
    password?: string;
    displayName?: string;
  } | null;

  const email = normalizeEmail(body?.email || '');
  const password = String(body?.password || '');
  const displayName = String(body?.displayName || '').trim() || email;

  if (!email || !password) {
    return NextResponse.json({ error: 'email/password required' }, { status: 400 });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: 'user exists' }, { status: 409 });
  }

  const users = await getUsers();
  const now = new Date().toISOString();

  const user: UserDoc = {
    id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `u_${Date.now()}`,
    email,
    displayName,
    passwordHash: await hashPassword(password),
    roleIds: [ROLE_USER],
    isActive: true,
    createdAt: now,
    updatedAt: now
  };

  await saveUsers([...users, user]);

  return NextResponse.json({
    ok: true,
    created: true
  });
}