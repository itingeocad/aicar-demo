import { cookies } from 'next/headers';
import { SESSION_COOKIE, PERM_ALL, PERM_ADMIN_ACCESS, ROLE_SUPER_ADMIN } from './constants';
import { verifySession } from './token';
import type { SessionPayload } from './types';

export type SessionUser = SessionPayload;

function effectivePermissions(session: SessionPayload | null): Set<string> {
  const perms = new Set<string>(session?.permissions || []);
  if (session?.roleIds?.includes(ROLE_SUPER_ADMIN)) {
    perms.add(PERM_ALL);
    perms.add(PERM_ADMIN_ACCESS);
  }
  return perms;
}

export async function getSession(): Promise<SessionUser | null> {
  const raw = cookies().get(SESSION_COOKIE)?.value;
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
  const perms = effectivePermissions(session);
  if (perms.has(PERM_ALL)) return true;
  return perms.has(permission);
}

export function hasAnyPermission(session: SessionUser | null | undefined, permissions: string[]): boolean {
  if (!session) return false;
  return permissions.some((perm) => hasPermission(session, perm));
}