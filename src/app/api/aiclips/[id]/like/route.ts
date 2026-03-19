import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import { likeClip, unlikeClip } from '@/lib/aiclips/store.server';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const clip = await likeClip(params.id, session.uid);
  if (!clip) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, clip });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const clip = await unlikeClip(params.id, session.uid);
  if (!clip) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, clip });
}