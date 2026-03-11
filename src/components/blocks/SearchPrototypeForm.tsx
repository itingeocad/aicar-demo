'use client';

import React from 'react';
import { Bike, Bus, Car, Truck } from 'lucide-react';

type VehicleTypeKey = 'car' | 'truck' | 'bus' | 'bike';

function pick1(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

function LabeledInput({
  label,
  name,
  defaultValue
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-[11px] leading-4 text-slate-600 md:text-[12px]">{label}</div>
      <input
        name={name}
        defaultValue={defaultValue}
        className="h-9 w-full rounded-[8px] border border-black/10 bg-white px-3 text-[13px] outline-none transition focus:border-slate-400 md:h-10"
      />
    </label>
  );
}

function TypeButton({
  active,
  icon,
  label,
  onClick,
  orientation
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  orientation: 'vertical' | 'horizontal';
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={
        (orientation === 'vertical' ? 'h-[54px] w-[74px]' : 'h-[54px] flex-1') +
        ' flex items-center justify-center border-black/5 transition ' +
        (orientation === 'vertical' ? ' border-b last:border-b-0 ' : ' border-r last:border-r-0 ') +
        (active ? 'bg-[#b7c0cf]' : 'bg-[#cfd5df] hover:bg-[#c3cad6]')
      }
    >
      {icon}
    </button>
  );
}

export function SearchPrototypeForm({
  cta,
  initial
}: {
  cta: string;
  initial?: Record<string, string | string[] | undefined>;
}) {
  const initType = (pick1(initial?.type) as VehicleTypeKey) || 'car';
  const [type, setType] = React.useState<VehicleTypeKey>(initType);

  return (
    <form action="/search" method="GET">
      <input type="hidden" name="type" value={type} />

      <div className="hidden md:block">
        <div className="mx-auto max-w-[960px] overflow-hidden rounded-[12px] bg-[#f5f5f5] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="flex items-stretch">
            <div className="w-[74px] overflow-hidden rounded-l-[12px] bg-[#cfd5df]">
              <div className="flex flex-col">
                <TypeButton orientation="vertical" active={type === 'car'} label="Авто" onClick={() => setType('car')} icon={<Car className="h-6 w-6 text-slate-700" />} />
                <TypeButton orientation="vertical" active={type === 'truck'} label="Груз." onClick={() => setType('truck')} icon={<Truck className="h-6 w-6 text-slate-700" />} />
                <TypeButton orientation="vertical" active={type === 'bus'} label="Вэн" onClick={() => setType('bus')} icon={<Bus className="h-6 w-6 text-slate-700" />} />
                <TypeButton orientation="vertical" active={type === 'bike'} label="Мото" onClick={() => setType('bike')} icon={<Bike className="h-6 w-6 text-slate-700" />} />
              </div>
            </div>

            <div className="flex-1 p-6">
              <div className="grid grid-cols-4 gap-x-4 gap-y-4">
                <LabeledInput label="Марка" name="brand" defaultValue={pick1(initial?.brand)} />
                <LabeledInput label="Модель" name="model" defaultValue={pick1(initial?.model)} />
                <LabeledInput label="Год выпуска" name="year" defaultValue={pick1(initial?.year)} />
                <LabeledInput label="Километраж" name="mileageKm" defaultValue={pick1(initial?.mileageKm)} />
                <LabeledInput label="Тип топлива" name="fuel" defaultValue={pick1(initial?.fuel)} />
                <LabeledInput label="Город" name="city" defaultValue={pick1(initial?.city)} />
                <LabeledInput label="Цена от" name="priceFrom" defaultValue={pick1(initial?.priceFrom)} />
                <LabeledInput label="Цена до" name="priceTo" defaultValue={pick1(initial?.priceTo)} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="submit"
            className="flex h-11 min-w-[124px] items-center justify-center rounded-[8px] bg-[#7f889c] px-8 text-[14px] font-medium text-white transition hover:bg-[#737c90]"
          >
            {cta}
          </button>
        </div>
      </div>

      <div className="md:hidden">
        <div className="mx-auto max-w-md overflow-hidden rounded-[12px] bg-[#f5f5f5] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="flex w-full overflow-hidden rounded-t-[12px] bg-[#cfd5df]">
            <TypeButton orientation="horizontal" active={type === 'car'} label="Авто" onClick={() => setType('car')} icon={<Car className="h-6 w-6 text-slate-700" />} />
            <TypeButton orientation="horizontal" active={type === 'truck'} label="Груз." onClick={() => setType('truck')} icon={<Truck className="h-6 w-6 text-slate-700" />} />
            <TypeButton orientation="horizontal" active={type === 'bus'} label="Вэн" onClick={() => setType('bus')} icon={<Bus className="h-6 w-6 text-slate-700" />} />
            <TypeButton orientation="horizontal" active={type === 'bike'} label="Мото" onClick={() => setType('bike')} icon={<Bike className="h-6 w-6 text-slate-700" />} />
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <LabeledInput label="Марка" name="brand" defaultValue={pick1(initial?.brand)} />
              <LabeledInput label="Модель" name="model" defaultValue={pick1(initial?.model)} />
              <LabeledInput label="Год выпуска" name="year" defaultValue={pick1(initial?.year)} />
              <LabeledInput label="Километраж" name="mileageKm" defaultValue={pick1(initial?.mileageKm)} />
              <LabeledInput label="Тип топлива" name="fuel" defaultValue={pick1(initial?.fuel)} />
              <LabeledInput label="Город" name="city" defaultValue={pick1(initial?.city)} />
              <LabeledInput label="Цена от" name="priceFrom" defaultValue={pick1(initial?.priceFrom)} />
              <LabeledInput label="Цена до" name="priceTo" defaultValue={pick1(initial?.priceTo)} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="submit"
            className="flex h-11 min-w-[124px] items-center justify-center rounded-[8px] bg-[#7f889c] px-8 text-[14px] font-medium text-white transition hover:bg-[#737c90]"
          >
            {cta}
          </button>
        </div>
      </div>
    </form>
  );
}