import { NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/lib/auth/store.server';
import { hashPassword } from '@/lib/auth/crypto.server';
import { ROLE_SUPER_ADMIN } from '@/lib/auth/constants';

export const dynamic = 'force-dynamic';

function requiredToken() {
  // Prefer explicit repair token if you want separate rotation; fall back to bootstrap token.
  return (process.env.AICAR_REPAIR_TOKEN || process.env.AICAR_BOOTSTRAP_TOKEN || '').trim();
}

type ReqBody = {
  t?: string;
  token?: string;
  email?: string;
  newPassword?: string;
  password?: string;
  // If true, reset the first user that has ROLE_SUPER_ADMIN.
  superAdmin?: boolean;
};

export async function POST(req: Request) {
  const tokenEnv = requiredToken();
  if (!tokenEnv) {
    return NextResponse.json(
      { error: 'Missing AICAR_BOOTSTRAP_TOKEN (or AICAR_REPAIR_TOKEN) in environment' },
      { status: 500 }
    );
  }

  const body = (await req.json().catch(() => null)) as ReqBody | null;

  const token = ((body?.t || body?.token) ?? '').toString().trim();
  if (!token || token !== tokenEnv) {
    return NextResponse.json({ error: 'invalid token' }, { status: 401 });
  }

  const newPassword = ((body?.newPassword || body?.password) ?? '').toString();
  if (!newPassword) {
    return NextResponse.json({ error: 'newPassword required' }, { status: 400 });
  }

  const users = await getUsers();
  if (!users.length) {
    return NextResponse.json({ error: 'no users exist yet' }, { status: 404 });
  }

  const requestedEmail = (body?.email ?? '').toString().trim().toLowerCase();
  const wantSuperAdmin = Boolean(body?.superAdmin);

  let idx = -1;

  if (requestedEmail) {
    idx = users.findIndex((u) => (u.email || '').toLowerCase() === requestedEmail);
  }

  // Optional fallback: reset first super admin if email unknown/missing.
  if (idx < 0 && wantSuperAdmin) {
    idx = users.findIndex((u) => Array.isArray(u.roleIds) && u.roleIds.includes(ROLE_SUPER_ADMIN));
  }

  if (idx < 0) {
    return NextResponse.json(
      { error: 'user not found', hint: 'Provide correct email or set superAdmin=true to reset super admin.' },
      { status: 404 }
    );
  }

  const now = new Date().toISOString();
  const passwordHash = await hashPassword(newPassword);

  const u = users[idx];
  const next = { ...u, passwordHash, updatedAt: now };

  const nextUsers = [...users];
  nextUsers[idx] = next;

  await saveUsers(nextUsers);

  return NextResponse.json({ ok: true, email: next.email, reset: wantSuperAdmin ? 'super_admin' : 'email' });
}
