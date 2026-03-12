import { notFound } from 'next/navigation';
import { SiteFrame } from '@/components/SiteChrome';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { SearchPageModes } from '@/components/blocks/SearchPageModes';
import { AIChatPage } from '@/components/blocks/AIChatPage';
import { AIClipsPage } from '@/components/blocks/AIClipsPage';
import { NewsPage } from '@/components/blocks/NewsPage';
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

  if (path === 'aichat') {
    return (
      <SiteFrame config={config} variant="aichat">
        <AIChatPage />
      </SiteFrame>
    );
  }

  if (path === 'aiclips') {
    return (
      <SiteFrame config={config} variant="aichat">
        <AIClipsPage reels={config.demoData.reels} />
      </SiteFrame>
    );
  }

  if (path === 'news') {
    return (
      <SiteFrame config={config} variant="aichat">
        <NewsPage config={config} />
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