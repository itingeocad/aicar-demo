import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth/session.server';
import { ROLE_SUPER_ADMIN } from '@/lib/auth/constants';
import { moderateListing } from '@/lib/listings/admin.server';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!hasRole(session, ROLE_SUPER_ADMIN)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as {
    action?: 'approve' | 'reject' | 'unpublish' | 'republish';
    rejectionReason?: string;
  } | null;

  const action = body?.action;
  if (!action) {
    return NextResponse.json({ error: 'action required' }, { status: 400 });
  }

  const moderationStatus =
    action === 'approve' || action === 'republish'
      ? 'approved'
      : action === 'reject'
        ? 'rejected'
        : 'unpublished';

  const listing = await moderateListing({
    listingId: params.id,
    moderationStatus,
    adminUid: session!.uid,
    rejectionReason: body?.rejectionReason
  });

  if (!listing) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, listing });
}