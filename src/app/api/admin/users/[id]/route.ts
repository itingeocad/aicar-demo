import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth/session.server';
import { getUsers, saveUsers } from '@/lib/auth/store.server';
import { hashPassword } from '@/lib/auth/crypto.server';
import { ROLE_SUPER_ADMIN, ROLE_USER } from '@/lib/auth/constants';
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
  const nextRolesRaw = Array.isArray(body?.roleIds) ? body!.roleIds.map(String) : prev.roleIds;
  const nextRoles = Array.from(new Set(nextRolesRaw.length > 0 ? nextRolesRaw : [ROLE_USER]));

  const next: UserDoc = {
    ...prev,
    displayName: body?.displayName ? String(body.displayName).trim() : prev.displayName,
    roleIds: nextRoles,
    isActive: typeof body?.isActive === 'boolean' ? body.isActive : prev.isActive,
    updatedAt: now
  };

  if (body?.password) {
    const pw = String(body.password).trim();
    if (pw.length < 6) {
      return NextResponse.json({ error: 'password too short' }, { status: 400 });
    }
    next.passwordHash = await hashPassword(pw);
  }

  const selfEdit = session?.uid === prev.id;
  const removesOwnSuperAdmin = selfEdit && prev.roleIds.includes(ROLE_SUPER_ADMIN) && !next.roleIds.includes(ROLE_SUPER_ADMIN);
  const disablesSelf = selfEdit && next.isActive === false;

  if (removesOwnSuperAdmin || disablesSelf) {
    return NextResponse.json({ error: 'cannot lock your own admin account' }, { status: 400 });
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
  if (session?.uid === id) {
    return NextResponse.json({ error: 'cannot delete current user' }, { status: 400 });
  }

  const users = await getUsers();
  const next = users.filter((u) => u.id !== id);
  if (next.length === users.length) return NextResponse.json({ error: 'not found' }, { status: 404 });

  await saveUsers(next);
  return NextResponse.json({ ok: true });
}