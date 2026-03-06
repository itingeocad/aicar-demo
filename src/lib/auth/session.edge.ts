import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, PERM_ALL } from './constants';
import { verifySession } from './token';
import type { SessionPayload } from './types';

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return await verifySession(token);
}

export function hasPermissionEdge(session: SessionPayload | null, perm: string): boolean {
  if (!session) return false;
  if (session.permissions.includes(PERM_ALL)) return true;
  return session.permissions.includes(perm);
}
