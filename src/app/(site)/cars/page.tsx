import Link from 'next/link';
import { getSiteConfig } from '@/lib/site/store.server';
import { SiteFrame } from '@/components/SiteChrome';

export default async function CarsIndex() {
  const config = await getSiteConfig();
  const cars = config.demoData.cars;

  return (
    <SiteFrame config={config}>
      <div className="aicar-container py-8">
        <h1 className="text-2xl font-bold">Объявления</h1>
        <p className="mt-1 text-slate-600">Демо-список авто</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cars.map((car) => (
            <Link key={car.id} href={`/cars/${car.id}`} className="overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow">
              <div className="aspect-[16/10] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={car.imageUrl} alt={car.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{car.title}</div>
                    <div className="text-xs text-slate-500">{car.city} • {car.year}</div>
                  </div>
                  <div className="font-bold">{car.price.toLocaleString()} {car.currency}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SiteFrame>
  );
}
