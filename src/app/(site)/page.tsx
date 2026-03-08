import { getSiteConfig, getPageBySlug } from '@/lib/site/store.server';
import { normalizeDeep } from '@/lib/text/normalize';
import { SiteFrame } from '@/components/SiteChrome';


import { BlockRenderer } from '@/components/blocks/BlockRenderer';

export const dynamic = 'force-dynamic';


export default async function HomePage() {
  const config = normalizeDeep(await getSiteConfig());
  const page = getPageBySlug(config, '');

  return (
    <SiteFrame config={config}>
      {page?.blocks.map((b) => (
        <BlockRenderer key={b.id} block={b} config={config} />
      ))}
    </SiteFrame>
  );
}
