import { cookies } from 'next/headers';
import { SESSION_COOKIE, PERM_ALL } from './constants';
import { verifySession } from './token';
import type { SessionPayload } from './types';

export async function getSession(): Promise<SessionPayload | null> {
  const c = cookies().get(SESSION_COOKIE)?.value;
  if (!c) return null;
  return await verifySession(c);
}

export function hasPermission(session: SessionPayload | null, perm: string): boolean {
  if (!session) return false;
  if (session.permissions.includes(PERM_ALL)) return true;
  return session.permissions.includes(perm);
}

export function hasAnyPermission(session: SessionPayload | null, perms: string[]): boolean {
  return perms.some((p) => hasPermission(session, p));
}
