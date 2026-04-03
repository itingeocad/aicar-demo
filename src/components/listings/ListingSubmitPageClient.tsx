'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bike,
  Car,
  CarFront,
  Check,
  Clock3,
  Loader2,
  PackageCheck,
  Plus,
  Search,
  Truck,
  X
} from 'lucide-react';
import type { AIClipView } from '@/lib/aiclips/types';
import type { ListingCatalog, ListingView } from '@/lib/listings/types';

type CatalogResponse = {
  ok: true;
  catalog: ListingCatalog;
};

type ClipsResponse = {
  ok: true;
  clips: AIClipView[];
};

type ListingResponse = {
  ok: true;
  listing: ListingView;
};

type FormState = {
  listingType: string;
  vehicleCategory: string;
  brandId: string;
  modelId: string;
  mileageKm: string;
  year: string;
  drivetrain: string;
  fuelType: string;
  transmission: string;
  engine: string;
  regionId: string;
  description: string;
  priceAmount: string;
  priceCurrency: string;
  linkedClipIds: string[];
};

const CATEGORY_RULES: Record<
  string,
  {
    brands: string[];
    drivetrains: string[];
    fuelTypes: string[];
    transmissions: string[];
    engines: string[];
  }
> = {
  car: {
    brands: ['bmw', 'mercedes', 'audi', 'toyota', 'byd', 'tesla', 'volkswagen', 'ford'],
    drivetrains: ['fwd', 'rwd', 'awd'],
    fuelTypes: ['petrol', 'diesel', 'hybrid', 'plugin_hybrid', 'electric', 'lpg'],
    transmissions: ['manual', 'automatic', 'cvt', 'robot'],
    engines: ['1_0', '1_2', '1_4', '1_5', '1_6', '2_0', '2_5', '3_0', 'ev']
  },
  suv: {
    brands: ['bmw', 'mercedes', 'audi', 'toyota', 'byd', 'tesla', 'volkswagen', 'ford'],
    drivetrains: ['fwd', 'awd', '4wd'],
    fuelTypes: ['petrol', 'diesel', 'hybrid', 'plugin_hybrid', 'electric', 'lpg'],
    transmissions: ['manual', 'automatic', 'cvt', 'robot'],
    engines: ['1_4', '1_5', '1_6', '2_0', '2_5', '3_0', 'ev']
  },
  truck: {
    brands: ['ford', 'mercedes', 'volkswagen'],
    drivetrains: ['rwd', 'awd', '4wd'],
    fuelTypes: ['diesel', 'petrol', 'electric'],
    transmissions: ['manual', 'automatic', 'robot'],
    engines: ['2_0', '2_5', '3_0', 'ev']
  },
  motorcycle: {
    brands: ['bmw_moto', 'yamaha', 'honda_moto', 'kawasaki'],
    drivetrains: ['rwd'],
    fuelTypes: ['petrol', 'electric'],
    transmissions: ['manual', 'automatic'],
    engines: ['0_5', '0_7', '0_9', 'ev']
  }
};

const MODEL_RULES: Record<string, string[]> = {
  car: ['bmw_5', 'mercedes_e', 'audi_a6', 'toyota_camry', 'byd_seal', 'tesla_model3', 'vw_golf'],
  suv: ['bmw_x5', 'mercedes_gle', 'audi_q7', 'toyota_rav4', 'byd_song', 'tesla_modely', 'vw_tiguan', 'ford_kuga'],
  truck: ['ford_ranger'],
  motorcycle: ['bmw_f900gs', 'yamaha_mt07', 'honda_cb500x', 'kawasaki_ninja650']
};

const TYPE_UI: Record<string, { label: string; Icon: any }> = {
  in_stock: { label: 'В наличии', Icon: PackageCheck },
  in_transit: { label: 'В пути', Icon: Truck },
  on_order: { label: 'Под заказ', Icon: Clock3 }
};

const CATEGORY_UI: Record<string, { label: string; Icon: any }> = {
  car: { label: 'Легковой автомобиль', Icon: Car },
  suv: { label: 'SUV', Icon: CarFront },
  truck: { label: 'Грузовой автомобиль', Icon: Truck },
  motorcycle: { label: 'Мотоцикл', Icon: Bike }
};

function authToken() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('aicar_session_token') || '';
}

async function fetchAuthJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const token = authToken();
  const headers = new Headers(init?.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
    ...init,
    headers
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any)?.error || `HTTP ${res.status}`);
  }

  return data as T;
}

function buildLoginTarget() {
  if (typeof window === 'undefined') return '/login';
  const next = window.location.pathname + window.location.search;
  return `/login?next=${encodeURIComponent(next)}`;
}

async function uploadListingImage(file: File): Promise<string> {
  const token = authToken();
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const formData = new FormData();
  formData.append('kind', 'cover');
  formData.append('file', file);

  const res = await fetch('/api/media/upload', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: formData
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any)?.error || `HTTP ${res.status}`);
  }

  const url = String((data as any)?.url || '').trim();
  if (!url) {
    throw new Error('Не удалось загрузить изображение');
  }

  return url;
}

function optionLabel(items: { id: string; label: string }[], id: string): string {
  return items.find((x) => x.id === id)?.label || '';
}

function numericOrUndefined(value: string): number | undefined {
  const v = String(value || '').trim();
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function clipDateValue(clip: AIClipView): number {
  const raw = String((clip as any)?.createdAt || '');
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : 0;
}

function clipDescription(clip: AIClipView): string {
  return String((clip as any)?.description || '');
}

function FileSlot({
  index,
  imageUrl,
  uploading,
  onPick,
  onClear
}: {
  index: number;
  imageUrl: string;
  uploading: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[12px] bg-[#d9d9d9] text-slate-700"
      >
        {imageUrl ? (
          <img src={imageUrl} alt={`Фото ${index + 1}`} className="h-full w-full object-cover" />
        ) : uploading ? (
          <Loader2 className="h-7 w-7 animate-spin" />
        ) : (
          <Plus className="h-8 w-8" strokeWidth={1.5} />
        )}
      </button>

      {imageUrl ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white"
          aria-label="Удалить фото"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.currentTarget.value = '';
        }}
      />
    </div>
  );
}

export function ListingSubmitPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = String(searchParams.get('id') || '').trim();
  const isEdit = Boolean(listingId);

  const [catalog, setCatalog] = useState<ListingCatalog | null>(null);
  const [clips, setClips] = useState<AIClipView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['', '', '', '']);
  const [clipModalOpen, setClipModalOpen] = useState(false);
  const [clipSearch, setClipSearch] = useState('');
  const [clipSort, setClipSort] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [clipDateFilter, setClipDateFilter] = useState<'all' | '7' | '30' | '365'>('all');

  const [form, setForm] = useState<FormState>({
    listingType: 'in_stock',
    vehicleCategory: 'car',
    brandId: '',
    modelId: '',
    mileageKm: '',
    year: '',
    drivetrain: '',
    fuelType: '',
    transmission: '',
    engine: '',
    regionId: '',
    description: '',
    priceAmount: '',
    priceCurrency: 'EUR',
    linkedClipIds: []
  });

  const categoryRule = useMemo(
    () => CATEGORY_RULES[form.vehicleCategory] || CATEGORY_RULES.car,
    [form.vehicleCategory]
  );

  const filteredBrandOptions = useMemo(() => {
    if (!catalog) return [];
    return catalog.brands.filter((x) => categoryRule.brands.includes(x.id));
  }, [catalog, categoryRule]);

  const modelOptions = useMemo(() => {
    if (!catalog) return [];
    const allowedModels = MODEL_RULES[form.vehicleCategory] || MODEL_RULES.car;
    return catalog.models.filter(
      (x) => x.brandId === form.brandId && allowedModels.includes(x.id)
    );
  }, [catalog, form.brandId, form.vehicleCategory]);

  const filteredDrivetrainOptions = useMemo(() => {
    if (!catalog) return [];
    return catalog.drivetrains.filter((x) => categoryRule.drivetrains.includes(x.id));
  }, [catalog, categoryRule]);

  const filteredFuelOptions = useMemo(() => {
    if (!catalog) return [];
    return catalog.fuelTypes.filter((x) => categoryRule.fuelTypes.includes(x.id));
  }, [catalog, categoryRule]);

  const filteredTransmissionOptions = useMemo(() => {
    if (!catalog) return [];
    return catalog.transmissions.filter((x) => categoryRule.transmissions.includes(x.id));
  }, [catalog, categoryRule]);

  const filteredEngineOptions = useMemo(() => {
    if (!catalog) return [];
    return catalog.engines.filter((x) => categoryRule.engines.includes(x.id));
  }, [catalog, categoryRule]);

  const selectedBrandLabel = useMemo(
    () => (catalog ? optionLabel(catalog.brands, form.brandId) : ''),
    [catalog, form.brandId]
  );

  const selectedModelLabel = useMemo(
    () => optionLabel(modelOptions, form.modelId),
    [modelOptions, form.modelId]
  );

  const selectedRegionLabel = useMemo(
    () => (catalog ? optionLabel(catalog.regions, form.regionId) : ''),
    [catalog, form.regionId]
  );

  const selectedClips = useMemo(
    () => clips.filter((clip) => form.linkedClipIds.includes(clip.id)),
    [clips, form.linkedClipIds]
  );

  const filteredClips = useMemo(() => {
    let next = [...clips];

    const query = clipSearch.trim().toLowerCase();
    if (query) {
      next = next.filter((clip) => {
        const hay = `${clip.title} ${clipDescription(clip)}`.toLowerCase();
        return hay.includes(query);
      });
    }

    if (clipDateFilter !== 'all') {
      const days = Number(clipDateFilter);
      const since = Date.now() - days * 24 * 60 * 60 * 1000;
      next = next.filter((clip) => clipDateValue(clip) >= since);
    }

    if (clipSort === 'title') {
      next.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    } else if (clipSort === 'oldest') {
      next.sort((a, b) => clipDateValue(a) - clipDateValue(b));
    } else {
      next.sort((a, b) => clipDateValue(b) - clipDateValue(a));
    }

    return next;
  }, [clips, clipSearch, clipDateFilter, clipSort]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const [catalogRes, clipsRes] = await Promise.all([
          fetchAuthJSON<CatalogResponse>('/api/listings/catalog'),
          fetchAuthJSON<ClipsResponse>('/api/aiclips/mine').catch(() => ({ ok: true, clips: [] }))
        ]);

        if (!alive) return;

        setCatalog(catalogRes.catalog);
        setClips(clipsRes.clips || []);

        if (listingId) {
          const listingRes = await fetchAuthJSON<ListingResponse>(`/api/listings/${encodeURIComponent(listingId)}`);
          if (!alive) return;

          const listing = listingRes.listing;

          setForm({
            listingType: listing.listingType || 'in_stock',
            vehicleCategory: listing.vehicleCategory || 'car',
            brandId: listing.brandId || '',
            modelId: listing.modelId || '',
            mileageKm: listing.mileageKm == null ? '' : String(listing.mileageKm),
            year: listing.year == null ? '' : String(listing.year),
            drivetrain: listing.drivetrain || '',
            fuelType: listing.fuelType || '',
            transmission: listing.transmission || '',
            engine: listing.engine || '',
            regionId: listing.regionId || '',
            description: listing.description || '',
            priceAmount:
              listing.priceAmount == null && listing.price == null
                ? ''
                : String(listing.priceAmount ?? listing.price ?? ''),
            priceCurrency: listing.priceCurrency || listing.currency || 'EUR',
            linkedClipIds: Array.isArray(listing.linkedClipIds) ? listing.linkedClipIds : []
          });

          setImageUrls([
            listing.imageUrls?.[0] || '',
            listing.imageUrls?.[1] || '',
            listing.imageUrls?.[2] || '',
            listing.imageUrls?.[3] || ''
          ]);
        }

        setStatus('');
      } catch (e) {
        const message = String((e as any)?.message || e || 'Ошибка загрузки формы объявления');
        if (message === 'unauthorized' || message === 'HTTP 401') {
          window.location.assign(buildLoginTarget());
          return;
        }
        setStatus(message);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [listingId]);

  useEffect(() => {
    setForm((prev) => {
      let next = { ...prev };

      if (next.brandId && !filteredBrandOptions.some((x) => x.id === next.brandId)) {
        next.brandId = '';
        next.modelId = '';
      }

      if (next.modelId && !modelOptions.some((x) => x.id === next.modelId)) {
        next.modelId = '';
      }

      if (next.drivetrain && !filteredDrivetrainOptions.some((x) => x.id === next.drivetrain)) {
        next.drivetrain = '';
      }

      if (next.fuelType && !filteredFuelOptions.some((x) => x.id === next.fuelType)) {
        next.fuelType = '';
      }

      if (next.transmission && !filteredTransmissionOptions.some((x) => x.id === next.transmission)) {
        next.transmission = '';
      }

      if (next.engine && !filteredEngineOptions.some((x) => x.id === next.engine)) {
        next.engine = '';
      }

      return next;
    });
  }, [
    filteredBrandOptions,
    modelOptions,
    filteredDrivetrainOptions,
    filteredFuelOptions,
    filteredTransmissionOptions,
    filteredEngineOptions
  ]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setCategory(nextCategory: string) {
    setForm((prev) => ({
      ...prev,
      vehicleCategory: nextCategory,
      brandId: '',
      modelId: '',
      drivetrain: '',
      fuelType: '',
      transmission: '',
      engine: ''
    }));
  }

  function toggleClip(clipId: string) {
    setForm((prev) => ({
      ...prev,
      linkedClipIds: prev.linkedClipIds.includes(clipId)
        ? prev.linkedClipIds.filter((x) => x !== clipId)
        : [...prev.linkedClipIds, clipId]
    }));
  }

  async function handleImagePick(index: number, file: File) {
    try {
      setUploadingIndex(index);
      setStatus(`Загрузка фото ${index + 1}…`);

      const url = await uploadListingImage(file);
      setImageUrls((prev) => {
        const next = [...prev];
        next[index] = url;
        return next;
      });

      setStatus('Фото загружено ✅');
    } catch (e) {
      const message = String((e as any)?.message || e || 'Ошибка загрузки фото');
      if (message === 'Unauthorized' || message === 'unauthorized' || message === 'HTTP 401') {
        window.location.assign(buildLoginTarget());
        return;
      }
      setStatus(message);
    } finally {
      setUploadingIndex(null);
    }
  }

  async function saveListing() {
    if (!catalog) return;

    if (!form.brandId) {
      setStatus('Выберите марку');
      return;
    }
    if (!form.modelId) {
      setStatus('Выберите модель');
      return;
    }
    if (!form.priceAmount.trim()) {
      setStatus('Укажите цену');
      return;
    }
    if (!form.regionId) {
      setStatus('Выберите регион');
      return;
    }

    const title = [selectedBrandLabel, selectedModelLabel, form.year.trim()].filter(Boolean).join(' ') || 'Объявление';
    const cleanedImages = imageUrls.map((x) => String(x || '').trim()).filter(Boolean);

    const payload = {
      title,
      description: form.description.trim(),
      visibility: 'public',
      commentsEnabled: true,

      listingType: form.listingType as any,
      vehicleCategory: form.vehicleCategory as any,

      brandId: form.brandId,
      modelId: form.modelId,
      brand: selectedBrandLabel,
      model: selectedModelLabel,

      mileageKm: numericOrUndefined(form.mileageKm),
      year: numericOrUndefined(form.year),
      drivetrain: form.drivetrain,
      fuelType: form.fuelType,
      transmission: form.transmission,
      engine: form.engine,
      regionId: form.regionId,
      city: selectedRegionLabel,

      priceAmount: numericOrUndefined(form.priceAmount),
      priceCurrency: form.priceCurrency,
      price: numericOrUndefined(form.priceAmount),
      currency: form.priceCurrency,

      imageUrls: cleanedImages,
      coverUrl: cleanedImages[0] || '',
      linkedClipIds: form.linkedClipIds
    };

    try {
      setSaving(true);
      setStatus(isEdit ? 'Сохранение объявления…' : 'Подача объявления…');

      if (isEdit) {
        const res = await fetchAuthJSON<ListingResponse>(`/api/listings/${encodeURIComponent(listingId)}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });

        setStatus(
          res.listing.moderationStatus === 'approved'
            ? 'Объявление обновлено ✅'
            : 'Изменения сохранены. Объявление ожидает модерации ✅'
        );
      } else {
        const res = await fetchAuthJSON<ListingResponse>('/api/listings', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });

        setStatus('Объявление отправлено на модерацию ✅');
        router.replace(`/submit-listing?id=${encodeURIComponent(res.listing.id)}`);
      }
    } catch (e) {
      const message = String((e as any)?.message || e || 'Ошибка сохранения объявления');
      if (message === 'unauthorized' || message === 'HTTP 401') {
        window.location.assign(buildLoginTarget());
        return;
      }
      setStatus(message);
    } finally {
      setSaving(false);
    }
  }

  const typeOptions = catalog?.listingTypes || [];
  const categoryOptions = catalog?.vehicleCategories || [];
  const regionOptions = catalog?.regions || [];
  const currencyOptions = catalog?.currencies || [];

  return (
    <section className="bg-[#ececec]">
      <div className="flex min-h-[240px] items-center justify-center border-b border-black/5 bg-[#e3e3e3] px-4 text-center">
        <div>
          <h1 className="text-[34px] font-semibold leading-[1.05] text-slate-900 md:text-[56px]">
            Анкета объявления
          </h1>
          <div className="mt-4 text-[14px] text-slate-600 md:text-[16px]">
            {isEdit ? 'Редактирование объявления' : 'Подача нового объявления'}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-4 py-8 md:px-6 md:py-12">
        <div className="rounded-[28px] bg-[#f2f2f2] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] md:p-8">
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center text-slate-700">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="mt-2 md:mt-0">
                <div className="text-center text-[22px] font-medium text-slate-900 md:text-[28px]">
                  Тип объявления
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 md:mx-auto md:max-w-[720px] md:gap-8">
                  {typeOptions.map((item) => {
                    const ui = TYPE_UI[item.id] || { label: item.label, Icon: PackageCheck };
                    const active = form.listingType === item.id;
                    const Icon = ui.Icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setField('listingType', item.id)}
                        className="flex flex-col items-center"
                      >
                        <span
                          className={`flex h-[88px] w-[88px] items-center justify-center rounded-full border transition md:h-[120px] md:w-[120px] ${
                            active
                              ? 'border-black bg-black text-white'
                              : 'border-black/10 bg-[#d9d9d9] text-slate-700'
                          }`}
                        >
                          <Icon className="h-9 w-9 md:h-12 md:w-12" strokeWidth={1.8} />
                        </span>
                        <span className="mt-3 text-center text-[12px] text-slate-800 md:text-[14px]">
                          {ui.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 text-center text-[22px] font-medium text-slate-900 md:text-[28px]">
                  Категория
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-8">
                  {categoryOptions.map((item) => {
                    const ui = CATEGORY_UI[item.id] || { label: item.label, Icon: Car };
                    const active = form.vehicleCategory === item.id;
                    const Icon = ui.Icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCategory(item.id)}
                        className="flex flex-col items-center"
                      >
                        <span
                          className={`flex h-[88px] w-[88px] items-center justify-center rounded-full border transition md:h-[120px] md:w-[120px] ${
                            active
                              ? 'border-black bg-black text-white'
                              : 'border-black/10 bg-[#d9d9d9] text-slate-700'
                          }`}
                        >
                          <Icon className="h-9 w-9 md:h-12 md:w-12" strokeWidth={1.8} />
                        </span>
                        <span className="mt-3 text-center text-[12px] text-slate-800 md:text-[14px]">
                          {ui.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 rounded-[22px] bg-[#ececec] p-4 md:mt-10 md:p-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <label className="block">
                      <div className="mb-2 text-[15px] text-slate-900">Марка</div>
                      <select
                        value={form.brandId}
                        onChange={(e) => {
                          const nextBrandId = e.target.value;
                          setForm((prev) => ({
                            ...prev,
                            brandId: nextBrandId,
                            modelId: ''
                          }));
                        }}
                        className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                      >
                        <option value="">Выберите</option>
                        {filteredBrandOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <div className="mb-2 text-[15px] text-slate-900">Модель</div>
                      <select
                        value={form.modelId}
                        onChange={(e) => setField('modelId', e.target.value)}
                        disabled={!form.brandId}
                        className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none disabled:bg-slate-100"
                      >
                        <option value="">Выберите</option>
                        {modelOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <div className="mb-2 text-[15px] text-slate-900">Пробег</div>
                      <input
                        value={form.mileageKm}
                        onChange={(e) => setField('mileageKm', e.target.value)}
                        className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                        inputMode="numeric"
                      />
                    </label>

                    <label className="block">
                      <div className="mb-2 text-[15px] text-slate-900">Год</div>
                      <input
                        value={form.year}
                        onChange={(e) => setField('year', e.target.value)}
                        className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                        inputMode="numeric"
                      />
                    </label>

                    <label className="block">
                      <div className="mb-2 text-[15px] text-slate-900">Привод</div>
                      <select
                        value={form.drivetrain}
                        onChange={(e) => setField('drivetrain', e.target.value)}
                        className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                      >
                        <option value="">Выберите</option>
                        {filteredDrivetrainOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <div className="mb-2 text-[15px] text-slate-900">Тип топлива</div>
                      <select
                        value={form.fuelType}
                        onChange={(e) => setField('fuelType', e.target.value)}
                        className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                      >
                        <option value="">Выберите</option>
                        {filteredFuelOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <div className="mb-2 text-[15px] text-slate-900">КПП</div>
                      <select
                        value={form.transmission}
                        onChange={(e) => setField('transmission', e.target.value)}
                        className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                      >
                        <option value="">Выберите</option>
                        {filteredTransmissionOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <div className="mb-2 text-[15px] text-slate-900">Двигатель</div>
                      <select
                        value={form.engine}
                        onChange={(e) => setField('engine', e.target.value)}
                        className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                      >
                        <option value="">Выберите</option>
                        {filteredEngineOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block md:col-span-2">
                      <div className="mb-2 text-[15px] text-slate-900">Регион</div>
                      <select
                        value={form.regionId}
                        onChange={(e) => setField('regionId', e.target.value)}
                        className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                      >
                        <option value="">Выберите</option>
                        {regionOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 text-[15px] text-slate-900">Текст объявления</div>
                    <textarea
                      value={form.description}
                      onChange={(e) => setField('description', e.target.value)}
                      rows={8}
                      className="w-full rounded-[16px] border border-slate-300 bg-white px-4 py-3 outline-none"
                    />
                  </div>

                  <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
                    <div>
                      <div className="mb-2 text-[15px] text-slate-900">Фото</div>
                      <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                        {imageUrls.map((url, index) => (
                          <FileSlot
                            key={index}
                            index={index}
                            imageUrl={url}
                            uploading={uploadingIndex === index}
                            onPick={(file) => void handleImagePick(index, file)}
                            onClear={() =>
                              setImageUrls((prev) => {
                                const next = [...prev];
                                next[index] = '';
                                return next;
                              })
                            }
                          />
                        ))}
                      </div>
                      <div className="mt-3 text-[12px] text-slate-500">
                        В этой версии используются до 4 фото.
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[15px] text-slate-900">Выбрать AIClips</div>

                      <button
                        type="button"
                        onClick={() => setClipModalOpen(true)}
                        className="flex h-[112px] w-[112px] items-center justify-center rounded-[12px] bg-[#d9d9d9] text-slate-700"
                      >
                        <Plus className="h-9 w-9" strokeWidth={1.5} />
                      </button>

                      <div className="mt-3 text-[12px] text-slate-500">
                        {selectedClips.length > 0
                          ? `Выбрано AIClips: ${selectedClips.length}`
                          : 'Нажмите, чтобы выбрать AIClips'}
                      </div>

                      {selectedClips.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {selectedClips.slice(0, 4).map((clip) => (
                            <div
                              key={clip.id}
                              className="flex items-center gap-2 rounded-[12px] bg-white px-3 py-2 text-left"
                            >
                              <div className="h-10 w-10 overflow-hidden rounded-[10px] bg-[#d9d9d9]">
                                {clip.posterUrl || clip.videoUrl ? (
                                  <img
                                    src={clip.posterUrl || clip.videoUrl || ''}
                                    alt={clip.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : null}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="line-clamp-1 text-[13px] font-medium text-slate-900">{clip.title}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleClip(clip.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-black/5"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:max-w-[420px] md:grid-cols-[1fr_140px]">
                    <label className="block">
                      <div className="mb-2 text-[15px] text-slate-900">Цена</div>
                      <input
                        value={form.priceAmount}
                        onChange={(e) => setField('priceAmount', e.target.value)}
                        className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                        inputMode="numeric"
                      />
                    </label>

                    <label className="block">
                      <div className="mb-2 text-[15px] text-slate-900">Валюта</div>
                      <select
                        value={form.priceCurrency}
                        onChange={(e) => setField('priceCurrency', e.target.value)}
                        className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                      >
                        {currencyOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                {status ? (
                  <div className="mt-6 rounded-[16px] bg-white px-4 py-3 text-[14px] text-slate-800">
                    {status}
                  </div>
                ) : null}

                <div className="mt-8 flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void saveListing()}
                    disabled={saving || loading}
                    className="rounded-[12px] bg-[#9b9b9b] px-8 py-4 text-[15px] font-medium text-slate-900 disabled:opacity-60"
                  >
                    {saving ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Сохранение...
                      </span>
                    ) : isEdit ? (
                      'Сохранить объявление'
                    ) : (
                      'Подать объявление'
                    )}
                  </button>

                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] text-slate-700"
                  >
                    Назад в профиль
                  </Link>

                  <div className="text-center text-[12px] text-slate-500">
                    После отправки публичное объявление попадёт в очередь на модерацию.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {clipModalOpen ? (
        <>
          <button
            type="button"
            onClick={() => setClipModalOpen(false)}
            className="fixed inset-0 z-40 bg-black/45"
            aria-label="Закрыть выбор AIClips"
          />

          <div className="fixed inset-x-3 bottom-0 z-50 flex h-[82dvh] flex-col rounded-t-[24px] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.22)] md:inset-auto md:left-1/2 md:top-1/2 md:h-[78vh] md:w-[920px] md:max-w-[calc(100vw-48px)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[24px]">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 md:px-6">
              <div>
                <div className="text-[18px] font-semibold text-slate-900">Выбрать AIClips</div>
                <div className="text-[12px] text-slate-500">
                  Поиск по названию и описанию, сортировка и фильтр по дате публикации
                </div>
              </div>

              <button
                type="button"
                onClick={() => setClipModalOpen(false)}
                className="rounded-full p-2 text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-3 border-b border-slate-200 px-4 py-4 md:grid-cols-[1fr_180px_180px_auto] md:px-6">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={clipSearch}
                  onChange={(e) => setClipSearch(e.target.value)}
                  placeholder="Поиск по названию / описанию"
                  className="w-full rounded-[14px] border border-slate-300 bg-white py-3 pl-10 pr-4 outline-none"
                />
              </label>

              <select
                value={clipDateFilter}
                onChange={(e) => setClipDateFilter(e.target.value as any)}
                className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
              >
                <option value="all">Все даты</option>
                <option value="7">За 7 дней</option>
                <option value="30">За 30 дней</option>
                <option value="365">За год</option>
              </select>

              <select
                value={clipSort}
                onChange={(e) => setClipSort(e.target.value as any)}
                className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
              >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
                <option value="title">По названию</option>
              </select>

              <Link
                href="/profile"
                onClick={() => setClipModalOpen(false)}
                className="inline-flex items-center justify-center rounded-[14px] bg-black px-4 py-3 text-[14px] text-white"
              >
                Добавить AIClip
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
              {filteredClips.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredClips.map((clip) => {
                    const selected = form.linkedClipIds.includes(clip.id);
                    const thumb = clip.posterUrl || clip.videoUrl || '';
                    const published = clipDateValue(clip)
                      ? new Date(clipDateValue(clip)).toLocaleDateString('ru-RU')
                      : 'Дата не указана';

                    return (
                      <div
                        key={clip.id}
                        className={`rounded-[18px] border p-3 transition ${
                          selected ? 'border-black bg-black text-white' : 'border-slate-200 bg-white text-slate-900'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[12px] bg-[#d9d9d9]">
                            {thumb ? (
                              <img src={thumb} alt={clip.title} className="h-full w-full object-cover" />
                            ) : null}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="line-clamp-1 text-[15px] font-semibold">{clip.title}</div>
                            <div className={`mt-1 text-[12px] ${selected ? 'text-white/75' : 'text-slate-500'}`}>
                              {published}
                            </div>
                            <div className={`mt-2 line-clamp-2 text-[12px] ${selected ? 'text-white/80' : 'text-slate-600'}`}>
                              {clipDescription(clip) || 'Без описания'}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className={`text-[12px] ${selected ? 'text-white/80' : 'text-slate-500'}`}>
                            {clip.ownerProfile?.displayName || clip.ownerDisplayName}
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleClip(clip.id)}
                            className={`rounded-[12px] px-3 py-2 text-[13px] font-medium transition ${
                              selected
                                ? 'bg-white text-black'
                                : 'bg-black text-white'
                            }`}
                          >
                            {selected ? 'Убрать' : 'Добавить'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[16px] bg-slate-50 px-4 py-6 text-[14px] text-slate-600">
                  По вашему фильтру AIClips не найдены.
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 px-4 py-4 md:px-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-[14px] text-slate-700">
                  Выбрано AIClips: <span className="font-semibold">{selectedClips.length}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setClipModalOpen(false)}
                  className="rounded-[14px] bg-black px-5 py-3 text-[14px] text-white"
                >
                  Готово
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}