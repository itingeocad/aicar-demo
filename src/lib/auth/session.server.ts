import { cookies } from 'next/headers';
import { PERM_ALL, SESSION_COOKIE } from './constants';
import { verifySession, type SessionPayload } from './token';

export type SessionUser = SessionPayload;

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;

  if (!raw) return null;

  const session = await verifySession(raw);
  if (!session?.uid) return null;

  return session;
}

export function isAuthenticated(session: SessionUser | null | undefined): boolean {
  return Boolean(session?.uid);
}

export function hasRole(session: SessionUser | null | undefined, roleId: string): boolean {
  if (!session) return false;
  return Array.isArray(session.roleIds) && session.roleIds.includes(roleId);
}

export function hasPermission(session: SessionUser | null | undefined, permission: string): boolean {
  if (!session) return false;

  const perms = Array.isArray(session.permissions) ? session.permissions : [];
  return perms.includes(PERM_ALL) || perms.includes(permission);
}