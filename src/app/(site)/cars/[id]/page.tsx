import { notFound } from 'next/navigation';
import { getSiteConfig, getPageBySlug } from '@/lib/site/store.server';
import { SiteFrame } from '@/components/SiteChrome';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';

export default async function CarDetail({ params }: { params: { id: string } }) {
  const config = await getSiteConfig();
  const car = config.demoData.cars.find((c) => c.id === params.id);
  if (!car) return notFound();

  const template = getPageBySlug(config, 'cars/[id]');
  if (!template || !template.isPublished) {
    // Fallback: if template is missing, still render something.
    return (
      <SiteFrame config={config}>
        <div className="aicar-container py-10">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">Шаблон страницы не найден.</div>
        </div>
      </SiteFrame>
    );
  }

  return (
    <SiteFrame config={config}>
      {template.blocks.map((b) => (
        <BlockRenderer key={b.id} block={b} config={config} ctx={{ carId: params.id }} />
      ))}
    </SiteFrame>
  );
}
