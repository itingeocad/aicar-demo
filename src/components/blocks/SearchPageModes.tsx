import { SearchPrototypeForm } from '@/components/blocks/SearchPrototypeForm';
import { SearchResultsModeClient } from '@/components/blocks/SearchResultsModeClient';
import { SiteConfig } from '@/lib/site/types';

type SearchMap = Record<string, string | string[] | undefined>;

function pick1(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

function getNum(v: string) {
  const cleaned = String(v ?? '').replace(/[^\d.]/g, '').trim();
  if (!cleaned) return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

export function SearchPageModes({
  config,
  search
}: {
  config: SiteConfig;
  search?: SearchMap;
}) {
  const sp = search ?? {};

  const type = pick1(sp.type).trim().toLowerCase();
  const brand = pick1(sp.brand).trim().toLowerCase();
  const model = pick1(sp.model).trim().toLowerCase();
  const city = pick1(sp.city).trim().toLowerCase();
  const fuel = pick1(sp.fuel).trim().toLowerCase();

  const year = getNum(pick1(sp.year));
  const mileage = getNum(pick1(sp.mileageKm));
  const priceFrom = getNum(pick1(sp.priceFrom));
  const priceTo = getNum(pick1(sp.priceTo));

  const hasActiveSearch =
    Boolean(type || brand || model || city || fuel) ||
    !Number.isNaN(year) ||
    !Number.isNaN(mileage) ||
    !Number.isNaN(priceFrom) ||
    !Number.isNaN(priceTo);

  return (
    <>
      {!hasActiveSearch ? (
        <>
          <div className="aicar-container py-6">
            <h1 className="text-center text-2xl font-bold">Расширенный поиск</h1>
          </div>

          <div className="aicar-container">
            <SearchPrototypeForm cta="Найти авто" initial={sp} />
          </div>
        </>
      ) : null}

      <SearchResultsModeClient
        active={hasActiveSearch}
        demoCars={config.demoData.cars}
        search={sp}
      />
    </>
  );
}