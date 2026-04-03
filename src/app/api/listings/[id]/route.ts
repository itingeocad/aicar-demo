import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import { getListingViewById, updateListing } from '@/lib/listings/store.server';
import type { UpdateListingInput } from '@/lib/listings/types';

export const dynamic = 'force-dynamic';

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(String(value || '').trim());
}

function str(value: unknown) {
  return String(value ?? '').trim();
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  const listing = await getListingViewById(params.id);

  if (!listing) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const isOwner = session?.uid === listing.ownerUid;
  const isPublic = listing.visibility === 'public' && listing.moderationStatus === 'approved';

  if (!isPublic && !isOwner) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    listing: {
      ...listing,
      isOwner
    }
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as UpdateListingInput | null;

  const imageUrls = Array.isArray(body?.imageUrls) ? body!.imageUrls.map(String).filter(Boolean) : undefined;
  if (imageUrls && imageUrls.some((x) => !isHttpUrl(x))) {
    return NextResponse.json({ error: 'imageUrls must be http/https URLs' }, { status: 400 });
  }

  const coverUrl = body?.coverUrl == null ? undefined : str(body.coverUrl);
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
    visibility: body?.visibility,
    commentsEnabled: body?.commentsEnabled,
    listingType: body?.listingType,
    vehicleCategory: body?.vehicleCategory,
    brandId: body?.brandId,
    modelId: body?.modelId,
    mileageKm: body?.mileageKm,
    drivetrain: body?.drivetrain,
    fuelType: body?.fuelType,
    transmission: body?.transmission,
    engine: body?.engine,
    regionId: body?.regionId,
    priceAmount: body?.priceAmount,
    priceCurrency: body?.priceCurrency,
    linkedClipIds: body?.linkedClipIds,
    moderationStatus: body?.moderationStatus
  });

  if (!listing) {
    return NextResponse.json({ error: 'not found or forbidden' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, listing });
}