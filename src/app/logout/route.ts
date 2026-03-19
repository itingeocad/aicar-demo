import { NextResponse } from 'next/server';
import { sessionCookieOptions } from '@/lib/auth/cookies';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get('next') || '/';

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="cache-control" content="no-store" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Signing out…</title>
  </head>
  <body>
    <script>
      try {
        localStorage.removeItem('aicar_session_token');
      } catch (e) {}
      window.location.replace(${JSON.stringify(next)});
    </script>
    <noscript>
      <meta http-equiv="refresh" content="0;url=${next.replace(/"/g, '&quot;')}" />
    </noscript>
  </body>
</html>`;

  const res = new NextResponse(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store'
    }
  });

  res.cookies.set({
    ...sessionCookieOptions(),
    value: '',
    maxAge: 0
  });

  return res;
}