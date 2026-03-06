import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth/session.server';
import { getUsers, saveUsers } from '@/lib/auth/store.server';
import { hashPassword } from '@/lib/auth/crypto.server';
import type { UserDoc } from '@/lib/auth/types';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!hasPermission(session, 'users:manage')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const id = params.id;
  const body = (await req.json().catch(() => null)) as {
    displayName?: string;
    password?: string;
    roleIds?: string[];
    isActive?: boolean;
  } | null;

  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const now = new Date().toISOString();
  const prev = users[idx];

  const next: UserDoc = {
    ...prev,
    displayName: body?.displayName ? String(body.displayName).trim() : prev.displayName,
    roleIds: Array.isArray(body?.roleIds) ? body!.roleIds.map(String) : prev.roleIds,
    isActive: typeof body?.isActive === 'boolean' ? body.isActive : prev.isActive,
    updatedAt: now
  };

  if (body?.password) {
    const pw = String(body.password).trim();
    if (pw.length < 6) return NextResponse.json({ error: 'password too short' }, { status: 400 });
    next.passwordHash = await hashPassword(pw);
  }

  const copy = [...users];
  copy[idx] = next;
  await saveUsers(copy);

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!hasPermission(session, 'users:manage')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const id = params.id;
  const users = await getUsers();
  const next = users.filter((u) => u.id !== id);
  if (next.length === users.length) return NextResponse.json({ error: 'not found' }, { status: 404 });

  await saveUsers(next);
  return NextResponse.json({ ok: true });
}
