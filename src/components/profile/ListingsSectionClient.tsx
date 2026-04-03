'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit3, Loader2, MessageSquareOff, Plus, Save } from 'lucide-react';
import type { ListingView } from '@/lib/listings/types';
import type { TargetCommentsPolicyDoc } from '@/lib/comments/types';

type ListingPolicyMap = Record<string, TargetCommentsPolicyDoc | undefined>;

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

function ListingCard({
  listing,
  policy,
  busy,
  onEdit,
  onToggleComments
}: {
  listing: ListingView;
  policy?: TargetCommentsPolicyDoc;
  busy?: boolean;
  onEdit: (listing: ListingView) => void;
  onToggleComments: (listing: ListingView, nextEnabled: boolean) => void;
}) {
  const thumb = listing.coverUrl || listing.imageUrls?.[0] || '';
  const commentsEnabled = policy?.enabled !== false;

  return (
    <article className="rounded-[18px] bg-[#f4f4f4] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-[120px_1fr] gap-4 md:grid-cols-[160px_1fr]">
        <div className="overflow-hidden rounded-[10px] bg-white">
          {thumb ? (
            <img src={thumb} alt={listing.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-[120px] items-center justify-center text-sm text-slate-500">
              Нет фото
            </div>
          )}
        </div>

        <div>
          <h3 className="text-[18px] font-semibold leading-[1.1] text-slate-900">{listing.title}</h3>

          <div className="mt-2 flex flex-wrap gap-2 text-[12px] text-slate-600">
            {listing.brand ? <span>{listing.brand}</span> : null}
            {listing.model ? <span>{listing.model}</span> : null}
            {listing.year ? <span>{listing.year}</span> : null}
            {listing.city ? <span>{listing.city}</span> : null}
            {listing.price ? <span>{listing.currency || 'EUR'} {listing.price.toLocaleString('ru-RU')}</span> : null}
            <span>{listing.visibility}</span>
          </div>

          {listing.description ? (
            <div className="mt-3 line-clamp-3 text-[14px] leading-[1.4] text-slate-700">
              {listing.description}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => window.location.assign(`/submit-listing?id=${encodeURIComponent(listing.id)}`)}
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[13px] text-white disabled:opacity-60"
            >
              <Edit3 className="h-4 w-4" />
              Изменить
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => onToggleComments(listing, !commentsEnabled)}
              className="inline-flex items-center gap-2 rounded-full bg-[#e8e8e8] px-4 py-2 text-[13px] text-slate-900 disabled:opacity-60"
            >
              <MessageSquareOff className="h-4 w-4" />
              {commentsEnabled ? 'Отключить комментарии' : 'Включить комментарии'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ListingsSectionClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [listings, setListings] = useState<ListingView[]>([]);
  const [policies, setPolicies] = useState<ListingPolicyMap>({});
  const [editingId, setEditingId] = useState('');
  const [draft, setDraft] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'EUR',
    city: '',
    brand: '',
    model: '',
    year: '',
    coverUrl: '',
    imageUrls: '',
    visibility: 'public' as 'public' | 'draft'
  });

  async function loadAll() {
    setLoading(true);
    try {
      const mine = await fetchAuthJSON<{ ok: true; listings: ListingView[] }>('/api/listings/mine');
      const rows = mine.listings || [];
      setListings(rows);

      const entries = await Promise.all(
        rows.map(async (item) => {
          try {
            const data = await fetchAuthJSON<{ ok: true; policy: TargetCommentsPolicyDoc }>(
              `/api/listings/${encodeURIComponent(item.id)}/comments-policy`
            );
            return [item.id, data.policy] as const;
          } catch {
            return [item.id, undefined] as const;
          }
        })
      );

      setPolicies(Object.fromEntries(entries));
      setStatus('');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка загрузки объявлений'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  function resetDraft() {
    setEditingId('');
    setDraft({
      title: '',
      description: '',
      price: '',
      currency: 'EUR',
      city: '',
      brand: '',
      model: '',
      year: '',
      coverUrl: '',
      imageUrls: '',
      visibility: 'public'
    });
  }

  function openCreate() {
    resetDraft();
    setOpen(true);
  }

  function openEdit(listing: ListingView) {
    setEditingId(listing.id);
    setDraft({
      title: listing.title || '',
      description: listing.description || '',
      price: listing.price == null ? '' : String(listing.price),
      currency: listing.currency || 'EUR',
      city: listing.city || '',
      brand: listing.brand || '',
      model: listing.model || '',
      year: listing.year == null ? '' : String(listing.year),
      coverUrl: listing.coverUrl || '',
      imageUrls: (listing.imageUrls || []).join('\n'),
      visibility: listing.visibility === 'draft' ? 'draft' : 'public'
    });
    setOpen(true);
  }

  async function saveListing() {
    try {
      setSaving(true);
      setStatus(editingId ? 'Сохранение объявления…' : 'Создание объявления…');

      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        price: draft.price ? Number(draft.price) : undefined,
        currency: draft.currency.trim() || 'EUR',
        city: draft.city.trim(),
        brand: draft.brand.trim(),
        model: draft.model.trim(),
        year: draft.year ? Number(draft.year) : undefined,
        coverUrl: draft.coverUrl.trim(),
        imageUrls: draft.imageUrls
          .split(/\r?\n/)
          .map((x) => x.trim())
          .filter(Boolean),
        visibility: draft.visibility
      };

      if (!payload.title) {
        setStatus('Укажите заголовок объявления');
        return;
      }

      if (editingId) {
        const res = await fetchAuthJSON<{ ok: true; listing: ListingView }>(`/api/listings/${encodeURIComponent(editingId)}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });

        setListings((prev) => prev.map((x) => (x.id === editingId ? res.listing : x)));
        setStatus('Объявление обновлено ✅');
      } else {
        const res = await fetchAuthJSON<{ ok: true; listing: ListingView }>('/api/listings', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });

        setListings((prev) => [res.listing, ...prev]);
        setPolicies((prev) => ({ ...prev, [res.listing.id]: undefined }));
        setStatus('Объявление создано ✅');
      }

      setOpen(false);
      resetDraft();
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка сохранения объявления'));
    } finally {
      setSaving(false);
    }
  }

  async function toggleComments(listing: ListingView, nextEnabled: boolean) {
    try {
      setBusyId(listing.id);
      setStatus(nextEnabled ? 'Включение комментариев…' : 'Отключение комментариев…');

      const res = await fetchAuthJSON<{ ok: true; policy: TargetCommentsPolicyDoc }>(
        `/api/listings/${encodeURIComponent(listing.id)}/comments-policy`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ enabled: nextEnabled })
        }
      );

      setPolicies((prev) => ({ ...prev, [listing.id]: res.policy }));
      setStatus(nextEnabled ? 'Комментарии включены ✅' : 'Комментарии отключены ✅');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка изменения комментариев'));
    } finally {
      setBusyId('');
    }
  }

  const myCount = useMemo(() => listings.length, [listings]);

  return (
    <section className="mt-[54px] md:mt-[90px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[28px] font-medium text-slate-900 md:text-[36px]">Объявления</h2>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#f1f1f1] px-4 py-2 text-[13px] text-slate-700">
            Моих объявлений: {myCount}
          </span>

          <button
            type="button"
            onClick={() => window.location.assign('/submit-listing')}
            className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-[14px] font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Создать объявление
          </button>
        </div>
      </div>

      {open ? (
        <div className="mt-6 rounded-[22px] bg-[#f4f4f4] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.05)] md:p-6">
          <div className="mb-4 text-[18px] font-semibold text-slate-900 md:text-[22px]">
            {editingId ? 'Редактировать объявление' : 'Новое объявление'}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <div className="mb-2 text-[13px] text-slate-700">Заголовок</div>
              <input
                value={draft.title}
                onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
              />
            </label>

            <label className="block">
              <div className="mb-2 text-[13px] text-slate-700">Видимость</div>
              <select
                value={draft.visibility}
                onChange={(e) => setDraft((prev) => ({ ...prev, visibility: e.target.value === 'draft' ? 'draft' : 'public' }))}
                className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
              >
                <option value="public">public</option>
                <option value="draft">draft</option>
              </select>
            </label>

            <label className="block">
              <div className="mb-2 text-[13px] text-slate-700">Цена</div>
              <input
                value={draft.price}
                onChange={(e) => setDraft((prev) => ({ ...prev, price: e.target.value }))}
                className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
              />
            </label>

            <label className="block">
              <div className="mb-2 text-[13px] text-slate-700">Валюта</div>
              <input
                value={draft.currency}
                onChange={(e) => setDraft((prev) => ({ ...prev, currency: e.target.value }))}
                className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
              />
            </label>

            <label className="block">
              <div className="mb-2 text-[13px] text-slate-700">Марка</div>
              <input
                value={draft.brand}
                onChange={(e) => setDraft((prev) => ({ ...prev, brand: e.target.value }))}
                className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
              />
            </label>

            <label className="block">
              <div className="mb-2 text-[13px] text-slate-700">Модель</div>
              <input
                value={draft.model}
                onChange={(e) => setDraft((prev) => ({ ...prev, model: e.target.value }))}
                className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
              />
            </label>

            <label className="block">
              <div className="mb-2 text-[13px] text-slate-700">Город</div>
              <input
                value={draft.city}
                onChange={(e) => setDraft((prev) => ({ ...prev, city: e.target.value }))}
                className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
              />
            </label>

            <label className="block">
              <div className="mb-2 text-[13px] text-slate-700">Год</div>
              <input
                value={draft.year}
                onChange={(e) => setDraft((prev) => ({ ...prev, year: e.target.value }))}
                className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
              />
            </label>

            <label className="block md:col-span-2">
              <div className="mb-2 text-[13px] text-slate-700">Cover URL</div>
              <input
                value={draft.coverUrl}
                onChange={(e) => setDraft((prev) => ({ ...prev, coverUrl: e.target.value }))}
                className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
              />
            </label>

            <label className="block md:col-span-2">
              <div className="mb-2 text-[13px] text-slate-700">Фото (по одному URL на строку)</div>
              <textarea
                value={draft.imageUrls}
                onChange={(e) => setDraft((prev) => ({ ...prev, imageUrls: e.target.value }))}
                rows={4}
                className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
              />
            </label>

            <label className="block md:col-span-2">
              <div className="mb-2 text-[13px] text-slate-700">Описание</div>
              <textarea
                value={draft.description}
                onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
                rows={5}
                className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveListing}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-[14px] font-medium text-white disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editingId ? 'Сохранить объявление' : 'Создать объявление'}
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                resetDraft();
                setStatus('');
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#e8e8e8] px-5 py-3 text-[14px] font-medium text-slate-900"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : null}

      {status ? (
        <div className="mt-5 rounded-[16px] bg-[#f4f4f4] px-4 py-3 text-[14px] text-slate-800">
          {status}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 text-[15px] text-slate-700">Загрузка объявлений…</div>
      ) : listings.length > 0 ? (
        <div className="mt-6 space-y-4">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              policy={policies[listing.id]}
              busy={busyId === listing.id}
              onEdit={openEdit}
              onToggleComments={toggleComments}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[18px] bg-[#f4f4f4] px-5 py-5 text-[15px] text-slate-700">
          У вас пока нет объявлений.
        </div>
      )}
    </section>
  );
}