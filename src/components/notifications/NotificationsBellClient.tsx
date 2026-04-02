'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Loader2, X } from 'lucide-react';

type NotificationItem = {
  id: string;
  type: 'comment_reply' | 'clip_comment' | 'listing_comment';
  targetType: 'clip' | 'listing';
  targetId: string;
  commentId: string;
  actorUid: string;
  actorDisplayName: string;
  actorAvatarUrl?: string;
  textSnippet?: string;
  isRead: boolean;
  createdAt: string;
};

type NotificationsResponse = {
  ok: true;
  unreadCount: number;
  notifications: NotificationItem[];
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

function targetHref(item: NotificationItem) {
  if (item.targetType === 'clip') {
    return `/aiclips?reel=${encodeURIComponent(item.targetId)}`;
  }
  return `/profile?listing=${encodeURIComponent(item.targetId)}`;
}

function labelForType(item: NotificationItem) {
  if (item.type === 'comment_reply') return 'ответил на ваш комментарий';
  if (item.type === 'clip_comment') return 'оставил комментарий к вашему видео';
  return 'оставил комментарий к вашему объявлению';
}

export function NotificationsBellClient({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [busyClear, setBusyClear] = useState(false);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await fetchAuthJSON<NotificationsResponse>('/api/notifications');
      setAuthenticated(true);
      setUnreadCount(data.unreadCount || 0);
      setNotifications(data.notifications || []);
    } catch {
      setAuthenticated(false);
      setUnreadCount(0);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function markRead(ids?: string[]) {
    try {
      await fetchAuthJSON('/api/notifications/read', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids })
      });

      if (!ids || ids.length === 0) {
        setNotifications((prev) => prev.map((x) => ({ ...x, isRead: true })));
        setUnreadCount(0);
        return;
      }

      const idSet = new Set(ids.map(String));
      let delta = 0;

      setNotifications((prev) =>
        prev.map((x) => {
          if (idSet.has(x.id) && !x.isRead) {
            delta += 1;
            return { ...x, isRead: true };
          }
          return x;
        })
      );

      if (delta > 0) {
        setUnreadCount((prev) => Math.max(0, prev - delta));
      }
    } catch {}
  }

  async function deleteOne(id: string) {
    try {
      setBusyIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      const item = notifications.find((x) => x.id === id);
      await fetchAuthJSON(`/api/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' });

      setNotifications((prev) => prev.filter((x) => x.id !== id));
      if (item && !item.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
    } finally {
      setBusyIds((prev) => prev.filter((x) => x !== id));
    }
  }

  async function clearAll() {
    try {
      setBusyClear(true);
      await fetchAuthJSON('/api/notifications', { method: 'DELETE' });
      setNotifications([]);
      setUnreadCount(0);
      setOpen(false);
    } catch {
    } finally {
      setBusyClear(false);
    }
  }

  const hasUnread = unreadCount > 0;
  const hasItems = notifications.length > 0;
  const topItems = useMemo(() => notifications.slice(0, 8), [notifications]);

  const buttonClass =
    'relative flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-black/5';

  const panelClass = mobile
    ? 'fixed left-3 right-3 top-[68px] z-50 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg'
    : 'absolute right-0 top-full z-40 mt-3 w-[360px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="notifications"
        onClick={() => {
          if (!authenticated) {
            const next = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
            window.location.assign(`/login?next=${encodeURIComponent(next)}`);
            return;
          }
          setOpen((v) => !v);
        }}
        className={buttonClass}
      >
        <Bell className="h-5 w-5" />
        {loading ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-white">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
          </span>
        ) : hasUnread ? (
          <span className="absolute -right-0.5 -top-0.5 min-w-[16px] rounded-full bg-black px-1 text-[10px] leading-4 text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open && authenticated ? (
        <div className={panelClass}>
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
            <div className="text-sm font-semibold text-slate-900">Оповещения</div>
            <button
              type="button"
              disabled={!hasItems || busyClear}
              onClick={() => void clearAll()}
              className="text-xs text-slate-600 hover:text-slate-900 disabled:cursor-default disabled:opacity-40"
            >
              Очистить всё
            </button>
          </div>

          <div className={mobile ? 'max-h-[min(70vh,420px)] overflow-y-auto' : 'max-h-[420px] overflow-y-auto'}>
            {topItems.length > 0 ? (
              topItems.map((item) => {
                const deleting = busyIds.includes(item.id);

                return (
                  <div key={item.id} className="flex items-start gap-2 border-b border-black/5 px-3 py-3 hover:bg-slate-50">
                    <Link
                      href={targetHref(item)}
                      className="flex min-w-0 flex-1 gap-3"
                      onClick={() => {
                        void markRead([item.id]);
                        setOpen(false);
                      }}
                    >
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                        {item.actorAvatarUrl ? (
                          <img src={item.actorAvatarUrl} alt={item.actorDisplayName} className="h-full w-full object-cover" />
                        ) : (
                          <span>{item.actorDisplayName.slice(0, 1).toUpperCase()}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1 text-[13px] text-slate-900">
                            <span className="font-semibold">{item.actorDisplayName}</span>{' '}
                            <span className="text-slate-600">{labelForType(item)}</span>
                          </div>
                          {!item.isRead ? (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-black" />
                          ) : null}
                        </div>

                        {item.textSnippet ? (
                          <div className="mt-1 line-clamp-2 text-[12px] text-slate-600">{item.textSnippet}</div>
                        ) : null}

                        <div className="mt-1 text-[11px] text-slate-500">
                          {new Date(item.createdAt).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </Link>

                    <button
                      type="button"
                      aria-label="Удалить оповещение"
                      disabled={deleting}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void deleteOne(item.id);
                      }}
                      className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-black/5 hover:text-slate-900 disabled:opacity-40"
                    >
                      {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-6 text-sm text-slate-600">Пока нет оповещений.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}