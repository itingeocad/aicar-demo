import { cookies, headers } from 'next/headers';
import {
  PERM_ALL,
  PERM_ADMIN_ACCESS,
  ROLE_SUPER_ADMIN,
  SESSION_COOKIE
} from './constants';
import { verifySession } from './token';
import type { SessionPayload } from './types';

export type SessionUser = SessionPayload;

function parseCookieValue(rawCookieHeader: string, name: string): string | null {
  if (!rawCookieHeader) return null;

  const parts = rawCookieHeader.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${name}=`)) continue;
    const value = trimmed.slice(name.length + 1);
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return null;
}

async function readSessionCookie(): Promise<string | null> {
  try {
    const cookieStore = await Promise.resolve(cookies() as any);
    const direct = cookieStore?.get?.(SESSION_COOKIE)?.value;
    if (direct) return direct;
  } catch {}

  try {
    const headerStore = await Promise.resolve(headers() as any);
    const rawCookieHeader = String(headerStore?.get?.('cookie') || '');
    const fromHeader = parseCookieValue(rawCookieHeader, SESSION_COOKIE);
    if (fromHeader) return fromHeader;
  } catch {}

  return null;
}

function effectivePermissions(session: SessionPayload | null): Set<string> {
  const perms = new Set<string>(Array.isArray(session?.permissions) ? session!.permissions : []);
  const roleIds = Array.isArray(session?.roleIds) ? session!.roleIds : [];

  if (roleIds.includes(ROLE_SUPER_ADMIN)) {
    perms.add(PERM_ALL);
    perms.add(PERM_ADMIN_ACCESS);
  }

  return perms;
}

export async function getSession(): Promise<SessionUser | null> {
  const raw = await readSessionCookie();
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

export function hasAnyPermission(
  session: SessionUser | null | undefined,
  permissions: string[]
): boolean {
  if (!session) return false;
  return permissions.some((perm) => hasPermission(session, perm));
}