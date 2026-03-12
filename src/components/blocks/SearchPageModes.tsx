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

  const type = pick1(sp.type).trim().toLowerCase() as any;
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

  const guaranteedCars: SiteConfig['demoData']['cars'] = [
    {
      id: 'mock_bike_bmw_1',
      title: 'BMW G 310 R',
      price: 5600,
      currency: '$',
      year: 2020,
      mileageKm: 12000,
      city: 'Chisinau',
      fuel: 'Gasoline',
      gearbox: 'MT',
      imageUrl: 'https://picsum.photos/seed/bmw_g310r/1200/800',
      vehicleType: 'bike'
    },
    {
      id: 'mock_bike_bmw_2',
      title: 'BMW F 900 XR',
      price: 9800,
      currency: '$',
      year: 2021,
      mileageKm: 9000,
      city: 'Balti',
      fuel: 'Gasoline',
      gearbox: 'MT',
      imageUrl: 'https://picsum.photos/seed/bmw_f900xr/1200/800',
      vehicleType: 'bike'
    },
    {
      id: 'mock_truck_volvo_1',
      title: 'Volvo FH 460',
      price: 26800,
      currency: '$',
      year: 2016,
      mileageKm: 540000,
      city: 'Chisinau',
      fuel: 'Diesel',
      gearbox: 'AT',
      imageUrl: 'https://picsum.photos/seed/volvo_fh460/1200/800',
      vehicleType: 'truck'
    },
    {
      id: 'mock_bus_sprinter_1',
      title: 'Mercedes Sprinter',
      price: 16500,
      currency: '$',
      year: 2017,
      mileageKm: 188000,
      city: 'Comrat',
      fuel: 'Diesel',
      gearbox: 'MT',
      imageUrl: 'https://picsum.photos/seed/sprinter/1200/800',
      vehicleType: 'bus'
    }
  ];

  let cars = [...config.demoData.cars];
  for (const extra of guaranteedCars) {
    if (!cars.some((c) => c.id === extra.id)) {
      cars.push(extra);
    }
  }

  if (type) {
    cars = cars.filter((c) => (c.vehicleType ?? 'car') === type);
  }
  if (brand) cars = cars.filter((c) => c.title.toLowerCase().includes(brand));
  if (model) cars = cars.filter((c) => c.title.toLowerCase().includes(model));
  if (city) cars = cars.filter((c) => c.city.toLowerCase().includes(city));
  if (fuel) cars = cars.filter((c) => (c.fuel ?? '').toLowerCase().includes(fuel));
  if (!Number.isNaN(year)) cars = cars.filter((c) => c.year >= year);
  if (!Number.isNaN(mileage)) cars = cars.filter((c) => c.mileageKm <= mileage);
  if (!Number.isNaN(priceFrom)) cars = cars.filter((c) => c.price >= priceFrom);
  if (!Number.isNaN(priceTo)) cars = cars.filter((c) => c.price <= priceTo);

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
        cars={hasActiveSearch ? cars.slice(0, 12) : cars}
        search={sp}
      />
    </>
  );
}