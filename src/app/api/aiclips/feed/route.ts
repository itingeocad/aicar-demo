import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import { listPublicClips } from '@/lib/aiclips/store.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();

  const clips = await listPublicClips(session?.uid || null);

  return NextResponse.json({
    ok: true,
    clips
  });
}