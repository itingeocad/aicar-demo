import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth/session.server';
import { getRoles, saveRoles } from '@/lib/auth/store.server';
import { ROLE_SUPER_ADMIN } from '@/lib/auth/constants';
import type { RoleDoc } from '@/lib/auth/types';

export const dynamic = 'force-dynamic';

function isValidRoleId(id: string) {
  return /^[a-z0-9_]+$/.test(id);
}

export async function GET() {
  const session = await getSession();
  if (!hasPermission(session, 'roles:manage')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const roles = await getRoles();
  return NextResponse.json({ roles });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!hasPermission(session, 'roles:manage')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as Partial<RoleDoc> | null;
  const id = String(body?.id || '').trim();
  const name = String(body?.name || '').trim();
  const description = String(body?.description || '').trim();
  const permissions = Array.isArray(body?.permissions) ? body!.permissions.map(String) : [];

  if (!id || !name || !isValidRoleId(id)) {
    return NextResponse.json({ error: 'invalid role id or name' }, { status: 400 });
  }
  if (id === ROLE_SUPER_ADMIN) {
    return NextResponse.json({ error: 'reserved role id' }, { status: 400 });
  }

  const roles = await getRoles();
  if (roles.some((r) => r.id === id)) {
    return NextResponse.json({ error: 'role already exists' }, { status: 409 });
  }

  const next: RoleDoc = {
    id,
    name,
    description: description || undefined,
    permissions,
    isSystem: false
  };

  await saveRoles([...roles, next]);
  return NextResponse.json({ ok: true, role: next });
}
