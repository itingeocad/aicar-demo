import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth/session.server';
import { ROLE_SUPER_ADMIN } from '@/lib/auth/constants';
import { getListingById } from '@/lib/listings/store.server';
import { getTargetCommentsPolicy, setTargetCommentsPolicy } from '@/lib/comments/store.server';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const listing = await getListingById(params.id);
  if (!listing) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const policy = await getTargetCommentsPolicy('listing', params.id);
  return NextResponse.json({ ok: true, policy });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const listing = await getListingById(params.id);
  if (!listing) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const isAdmin = hasRole(session, ROLE_SUPER_ADMIN);
  const isOwner = session.uid === listing.ownerUid;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { enabled?: boolean } | null;
  const enabled = body?.enabled !== false;

  const policy = await setTargetCommentsPolicy({
    targetType: 'listing',
    targetId: params.id,
    enabled,
    disabledBy: isAdmin ? 'admin' : 'owner'
  });

  return NextResponse.json({ ok: true, policy });
}