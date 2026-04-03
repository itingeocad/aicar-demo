import { SiteFrame } from '@/components/SiteChrome';
import { ListingSubmitPageClient } from '@/components/listings/ListingSubmitPageClient';
import { getSiteConfig } from '@/lib/site/store.server';

export const dynamic = 'force-dynamic';

export default async function SubmitListingPage() {
  const config = await getSiteConfig();

  return (
    <SiteFrame config={config}>
      <ListingSubmitPageClient />
    </SiteFrame>
  );
}