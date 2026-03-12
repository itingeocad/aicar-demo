import { notFound } from 'next/navigation';
import { SiteFrame } from '@/components/SiteChrome';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { SearchPageModes } from '@/components/blocks/SearchPageModes';
import { getPageBySlug, getSiteConfig } from '@/lib/site/store.server';

type Props = {
  params: { slug?: string[] };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function CatchAllSitePage({ params, searchParams }: Props) {
  const config = await getSiteConfig();
  const path = (params.slug ?? []).join('/');
  const page = getPageBySlug(config, path);

  if (!page) {
    notFound();
  }

  if (path === 'search') {
    return (
      <SiteFrame config={config}>
        <SearchPageModes config={config} search={searchParams ?? {}} />
      </SiteFrame>
    );
  }

  return (
    <SiteFrame config={config}>
      {page.blocks.map((b) => (
        <BlockRenderer
          key={b.id}
          block={b}
          config={config}
          ctx={{ search: searchParams ?? {} }}
        />
      ))}
    </SiteFrame>
  );
}