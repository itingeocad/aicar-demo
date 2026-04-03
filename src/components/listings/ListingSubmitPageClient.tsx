'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, Plus, UploadCloud, X } from 'lucide-react';
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

  const modelOptions = useMemo(() => {
    if (!catalog) return [];
    return catalog.models.filter((x) => x.brandId === form.brandId);
  }, [catalog, form.brandId]);

  const selectedBrandLabel = useMemo(
    () => (catalog ? optionLabel(catalog.brands, form.brandId) : ''),
    [catalog, form.brandId]
  );

  const selectedModelLabel = useMemo(
    () => (catalog ? optionLabel(modelOptions, form.modelId) : ''),
    [catalog, modelOptions, form.modelId]
  );

  const selectedRegionLabel = useMemo(
    () => (catalog ? optionLabel(catalog.regions, form.regionId) : ''),
    [catalog, form.regionId]
  );

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

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
  const drivetrainOptions = catalog?.drivetrains || [];
  const fuelOptions = catalog?.fuelTypes || [];
  const transmissionOptions = catalog?.transmissions || [];
  const engineOptions = catalog?.engines || [];
  const regionOptions = catalog?.regions || [];
  const currencyOptions = catalog?.currencies || [];
  const brandOptions = catalog?.brands || [];

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
              <div className="text-center">
                <div className="text-[28px] font-medium text-slate-900 md:hidden">Анкета объявления</div>
              </div>

              <div className="mt-2 md:mt-0">
                <div className="text-center text-[22px] font-medium text-slate-900 md:text-[28px]">
                  Тип объявления
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 md:mx-auto md:max-w-[720px] md:gap-8">
                  {typeOptions.map((item) => {
                    const active = form.listingType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setField('listingType', item.id)}
                        className="flex flex-col items-center"
                      >
                        <span
                          className={`flex h-[88px] w-[88px] items-center justify-center rounded-full border text-center text-[13px] transition md:h-[120px] md:w-[120px] md:text-[15px] ${
                            active
                              ? 'border-black bg-black text-white'
                              : 'border-black/10 bg-[#d9d9d9] text-slate-800'
                          }`}
                        >
                          {item.label}
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
                    const active = form.vehicleCategory === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setField('vehicleCategory', item.id)}
                        className="flex flex-col items-center"
                      >
                        <span
                          className={`flex h-[88px] w-[88px] items-center justify-center rounded-full border px-2 text-center text-[13px] transition md:h-[120px] md:w-[120px] md:text-[15px] ${
                            active
                              ? 'border-black bg-black text-white'
                              : 'border-black/10 bg-[#d9d9d9] text-slate-800'
                          }`}
                        >
                          {item.label}
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
                        {brandOptions.map((item) => (
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
                        {drivetrainOptions.map((item) => (
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
                        {fuelOptions.map((item) => (
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
                        {transmissionOptions.map((item) => (
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
                        {engineOptions.map((item) => (
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

                      {clips.length > 0 ? (
                        <div className="space-y-3">
                          {clips.slice(0, 6).map((clip) => {
                            const selected = form.linkedClipIds.includes(clip.id);
                            const thumb = clip.posterUrl || clip.videoUrl || '';

                            return (
                              <button
                                key={clip.id}
                                type="button"
                                onClick={() => toggleClip(clip.id)}
                                className={`flex w-full items-center gap-3 rounded-[16px] border px-3 py-3 text-left transition ${
                                  selected
                                    ? 'border-black bg-black text-white'
                                    : 'border-black/10 bg-white text-slate-900'
                                }`}
                              >
                                <div className="h-14 w-14 overflow-hidden rounded-[10px] bg-[#d9d9d9]">
                                  {thumb ? (
                                    <img src={thumb} alt={clip.title} className="h-full w-full object-cover" />
                                  ) : null}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="line-clamp-1 text-[14px] font-medium">{clip.title}</div>
                                  <div className={`mt-1 text-[12px] ${selected ? 'text-white/80' : 'text-slate-500'}`}>
                                    {clip.ownerProfile?.displayName || clip.ownerDisplayName}
                                  </div>
                                </div>

                                {selected ? <Check className="h-4 w-4 shrink-0" /> : null}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-[16px] bg-white px-4 py-4 text-[14px] text-slate-600">
                          У вас пока нет AIClips для привязки.
                        </div>
                      )}
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
    </section>
  );
}