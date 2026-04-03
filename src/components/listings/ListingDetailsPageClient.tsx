'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageCircle,
  MessageSquareOff,
  X
} from 'lucide-react';
import type { ListingView } from '@/lib/listings/types';

type ListingComment = {
  id: string;
  authorDisplayName: string;
  text: string;
  createdAt: string;
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

function buildLoginTarget(listingId: string) {
  return `/login?next=${encodeURIComponent(`/listing/${listingId}`)}`;
}

function formatPrice(item: ListingView) {
  const amount = item.priceAmount ?? item.price;
  const currency = item.priceCurrency || item.currency || '';
  if (amount == null) return 'Цена не указана';
  return `${amount} ${currency}`.trim();
}

function valueLabel(kind: string | undefined) {
  const map: Record<string, string> = {
    in_stock: 'В наличии',
    in_transit: 'В пути',
    on_order: 'Под заказ',
    car: 'Легковой автомобиль',
    suv: 'SUV',
    truck: 'Грузовой автомобиль',
    motorcycle: 'Мотоцикл',
    fwd: 'Передний',
    rwd: 'Задний',
    awd: 'Полный AWD',
    '4wd': 'Полный 4WD',
    petrol: 'Бензин',
    diesel: 'Дизель',
    hybrid: 'Гибрид',
    plugin_hybrid: 'Plug-in Hybrid',
    electric: 'Электро',
    lpg: 'Газ / LPG',
    manual: 'Механика',
    automatic: 'Автомат',
    cvt: 'CVT',
    robot: 'Робот'
  };

  return map[String(kind || '')] || String(kind || '');
}

function attrEntries(listing: ListingView) {
  return [
    listing.listingType ? valueLabel(listing.listingType) : '',
    listing.vehicleCategory ? valueLabel(listing.vehicleCategory) : '',
    listing.brand || '',
    listing.model || '',
    listing.year ? String(listing.year) : '',
    listing.mileageKm != null ? `${listing.mileageKm} км` : '',
    listing.fuelType ? valueLabel(listing.fuelType) : '',
    listing.transmission ? valueLabel(listing.transmission) : '',
    listing.drivetrain ? valueLabel(listing.drivetrain) : '',
    listing.engine || '',
    listing.city || ''
  ].filter(Boolean);
}

export function ListingDetailsPageClient({
  listing,
  related
}: {
  listing: ListingView;
  related: ListingView[];
}) {
  const images = useMemo(() => {
    const raw = Array.isArray(listing.imageUrls) ? listing.imageUrls : [];
    const next = raw.filter(Boolean);
    if (next.length > 0) return next;
    if (listing.coverUrl) return [listing.coverUrl];
    return [];
  }, [listing]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState<ListingComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [status, setStatus] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUid, setCurrentUid] = useState('');
  const [currentIsAdmin, setCurrentIsAdmin] = useState(false);
  const [commentsEnabled, setCommentsEnabled] = useState<boolean | null>(listing.commentsEnabled !== false);
  const [commentsPolicyBusy, setCommentsPolicyBusy] = useState(false);

  const activeImage = images[activeIndex] || '';
  const attributes = useMemo(() => attrEntries(listing), [listing]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const me = await fetchAuthJSON<{ authenticated?: boolean; isAdmin?: boolean; user?: { uid?: string } }>('/api/auth/me');
        if (!alive) return;
        setAuthenticated(Boolean(me?.authenticated));
        setCurrentUid(String(me?.user?.uid || ''));
        setCurrentIsAdmin(Boolean(me?.isAdmin));
      } catch {
        if (!alive) return;
        setAuthenticated(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await fetchAuthJSON<{ ok: true; policy: { enabled: boolean } }>(
          `/api/listings/${encodeURIComponent(listing.id)}/comments-policy`
        );
        if (!alive) return;
        setCommentsEnabled(data.policy?.enabled !== false);
      } catch {
        if (!alive) return;
        setCommentsEnabled(listing.commentsEnabled !== false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [listing.id, listing.commentsEnabled]);

  function requireAuth() {
    if (authenticated) return true;
    window.location.assign(buildLoginTarget(listing.id));
    return false;
  }

  function goPrev() {
    if (images.length <= 1) return;
    setActiveIndex((prev) => (prev <= 0 ? images.length - 1 : prev - 1));
  }

  function goNext() {
    if (images.length <= 1) return;
    setActiveIndex((prev) => (prev >= images.length - 1 ? 0 : prev + 1));
  }

  async function openComments() {
    if (commentsEnabled === false) {
      setStatus('Комментарии к этому объявлению отключены.');
      return;
    }
    if (!requireAuth()) return;

    try {
      setCommentsOpen(true);
      setCommentsLoading(true);

      const data = await fetchAuthJSON<{ ok: true; comments: ListingComment[] }>(
        `/api/listings/${encodeURIComponent(listing.id)}/comments`
      );

      setComments(data.comments || []);
      setStatus('');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка загрузки комментариев'));
    } finally {
      setCommentsLoading(false);
    }
  }

  async function submitComment() {
    if (!commentText.trim()) return;
    if (commentsEnabled === false) {
      setStatus('Комментарии к этому объявлению отключены.');
      return;
    }
    if (!requireAuth()) return;

    try {
      const data = await fetchAuthJSON<{ ok: true; comment: ListingComment }>(
        `/api/listings/${encodeURIComponent(listing.id)}/comments`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text: commentText.trim() })
        }
      );

      setComments((prev) => [...prev, data.comment]);
      setCommentText('');
      setStatus('');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка отправки комментария'));
    }
  }

  async function toggleComments(nextEnabled: boolean) {
    if (!(currentIsAdmin || (currentUid && currentUid === listing.ownerUid))) return;

    try {
      setCommentsPolicyBusy(true);
      setStatus(nextEnabled ? 'Включение комментариев…' : 'Отключение комментариев…');

      const data = await fetchAuthJSON<{ ok: true; policy: { enabled: boolean } }>(
        `/api/listings/${encodeURIComponent(listing.id)}/comments-policy`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ enabled: nextEnabled })
        }
      );

      setCommentsEnabled(data.policy?.enabled !== false);
      if (data.policy?.enabled === false) {
        setCommentsOpen(false);
        setCommentText('');
      }
      setStatus(nextEnabled ? 'Комментарии к объявлению включены ✅' : 'Комментарии к объявлению отключены ✅');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка изменения комментариев'));
    } finally {
      setCommentsPolicyBusy(false);
    }
  }

  return (
    <>
      {status ? (
        <div className="fixed left-1/2 top-[92px] z-40 -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-[13px] text-white">
          {status}
        </div>
      ) : null}

      <section className="bg-[#ececec] px-4 py-6 md:px-6 md:py-10">
        <div className="mx-auto max-w-[1220px]">
          <div className="grid gap-8 md:grid-cols-[92px_minmax(0,520px)_minmax(0,1fr)] md:items-start">
            <div className="hidden md:flex md:flex-col md:gap-4">
              {images.slice(0, 4).map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`overflow-hidden rounded-[10px] border ${
                    activeIndex === index ? 'border-black' : 'border-black/10'
                  }`}
                >
                  <div className="aspect-[1/1] w-full bg-[#d9d9d9]">
                    <img src={src} alt={`${listing.title} ${index + 1}`} className="h-full w-full object-cover" />
                  </div>
                </button>
              ))}
            </div>

            <div>
              <div className="relative overflow-hidden rounded-[12px] bg-[#d9d9d9]">
                <div className="aspect-[1/1] md:aspect-[1/1]">
                  {activeImage ? (
                    <img src={activeImage} alt={listing.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-600">
                      Фото объявления
                    </div>
                  )}
                </div>

                {images.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-900"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-900"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                ) : null}
              </div>

              {images.length > 1 ? (
                <div className="mt-3 grid grid-cols-4 gap-3 md:hidden">
                  {images.slice(0, 4).map((src, index) => (
                    <button
                      key={`${src}-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`overflow-hidden rounded-[10px] border ${
                        activeIndex === index ? 'border-black' : 'border-black/10'
                      }`}
                    >
                      <div className="aspect-square bg-[#d9d9d9]">
                        <img src={src} alt={`${listing.title} ${index + 1}`} className="h-full w-full object-cover" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <h1 className="text-[28px] font-semibold leading-[1.05] text-slate-900 md:text-[38px]">
                {listing.title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-2">
                {attributes.map((item, idx) => (
                  <span
                    key={`${item}-${idx}`}
                    className="rounded-full bg-white px-3 py-2 text-[12px] text-slate-700 md:text-[13px]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-5 text-[26px] font-semibold text-slate-900 md:text-[34px]">
                {formatPrice(listing)}
              </div>

              <div className="mt-2 text-[14px] text-slate-500">
                {listing.ownerProfile?.displayName || listing.ownerDisplayName || 'Пользователь'}
                {listing.city ? ` • ${listing.city}` : ''}
              </div>

              <div className="mt-6">
                <div className="text-[16px] font-medium text-slate-900">Описание объявления</div>
                <div className="mt-3 whitespace-pre-wrap text-[15px] leading-[1.55] text-slate-700">
                  {listing.description || 'Описание не указано.'}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openComments}
                  className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-3 text-[14px] text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  Комментарии
                </button>

                {(currentIsAdmin || (currentUid && currentUid === listing.ownerUid)) ? (
                  <button
                    type="button"
                    disabled={commentsPolicyBusy}
                    onClick={() => void toggleComments(!(commentsEnabled !== false))}
                    className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-3 text-[14px] text-slate-800 disabled:opacity-60"
                  >
                    <MessageSquareOff className="h-4 w-4" />
                    {commentsEnabled === false ? 'Включить комментарии' : 'Отключить комментарии'}
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-center text-[28px] font-medium text-slate-900 md:text-[42px]">
              Похожие объявления
            </h2>

            <div className="mt-8 space-y-4 md:mt-10 md:space-y-6">
              {related.length > 0 ? (
                related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/listing/${encodeURIComponent(item.id)}`}
                    className="block rounded-[18px] bg-[#f2f2f2] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)] md:p-5"
                  >
                    <div className="grid gap-4 md:grid-cols-[200px_minmax(0,1fr)]">
                      <div className="overflow-hidden rounded-[12px] bg-[#d9d9d9]">
                        <div className="aspect-[4/3]">
                          {item.coverUrl || item.imageUrls?.[0] ? (
                            <img
                              src={item.coverUrl || item.imageUrls?.[0] || ''}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[14px] text-slate-600">
                              Фото объявления
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-[20px] font-semibold text-slate-900">{item.title}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {attrEntries(item).slice(0, 5).map((entry, idx) => (
                            <span key={`${entry}-${idx}`} className="text-[12px] text-slate-600">
                              {entry}
                            </span>
                          ))}
                        </div>

                        <div className="mt-3 text-[14px] text-slate-700">
                          {item.description || 'Описание не указано.'}
                        </div>

                        <div className="mt-3 text-[16px] font-medium text-slate-900">
                          {formatPrice(item)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[18px] bg-[#f2f2f2] px-4 py-6 text-center text-[15px] text-slate-600">
                  Похожие объявления пока не найдены.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {commentsOpen ? (
        <>
          <button
            type="button"
            onClick={() => setCommentsOpen(false)}
            className="fixed inset-0 z-40 bg-black/45"
            aria-label="Закрыть комментарии"
          />

          <div className="fixed bottom-0 right-0 z-50 flex h-[78dvh] w-full flex-col rounded-t-[24px] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.22)] md:top-0 md:h-full md:w-[420px] md:rounded-none">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <div>
                <div className="text-[17px] font-semibold text-slate-900">Комментарии</div>
                <div className="text-[12px] text-slate-500">{listing.title}</div>
              </div>

              <button
                type="button"
                onClick={() => setCommentsOpen(false)}
                className="rounded-full p-2 text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {commentsLoading ? (
                <div className="text-[14px] text-slate-700">Загрузка комментариев…</div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <article key={comment.id} className="rounded-[16px] bg-[#f5f5f5] px-4 py-3">
                      <div className="text-[13px] font-medium text-slate-900">{comment.authorDisplayName}</div>
                      <div className="mt-1 text-[14px] leading-[1.4] text-slate-800">{comment.text}</div>
                      <div className="mt-2 text-[12px] text-slate-500">
                        {new Date(comment.createdAt).toLocaleString('ru-RU')}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-[14px] text-slate-700">Комментариев пока нет.</div>
              )}
            </div>

            <div className="border-t border-slate-200 p-4">
              <div className="flex items-end gap-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  placeholder="Напишите комментарий…"
                  className="min-h-[72px] flex-1 rounded-[16px] border border-slate-300 px-4 py-3 outline-none"
                />
                <button
                  type="button"
                  onClick={submitComment}
                  className="rounded-full bg-black px-4 py-3 text-[13px] text-white"
                >
                  Отправить
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}