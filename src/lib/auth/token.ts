import { jwtVerify, SignJWT } from 'jose';

export type SessionPayload = {
  uid: string;
  email: string;
  displayName: string;
  roleIds: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
};

const SESSION_SECRET =
  process.env.AICAR_SESSION_SECRET ||
  process.env.AUTH_SECRET ||
  'aicar-demo-stable-session-secret-v1';

const secretKey = new TextEncoder().encode(SESSION_SECRET);

export async function signSession(
  payloadBase: Omit<SessionPayload, 'iat' | 'exp'>,
  maxAgeSeconds = 60 * 60 * 24 * 7
) {
  const payload: SessionPayload = {
    uid: payloadBase.uid,
    email: payloadBase.email,
    displayName: payloadBase.displayName,
    roleIds: Array.isArray(payloadBase.roleIds) ? payloadBase.roleIds.map(String) : [],
    permissions: Array.isArray(payloadBase.permissions) ? payloadBase.permissions.map(String) : []
  };

  const token = await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(secretKey);

  return { token, payload };
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    return {
      uid: String(payload.uid || ''),
      email: String(payload.email || ''),
      displayName: String(payload.displayName || ''),
      roleIds: Array.isArray(payload.roleIds) ? payload.roleIds.map(String) : [],
      permissions: Array.isArray(payload.permissions) ? payload.permissions.map(String) : [],
      iat: typeof payload.iat === 'number' ? payload.iat : undefined,
      exp: typeof payload.exp === 'number' ? payload.exp : undefined
    };
  } catch {
    return null;
  }
}