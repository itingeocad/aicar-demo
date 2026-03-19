import type { NextRequest } from 'next/server';
import { PERM_ALL, SESSION_COOKIE } from './constants';
import { verifySession } from './token';
import type { SessionPayload } from './types';

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await verifySession(token);
  if (!session) return null;

  return {
    ...session,
    iat: typeof session.iat === 'number' ? session.iat : 0,
    exp: typeof session.exp === 'number' ? session.exp : 0
  };
}

export function hasPermissionEdge(session: SessionPayload | null, perm: string): boolean {
  if (!session) return false;
  const perms = Array.isArray(session.permissions) ? session.permissions : [];
  return perms.includes(PERM_ALL) || perms.includes(perm);
}