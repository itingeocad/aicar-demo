'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

type SettingsResponse = {
  ok: true;
  settings: {
    clipsEnabled: boolean;
    listingsEnabled: boolean;
    updatedAt: string;
  };
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

export function CommentsSettingsCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [clipsEnabled, setClipsEnabled] = useState(true);
  const [listingsEnabled, setListingsEnabled] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const data = await fetchAuthJSON<SettingsResponse>('/api/admin/comments/settings');
      setClipsEnabled(Boolean(data.settings?.clipsEnabled));
      setListingsEnabled(Boolean(data.settings?.listingsEnabled));
      setStatus('');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    try {
      setSaving(true);
      setStatus('Сохранение настроек комментариев…');

      await fetchAuthJSON('/api/admin/comments/settings', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          clipsEnabled,
          listingsEnabled
        })
      });

      setStatus('Настройки комментариев сохранены ✅');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка сохранения'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm lg:col-span-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Глобальные комментарии</div>
          <div className="mt-1 text-xs text-slate-500">
            Суперадмин может полностью отключать комментарии для всех видео или для всех объявлений.
          </div>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={loading || saving}
          className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? 'Сохранение…' : 'Сохранить'}
        </button>
      </div>

      {loading ? (
        <div className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Загрузка…
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex items-center justify-between rounded-xl border px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-900">Комментарии к видео</div>
              <div className="text-xs text-slate-500">Влияет на все AIClips</div>
            </div>
            <input
              type="checkbox"
              checked={clipsEnabled}
              onChange={(e) => setClipsEnabled(e.target.checked)}
              className="h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-900">Комментарии к объявлениям</div>
              <div className="text-xs text-slate-500">Влияет на все объявления</div>
            </div>
            <input
              type="checkbox"
              checked={listingsEnabled}
              onChange={(e) => setListingsEnabled(e.target.checked)}
              className="h-4 w-4"
            />
          </label>
        </div>
      )}

      {status ? <div className="mt-3 text-sm text-slate-600">{status}</div> : null}
    </div>
  );
}