import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import { getProfileByUid, updateProfile } from '@/lib/aiclips/store.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const profile = await getProfileByUid(session.uid);

  return NextResponse.json({
    ok: true,
    profile
  });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
  } | null;

  const profile = await updateProfile(session.uid, {
    displayName: body?.displayName,
    bio: body?.bio,
    avatarUrl: body?.avatarUrl,
    coverUrl: body?.coverUrl
  });

  return NextResponse.json({
    ok: true,
    profile
  });
}