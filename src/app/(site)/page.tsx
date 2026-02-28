import { getSiteConfig, getPageBySlug } from '@/lib/site/store.server';
import { SiteFrame } from '@/components/SiteChrome';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';

export default async function HomePage() {
  const config = await getSiteConfig();
  const page = getPageBySlug(config, '');

  return (
    <SiteFrame config={config}>
      {page?.blocks.map((b) => (
        <BlockRenderer key={b.id} block={b} config={config} />
      ))}
    </SiteFrame>
  );
}
