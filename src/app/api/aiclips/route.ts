import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import { createClip } from '@/lib/aiclips/store.server';

export const dynamic = 'force-dynamic';

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(String(value || '').trim());
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    title?: string;
    description?: string;
    videoUrl?: string;
    posterUrl?: string;
    sourceType?: 'upload' | 'url';
    visibility?: 'public' | 'draft';
  } | null;

  const title = String(body?.title || '').trim();
  const description = String(body?.description || '').trim();
  const videoUrl = String(body?.videoUrl || '').trim();
  const posterUrl = String(body?.posterUrl || '').trim();
  const sourceType = body?.sourceType === 'upload' ? 'upload' : 'url';
  const visibility = body?.visibility === 'draft' ? 'draft' : 'public';

  if (!title || !videoUrl) {
    return NextResponse.json({ error: 'title/videoUrl required' }, { status: 400 });
  }

  if (!isHttpUrl(videoUrl)) {
    return NextResponse.json({ error: 'videoUrl must be http/https URL' }, { status: 400 });
  }

  if (posterUrl && !isHttpUrl(posterUrl)) {
    return NextResponse.json({ error: 'posterUrl must be http/https URL' }, { status: 400 });
  }

  const clip = await createClip({
    ownerUid: session.uid,
    ownerDisplayName: session.displayName,
    title,
    description,
    videoUrl,
    posterUrl,
    sourceType,
    visibility
  });

  return NextResponse.json({
    ok: true,
    clip
  });
}