'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';

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

export function NotificationsBellClient() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
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

  async function markAllRead() {
    try {
      await fetchAuthJSON('/api/notifications/read', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({})
      });
      setNotifications((prev) => prev.map((x) => ({ ...x, isRead: true })));
      setUnreadCount(0);
    } catch {}
  }

  const hasUnread = unreadCount > 0;
  const topItems = useMemo(() => notifications.slice(0, 8), [notifications]);

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
          if (!open && hasUnread) {
            void markAllRead();
          }
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-black/5"
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
        <div className="absolute right-0 top-full z-40 mt-3 w-[360px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
            <div className="text-sm font-semibold text-slate-900">Оповещения</div>
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              Прочитать всё
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {topItems.length > 0 ? (
              topItems.map((item) => (
                <Link
                  key={item.id}
                  href={targetHref(item)}
                  className="flex gap-3 border-b border-black/5 px-4 py-3 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                    {item.actorAvatarUrl ? (
                      <img src={item.actorAvatarUrl} alt={item.actorDisplayName} className="h-full w-full object-cover" />
                    ) : (
                      <span>{item.actorDisplayName.slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] text-slate-900">
                      <span className="font-semibold">{item.actorDisplayName}</span>{' '}
                      <span className="text-slate-600">{labelForType(item)}</span>
                    </div>
                    {item.textSnippet ? (
                      <div className="mt-1 line-clamp-2 text-[12px] text-slate-600">{item.textSnippet}</div>
                    ) : null}
                    <div className="mt-1 text-[11px] text-slate-500">
                      {new Date(item.createdAt).toLocaleString('ru-RU')}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-6 text-sm text-slate-600">Пока нет оповещений.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}