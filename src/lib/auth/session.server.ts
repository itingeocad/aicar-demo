import { cookies } from 'next/headers';
import { SESSION_COOKIE, PERM_ALL, PERM_ADMIN_ACCESS, ROLE_SUPER_ADMIN } from './constants';
import { verifySession } from './token';
import type { SessionPayload } from './types';

function effectivePermissions(session: SessionPayload | null): Set<string> {
  const perms = new Set<string>(session?.permissions || []);
  if (session?.roleIds?.includes(ROLE_SUPER_ADMIN)) {
    perms.add(PERM_ALL);
    perms.add(PERM_ADMIN_ACCESS);
  }
  return perms;
}

export async function getSession(): Promise<SessionPayload | null> {
  const c = cookies().get(SESSION_COOKIE)?.value;
  if (!c) return null;
  return await verifySession(c);
}

export function hasPermission(session: SessionPayload | null, perm: string): boolean {
  if (!session) return false;
  const perms = effectivePermissions(session);
  if (perms.has(PERM_ALL)) return true;
  return perms.has(perm);
}

export function hasAnyPermission(session: SessionPayload | null, perms: string[]): boolean {
  return perms.some((p) => hasPermission(session, p));
}