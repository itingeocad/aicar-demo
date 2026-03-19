import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import { addComment, listComments } from '@/lib/aiclips/store.server';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const comments = await listComments(params.id);

  return NextResponse.json({
    ok: true,
    comments
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { text?: string } | null;
  const text = String(body?.text || '').trim();

  if (!text) {
    return NextResponse.json({ error: 'text required' }, { status: 400 });
  }

  const comment = await addComment({
    clipId: params.id,
    authorUid: session.uid,
    authorDisplayName: session.displayName,
    text
  });

  if (!comment) {
    return NextResponse.json({ error: 'not found or invalid comment' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    comment
  });
}