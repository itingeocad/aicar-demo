import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import { getListingById, updateListing } from '@/lib/listings/store.server';

export const dynamic = 'force-dynamic';

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(String(value || '').trim());
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  const listing = await getListingById(params.id);

  if (!listing) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (listing.visibility !== 'public' && session?.uid !== listing.ownerUid) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  return NextResponse.json({ ok: true, listing });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

  const imageUrls = Array.isArray(body?.imageUrls) ? body!.imageUrls.map(String).filter(Boolean) : undefined;
  if (imageUrls && imageUrls.some((x) => !isHttpUrl(x))) {
    return NextResponse.json({ error: 'imageUrls must be http/https URLs' }, { status: 400 });
  }

  const coverUrl = body?.coverUrl == null ? undefined : String(body.coverUrl || '').trim();
  if (coverUrl && !isHttpUrl(coverUrl)) {
    return NextResponse.json({ error: 'coverUrl must be http/https URL' }, { status: 400 });
  }

  const listing = await updateListing({
    listingId: params.id,
    uid: session.uid,
    title: body?.title,
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

  if (!listing) {
    return NextResponse.json({ error: 'not found or forbidden' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, listing });
}