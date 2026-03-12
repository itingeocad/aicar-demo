'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DemoCar, DemoReel } from '@/lib/site/types';

function ReelCard({
  reel,
  mobile = false
}: {
  reel: DemoReel;
  mobile?: boolean;
}) {
  return (
    <Link
      href={`/aiclips?reel=${encodeURIComponent(reel.id)}`}
      className={
        mobile
          ? 'block overflow-hidden rounded-[22px] bg-[#d9d9d9] shadow-[0_2px_10px_rgba(0,0,0,0.05)]'
          : 'block overflow-hidden rounded-[10px] bg-[#d9d9d9] shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
      }
    >
      <img
        src={reel.thumbUrl || reel.posterUrl}
        alt={reel.title}
        className={mobile ? 'h-[520px] w-full object-cover' : 'h-[320px] w-full object-cover'}
      />
    </Link>
  );
}

function DesktopAdCard({ car }: { car: DemoCar }) {
  return (
    <article className="rounded-[14px] bg-[#f4f4f4] p-[18px] shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-[160px_1fr] gap-5">
        <div className="flex h-[160px] w-[160px] items-center justify-center overflow-hidden rounded-[6px] bg-white">
          <img src={car.imageUrl} alt={car.title} className="h-full w-full object-cover" />
        </div>

        <div className="min-h-[160px]">
          <h3 className="text-[18px] font-semibold leading-[1.1] text-slate-900">
            {car.title}
          </h3>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
            <span>{car.year}</span>
            <span>{car.mileageKm.toLocaleString('ru-RU')} км</span>
            <span>{car.currency}{car.price.toLocaleString('ru-RU')}</span>
            <span>{car.gearbox || 'AT'}</span>
            <span>{car.city}</span>
          </div>

          <div className="mt-6 text-[15px] text-slate-800">
            Описание объявления
          </div>
        </div>
      </div>
    </article>
  );
}

function MobileAdCard({ car }: { car: DemoCar }) {
  return (
    <article className="rounded-[22px] bg-[#d9d9d9] px-4 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-[140px_1fr] gap-4">
        <div className="flex h-[140px] w-[140px] items-center justify-center overflow-hidden rounded-[4px] bg-white">
          <img src={car.imageUrl} alt={car.title} className="h-full w-full object-cover" />
        </div>

        <div className="min-h-[140px]">
          <h3 className="text-[18px] font-semibold leading-[1.1] text-slate-900">
            {car.title}
          </h3>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600">
            <span>{car.year}</span>
            <span>{car.currency}{car.price.toLocaleString('ru-RU')}</span>
            <span>{car.mileageKm.toLocaleString('ru-RU')} км</span>
            <span>{car.city}</span>
          </div>

          <div className="mt-5 text-[16px] text-slate-900">
            Описание
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProfilePageClient({
  displayName,
  reels,
  cars
}: {
  displayName: string;
  reels: DemoReel[];
  cars: DemoCar[];
}) {
  const reelItems = useMemo(() => reels.slice(0, 4), [reels]);
  const adItems = useMemo(() => cars.slice(0, 5), [cars]);
  const [mobileReelIndex, setMobileReelIndex] = useState(0);

  const selectedMobileReel = reelItems[mobileReelIndex] || reels[0];

  const prevReel = () => {
    if (reelItems.length <= 1) return;
    setMobileReelIndex((v) => (v === 0 ? reelItems.length - 1 : v - 1));
  };

  const nextReel = () => {
    if (reelItems.length <= 1) return;
    setMobileReelIndex((v) => (v >= reelItems.length - 1 ? 0 : v + 1));
  };

  return (
    <>
      <div className="hidden md:block">
        <section className="pb-[120px] pt-[28px]">
          <div className="aicar-container">
            <div className="mx-auto max-w-[960px]">
              <div className="h-[338px] bg-[#d9d9d9] text-center text-[20px] text-slate-900">
                <div className="flex h-full items-center justify-center">
                  Обложка (пользователь устанавливает)
                </div>
              </div>

              <div className="-mt-[130px] flex justify-center">
                <div className="flex h-[260px] w-[260px] items-center justify-center rounded-full bg-[#d9d9d9] text-[20px] text-slate-900">
                  Фото профиля
                </div>
              </div>

              <div className="mt-8 text-center text-[20px] text-slate-900">
                {displayName || 'Описание страницы'}
              </div>

              <section className="mt-[42px]">
                <div className="grid grid-cols-[40px_1fr_80px] items-center">
                  <div />
                  <h2 className="text-center text-[36px] font-medium text-slate-900">AIClips</h2>
                  <Link href="/aiclips" className="justify-self-end text-[14px] text-slate-800">
                    Больше
                  </Link>
                </div>

                <div className="mt-6 grid grid-cols-[34px_1fr_34px] items-center gap-6">
                  <button type="button" aria-label="Предыдущий ролик" className="flex items-center justify-center text-slate-500">
                    <ChevronLeft className="h-14 w-14" strokeWidth={1.4} />
                  </button>

                  <div className="grid grid-cols-4 gap-8">
                    {reelItems.map((reel) => (
                      <ReelCard key={reel.id} reel={reel} />
                    ))}
                  </div>

                  <button type="button" aria-label="Следующий ролик" className="flex items-center justify-center text-slate-500">
                    <ChevronRight className="h-14 w-14" strokeWidth={1.4} />
                  </button>
                </div>
              </section>

              <section className="mt-[110px]">
                <h2 className="text-center text-[36px] font-medium text-slate-900">Объявления</h2>

                <div className="mt-8 space-y-5">
                  {adItems.map((car) => (
                    <DesktopAdCard key={car.id} car={car} />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>

      <div className="md:hidden">
        <section className="pb-[48px] pt-[18px]">
          <div className="aicar-container">
            <div className="mx-auto max-w-[960px]">
              <div className="h-[170px] bg-[#d9d9d9] text-center text-[20px] text-slate-900">
                <div className="flex h-full items-center justify-center px-6">
                  Обложка (пользователь устанавливает)
                </div>
              </div>

              <div className="-mt-[88px] flex justify-center">
                <div className="flex h-[176px] w-[176px] items-center justify-center rounded-full bg-[#d9d9d9] px-6 text-center text-[18px] text-slate-900">
                  Фото профиля
                </div>
              </div>

              <div className="mt-8 text-center text-[18px] text-slate-900">
                {displayName || 'Описание страницы'}
              </div>

              <section className="mt-[48px]">
                <h2 className="text-center text-[28px] font-medium text-slate-900">AIClips</h2>

                <div className="relative mt-6 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={prevReel}
                    aria-label="Предыдущий ролик"
                    className="absolute left-[-10px] top-1/2 z-10 -translate-y-1/2 text-slate-500"
                  >
                    <ChevronLeft className="h-16 w-16" strokeWidth={1.4} />
                  </button>

                  <div className="w-full max-w-[340px]">
                    {selectedMobileReel ? <ReelCard reel={selectedMobileReel} mobile /> : null}
                  </div>

                  <button
                    type="button"
                    onClick={nextReel}
                    aria-label="Следующий ролик"
                    className="absolute right-[-10px] top-1/2 z-10 -translate-y-1/2 text-slate-500"
                  >
                    <ChevronRight className="h-16 w-16" strokeWidth={1.4} />
                  </button>
                </div>
              </section>

              <section className="mt-[54px]">
                <div className="space-y-4">
                  {adItems.map((car) => (
                    <MobileAdCard key={car.id} car={car} />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}