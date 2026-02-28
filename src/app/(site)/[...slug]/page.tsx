import { notFound } from 'next/navigation';
import { getSiteConfig, getPageBySlug } from '@/lib/site/store.server';
import { SiteFrame } from '@/components/SiteChrome';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';

export default async function DynamicPage({ params }: { params: { slug: string[] } }) {
  const slugPath = params.slug.join('/');
  const config = await getSiteConfig();
  const page = getPageBySlug(config, slugPath);

  if (!page || !page.isPublished) return notFound();

  return (
    <SiteFrame config={config}>
      {page.blocks.map((b) => (
        <BlockRenderer key={b.id} block={b} config={config} />
      ))}
    </SiteFrame>
  );
}
