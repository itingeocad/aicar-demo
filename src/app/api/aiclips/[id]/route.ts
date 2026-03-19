import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import { deleteClip, getClipById, updateClip } from '@/lib/aiclips/store.server';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  const clip = await getClipById(params.id);

  if (!clip) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  if (clip.visibility !== 'public' && session?.uid !== clip.ownerUid) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  return NextResponse.json({ ok: true, clip });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    title?: string;
    description?: string;
    videoUrl?: string;
    posterUrl?: string;
    visibility?: 'public' | 'draft';
    sourceType?: 'upload' | 'url';
  } | null;

  const clip = await updateClip({
    clipId: params.id,
    uid: session.uid,
    title: body?.title,
    description: body?.description,
    videoUrl: body?.videoUrl,
    posterUrl: body?.posterUrl,
    visibility: body?.visibility === 'draft' ? 'draft' : 'public',
    sourceType: body?.sourceType === 'upload' ? 'upload' : 'url'
  });

  if (!clip) {
    return NextResponse.json({ error: 'not found or forbidden' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, clip });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const ok = await deleteClip(params.id, session.uid);
  if (!ok) {
    return NextResponse.json({ error: 'not found or forbidden' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}