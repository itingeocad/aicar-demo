import { SignJWT, jwtVerify } from 'jose';
import type { SessionPayload } from './types';

function secretKey() {
  const secret =
    process.env.AICAR_AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    (process.env.NODE_ENV !== 'production' ? 'dev-secret-change-me' : '');

  if (!secret) throw new Error('Missing AICAR_AUTH_SECRET (or AUTH_SECRET)');
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: Omit<SessionPayload, 'iat' | 'exp'>, ttlSeconds = 60 * 60 * 24 * 7) {
  const now = Math.floor(Date.now() / 1000);
  const full: SessionPayload = {
    ...payload,
    iat: now,
    exp: now + ttlSeconds
  };

  const token = await new SignJWT(full as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(full.exp)
    .sign(secretKey());

  return { token, payload: full };
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
