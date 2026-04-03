'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ListingView } from '@/lib/listings/types';

type FilterMode = 'pending' | 'all' | 'approved' | 'rejected' | 'unpublished' | 'draft';

function cls(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(' ');
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('aicar_session_token') || ''
      : '';

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

function statusLabel(status: string | undefined) {
  switch (status) {
    case 'approved':
      return 'Опубликовано';
    case 'pending':
      return 'На модерации';
    case 'rejected':
      return 'Отклонено';
    case 'unpublished':
      return 'Снято с публикации';
    case 'draft':
      return 'Черновик';
    default:
      return 'Не задано';
  }
}

function statusClass(status: string | undefined) {
  switch (status) {
    case 'approved':
      return 'bg-emerald-100 text-emerald-800';
    case 'pending':
      return 'bg-amber-100 text-amber-800';
    case 'rejected':
      return 'bg-rose-100 text-rose-800';
    case 'unpublished':
      return 'bg-slate-200 text-slate-800';
    case 'draft':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function formatPrice(item: ListingView) {
  const amount = item.priceAmount ?? item.price;
  const currency = item.priceCurrency || item.currency || '';
  if (amount == null) return 'Цена не указана';
  return `${amount} ${currency}`.trim();
}

export function ListingsModerationCard() {
  const [items, setItems] = useState<ListingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [status, setStatus] = useState('');
  const [filter, setFilter] = useState<FilterMode>('pending');

  async function load() {
    try {
      setLoading(true);
      const res = await fetchJSON<{ ok: true; listings: ListingView[] }>('/api/admin/listings');
      setItems(res.listings || []);
      setStatus('');
    } catch (e) {
      setStatus(`Ошибка: ${String((e as any)?.message || e)}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((x) => (x.moderationStatus || 'draft') === filter);
  }, [items, filter]);

  async function moderate(id: string, action: 'approve' | 'reject' | 'unpublish' | 'republish') {
    try {
      setBusyId(id);
      setStatus(
        action === 'approve' || action === 'republish'
          ? 'Одобрение объявления…'
          : action === 'reject'
            ? 'Отклонение объявления…'
            : 'Снятие с публикации…'
      );

      const res = await fetchJSON<{ ok: true; listing: ListingView }>(`/api/admin/listings/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action })
      });

      setItems((prev) => prev.map((item) => (item.id === id ? res.listing : item)));
      setStatus('Статус объявления обновлён ✅');
    } catch (e) {
      setStatus(`Ошибка: ${String((e as any)?.message || e)}`);
    } finally {
      setBusyId('');
    }
  }

  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">Модерация объявлений</div>
          <div className="mt-1 text-xs text-slate-500">
            Одобрение, отклонение и снятие объявлений с публикации
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            ['pending', 'На модерации'],
            ['approved', 'Опубликованные'],
            ['unpublished', 'Снятые'],
            ['rejected', 'Отклонённые'],
            ['draft', 'Черновики'],
            ['all', 'Все']
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id as FilterMode)}
              className={cls(
                'rounded-full px-3 py-1.5 text-xs transition',
                filter === id ? 'bg-slate-900 text-white' : 'border bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              {label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => void load()}
            className="rounded-full border px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
          >
            Обновить
          </button>
        </div>
      </div>

      {status ? (
        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{status}</div>
      ) : null}

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="rounded-xl border bg-slate-50 px-4 py-6 text-sm text-slate-600">Загрузка объявлений…</div>
        ) : filtered.length > 0 ? (
          filtered.map((item) => {
            const itemStatus = item.moderationStatus || 'draft';
            const isBusy = busyId === item.id;

            return (
              <div key={item.id} className="rounded-2xl border bg-white p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-base font-semibold text-slate-900">{item.title || 'Без названия'}</div>
                      <span className={cls('rounded-full px-2.5 py-1 text-xs font-medium', statusClass(itemStatus))}>
                        {statusLabel(itemStatus)}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                      <span>Владелец: {item.ownerProfile?.displayName || item.ownerDisplayName || item.ownerUid}</span>
                      <span>{item.brand || item.brandId || 'Марка не указана'} {item.model || item.modelId || ''}</span>
                      <span>{item.year || 'Год не указан'}</span>
                      <span>{formatPrice(item)}</span>
                      <span>{item.city || item.regionId || 'Регион не указан'}</span>
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                      Создано: {new Date(item.createdAt).toLocaleString('ru-RU')}
                    </div>

                    {item.description ? (
                      <div className="mt-3 line-clamp-2 text-sm text-slate-700">{item.description}</div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:max-w-[360px] lg:justify-end">
                    {(itemStatus === 'pending' || itemStatus === 'rejected' || itemStatus === 'unpublished' || itemStatus === 'draft') ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void moderate(item.id, itemStatus === 'unpublished' ? 'republish' : 'approve')}
                        className="rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {itemStatus === 'unpublished' ? 'Вернуть в публикацию' : 'Одобрить'}
                      </button>
                    ) : null}

                    {itemStatus === 'approved' ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void moderate(item.id, 'unpublish')}
                        className="rounded-xl border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                      >
                        Снять с публикации
                      </button>
                    ) : null}

                    {itemStatus !== 'rejected' ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void moderate(item.id, 'reject')}
                        className="rounded-xl border border-rose-200 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                      >
                        Отклонить
                      </button>
                    ) : null}

                    <a
                      href={`/submit-listing?id=${encodeURIComponent(item.id)}`}
                      className="rounded-xl border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Открыть
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border bg-slate-50 px-4 py-6 text-sm text-slate-600">
            По выбранному фильтру объявлений пока нет.
          </div>
        )}
      </div>
    </section>
  );
}