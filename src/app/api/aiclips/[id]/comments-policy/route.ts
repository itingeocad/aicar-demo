import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth/session.server';
import { ROLE_SUPER_ADMIN } from '@/lib/auth/constants';
import { getClipById } from '@/lib/aiclips/store.server';
import { getTargetCommentsPolicy, setTargetCommentsPolicy } from '@/lib/comments/store.server';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const clip = await getClipById(params.id);
  if (!clip) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const policy = await getTargetCommentsPolicy('clip', params.id);
  return NextResponse.json({ ok: true, policy });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const clip = await getClipById(params.id);
  if (!clip) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const isAdmin = hasRole(session, ROLE_SUPER_ADMIN);
  const isOwner = session.uid === clip.ownerUid;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { enabled?: boolean } | null;
  const enabled = body?.enabled !== false;

  const policy = await setTargetCommentsPolicy({
    targetType: 'clip',
    targetId: params.id,
    enabled,
    disabledBy: isAdmin ? 'admin' : 'owner'
  });

  return NextResponse.json({ ok: true, policy });
}