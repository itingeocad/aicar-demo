import { NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/lib/auth/store.server';
import { hashPassword } from '@/lib/auth/crypto.server';

export const dynamic = 'force-dynamic';

function requiredToken() {
  // Prefer explicit repair token if you want separate rotation; fall back to bootstrap token.
  return (process.env.AICAR_REPAIR_TOKEN || process.env.AICAR_BOOTSTRAP_TOKEN || '').trim();
}

export async function POST(req: Request) {
  const tokenEnv = requiredToken();
  if (!tokenEnv) {
    return NextResponse.json({ error: 'Missing AICAR_BOOTSTRAP_TOKEN (or AICAR_REPAIR_TOKEN) in environment' }, { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as
    | { t?: string; token?: string; email?: string; newPassword?: string; password?: string; disableUser?: boolean }
    | null;

  const token = (body?.t || body?.token || '').trim();
  if (!token || token !== tokenEnv) {
    return NextResponse.json({ error: 'invalid token' }, { status: 401 });
  }

  const email = (body?.email || '').trim().toLowerCase();
  const newPassword = (body?.newPassword || body?.password || '').toString();

  if (!email || !newPassword) {
    return NextResponse.json({ error: 'email/newPassword required' }, { status: 400 });
  }

  const users = await getUsers();
  const idx = users.findIndex((u) => (u.email || '').toLowerCase() === email);
  if (idx < 0) {
    return NextResponse.json({ error: 'user not found' }, { status: 404 });
  }

  const now = new Date().toISOString();
  const passwordHash = await hashPassword(newPassword);

  const u = users[idx];
  const next = { ...u, passwordHash, updatedAt: now, isActive: body?.disableUser ? false : u.isActive };

  const nextUsers = [...users];
  nextUsers[idx] = next;

  await saveUsers(nextUsers);

  return NextResponse.json({ ok: true, email });
}
