import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import { createListing, listPublicListings } from '@/lib/listings/store.server';

export const dynamic = 'force-dynamic';

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(String(value || '').trim());
}

export async function GET() {
  const listings = await listPublicListings();
  return NextResponse.json({ ok: true, listings });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    title?: string;
    description?: string;
    price?: number;
    currency?: string;
    city?: string;
    brand?: string;
    model?: string;
    year?: number;
    coverUrl?: string;
    imageUrls?: string[];
    visibility?: 'public' | 'draft';
  } | null;

  const title = String(body?.title || '').trim();
  if (!title) {
    return NextResponse.json({ error: 'title required' }, { status: 400 });
  }

  const imageUrls = Array.isArray(body?.imageUrls) ? body!.imageUrls.map(String).filter(Boolean) : [];
  if (imageUrls.some((x) => !isHttpUrl(x))) {
    return NextResponse.json({ error: 'imageUrls must be http/https URLs' }, { status: 400 });
  }

  const coverUrl = String(body?.coverUrl || '').trim();
  if (coverUrl && !isHttpUrl(coverUrl)) {
    return NextResponse.json({ error: 'coverUrl must be http/https URL' }, { status: 400 });
  }

  const listing = await createListing({
    ownerUid: session.uid,
    ownerDisplayName: session.displayName,
    title,
    description: body?.description,
    price: body?.price,
    currency: body?.currency,
    city: body?.city,
    brand: body?.brand,
    model: body?.model,
    year: body?.year,
    coverUrl,
    imageUrls,
    visibility: body?.visibility === 'draft' ? 'draft' : 'public'
  });

  return NextResponse.json({ ok: true, listing });
}