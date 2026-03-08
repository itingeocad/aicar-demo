import { notFound } from 'next/navigation';
import { getSiteConfig, getPageBySlug } from '@/lib/site/store.server';
import { normalizeDeep } from '@/lib/text/normalize';


import { SiteFrame } from '@/components/SiteChrome';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';

export const dynamic = 'force-dynamic';


export default async function DynamicPage({
  params,
  searchParams
}: {
  params: { slug: string[] };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const slugPath = params.slug.join('/');
  const config = normalizeDeep(await getSiteConfig());
  const page = getPageBySlug(config, slugPath);

  if (!page || !page.isPublished) return notFound();

  return (
    <SiteFrame config={config}>
      {page.blocks.map((b) => (
        <BlockRenderer key={b.id} block={b} config={config} ctx={{ search: searchParams }} />
      ))}
    </SiteFrame>
  );
}
