import { cookies, headers } from 'next/headers';
import {
  PERM_ALL,
  PERM_ADMIN_ACCESS,
  ROLE_SUPER_ADMIN,
  SESSION_COOKIE
} from './constants';
import { rolePermissions } from './store.server';
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

function parseBearerToken(authHeader: string): string | null {
  const raw = String(authHeader || '').trim();
  if (!raw) return null;
  const m = raw.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}

async function readSessionToken(): Promise<string | null> {
  try {
    const h = headers() as any;
    const auth = String(h?.get?.('authorization') || '');
    const bearer = parseBearerToken(auth);
    if (bearer) return bearer;
  } catch {}

  try {
    const store = cookies() as any;
    const direct = store?.get?.(SESSION_COOKIE)?.value;
    if (direct) return direct;
  } catch {}

  try {
    const h = headers() as any;
    const rawCookieHeader = String(h?.get?.('cookie') || '');
    const fromHeader = parseCookieValue(rawCookieHeader, SESSION_COOKIE);
    if (fromHeader) return fromHeader;
  } catch {}

  return null;
}

async function hydratePermissions(session: SessionPayload): Promise<SessionPayload> {
  const roleIds = Array.isArray(session.roleIds) ? session.roleIds.map(String) : [];
  const tokenPerms = Array.isArray(session.permissions) ? session.permissions.map(String) : [];

  const perms = new Set<string>(tokenPerms);

  try {
    const fromRoles = await rolePermissions(roleIds);
    for (const p of fromRoles) perms.add(String(p));
  } catch {}

  if (roleIds.includes(ROLE_SUPER_ADMIN)) {
    perms.add(PERM_ALL);
    perms.add(PERM_ADMIN_ACCESS);
  }

  return {
    ...session,
    roleIds,
    permissions: Array.from(perms)
  };
}

export async function getSession(): Promise<SessionUser | null> {
  const raw = await readSessionToken();
  if (!raw) return null;

  const session = await verifySession(raw);
  if (!session?.uid) return null;

  return await hydratePermissions(session);
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

export function hasAnyPermission(
  session: SessionUser | null | undefined,
  permissions: string[]
): boolean {
  if (!session) return false;
  return permissions.some((perm) => hasPermission(session, perm));
}