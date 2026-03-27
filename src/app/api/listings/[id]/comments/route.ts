import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import { addComment, getEffectiveCommentsState, listCommentsTree } from '@/lib/comments/store.server';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const [state, comments] = await Promise.all([
    getEffectiveCommentsState('listing', params.id),
    listCommentsTree('listing', params.id)
  ]);

  if (!state.exists) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    enabled: state.enabled,
    reason: state.reason,
    comments
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { text?: string; parentId?: string | null } | null;
  const result = await addComment({
    targetType: 'listing',
    targetId: params.id,
    parentId: body?.parentId || null,
    authorUid: session.uid,
    authorDisplayName: session.displayName,
    text: String(body?.text || '')
  });

  if (!result.comment) {
    const status =
      result.error === 'not_found' ? 404 :
      result.error === 'listings_globally_disabled' || result.error === 'target_comments_disabled' ? 403 :
      400;

    return NextResponse.json({ error: result.error || 'comment_failed' }, { status });
  }

  return NextResponse.json({ ok: true, comment: result.comment });
}