import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth/session.server';
import { getUsers, saveUsers } from '@/lib/auth/store.server';
import { hashPassword } from '@/lib/auth/crypto.server';
import type { UserDoc } from '@/lib/auth/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!hasPermission(session, 'users:manage')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const users = await getUsers();
  // never return password hash to client
  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      roleIds: u.roleIds,
      isActive: u.isActive,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }))
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!hasPermission(session, 'users:manage')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as {
    email?: string;
    displayName?: string;
    password?: string;
    roleIds?: string[];
    isActive?: boolean;
  } | null;

  const email = String(body?.email || '').trim().toLowerCase();
  const displayName = String(body?.displayName || '').trim() || email;
  const password = String(body?.password || '').trim();
  const roleIds = Array.isArray(body?.roleIds) ? body!.roleIds.map(String) : [];
  const isActive = body?.isActive !== false;

  if (!email || !password) {
    return NextResponse.json({ error: 'email/password required' }, { status: 400 });
  }

  const users = await getUsers();
  if (users.some((u) => u.email.toLowerCase() === email)) {
    return NextResponse.json({ error: 'user exists' }, { status: 409 });
  }

  const now = new Date().toISOString();
  const u: UserDoc = {
    id: crypto.randomUUID(),
    email,
    displayName,
    passwordHash: await hashPassword(password),
    roleIds,
    isActive,
    createdAt: now,
    updatedAt: now
  };

  await saveUsers([...users, u]);

  return NextResponse.json({ ok: true, user: { id: u.id, email: u.email, displayName: u.displayName, roleIds: u.roleIds, isActive: u.isActive } });
}
