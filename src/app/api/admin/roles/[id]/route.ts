import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth/session.server';
import { getRoles, saveRoles } from '@/lib/auth/store.server';
import { ROLE_SUPER_ADMIN } from '@/lib/auth/constants';
import type { RoleDoc } from '@/lib/auth/types';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!hasPermission(session, 'roles:manage')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const id = params.id;
  if (id === ROLE_SUPER_ADMIN) {
    return NextResponse.json({ error: 'cannot modify system role' }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as Partial<RoleDoc> | null;
  const name = String(body?.name || '').trim();
  const description = String(body?.description || '').trim();
  const permissions = Array.isArray(body?.permissions) ? body!.permissions.map(String) : [];

  const roles = await getRoles();
  const idx = roles.findIndex((r) => r.id === id);
  if (idx < 0) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const updated: RoleDoc = {
    ...roles[idx],
    name: name || roles[idx].name,
    description: description || undefined,
    permissions,
    isSystem: roles[idx].isSystem
  };

  const next = [...roles];
  next[idx] = updated;
  await saveRoles(next);

  return NextResponse.json({ ok: true, role: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!hasPermission(session, 'roles:manage')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const id = params.id;
  if (id === ROLE_SUPER_ADMIN) {
    return NextResponse.json({ error: 'cannot delete system role' }, { status: 400 });
  }

  const roles = await getRoles();
  const next = roles.filter((r) => r.id !== id);
  if (next.length === roles.length) return NextResponse.json({ error: 'not found' }, { status: 404 });

  await saveRoles(next);
  return NextResponse.json({ ok: true });
}
