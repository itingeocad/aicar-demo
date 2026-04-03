import { notFound } from 'next/navigation';
import { SiteFrame } from '@/components/SiteChrome';
import { ListingDetailsPageClient } from '@/components/listings/ListingDetailsPageClient';
import { getListingViewById, listPublicListings } from '@/lib/listings/store.server';
import { getSiteConfig } from '@/lib/site/store.server';

export const dynamic = 'force-dynamic';

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const [config, listing, allPublic] = await Promise.all([
    getSiteConfig(),
    getListingViewById(params.id),
    listPublicListings()
  ]);

  if (!listing || listing.visibility !== 'public' || listing.moderationStatus !== 'approved') {
    notFound();
  }

  const sameCategory = allPublic.filter(
    (item) => item.id !== listing.id && item.vehicleCategory === listing.vehicleCategory
  );

  const fallback = allPublic.filter((item) => item.id !== listing.id);
  const related = (sameCategory.length > 0 ? sameCategory : fallback).slice(0, 3);

  return (
    <SiteFrame config={config}>
      <ListingDetailsPageClient listing={listing} related={related} />
    </SiteFrame>
  );
}