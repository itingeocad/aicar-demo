import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import { listUserClips } from '@/lib/aiclips/store.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const clips = await listUserClips(session.uid, session.uid);

  return NextResponse.json({
    ok: true,
    clips
  });
}