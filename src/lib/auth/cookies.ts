import { SESSION_COOKIE } from './constants';

export function sessionCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
    path: '/'
  };
}
