'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Bookmark, Heart, Loader2, Pencil, Plus, Save } from 'lucide-react';
import type { AIClipView, UserProfileDoc } from '@/lib/aiclips/types';
import type { DemoCar, DemoReel } from '@/lib/site/types';

type ProfileResponse = { ok: true; profile: UserProfileDoc | null };
type ClipsResponse = { ok: true; clips: AIClipView[] };
type CreateClipResponse = { ok: true; clip: AIClipView };

async function fetchAuthJSON<T>(url: string, init?: RequestInit): Promise<T> {
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

function ClipCard({ clip }: { clip: AIClipView }) {
  const media = clip.posterUrl || clip.videoUrl || '';

  return (
    <Link
      href={`/aiclips?reel=${encodeURIComponent(clip.id)}`}
      className="group overflow-hidden rounded-[20px] bg-[#efefef] shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-[#d9d9d9]">
        {media ? (
          <img
            src={media}
            alt={clip.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[18px] text-slate-700">
            AIClip
          </div>
        )}
      </div>

      <div className="space-y-2 px-4 py-4">
        <div className="line-clamp-2 text-[17px] font-semibold leading-[1.15] text-slate-900">
          {clip.title}
        </div>

        <div className="text-[13px] text-slate-600">
          {clip.ownerProfile?.displayName || clip.ownerDisplayName}
        </div>

        <div className="flex items-center gap-4 text-[13px] text-slate-700">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-4 w-4" strokeWidth={1.8} />
            {clip.likeCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bookmark className="h-4 w-4" strokeWidth={1.8} />
            {clip.favoriteCount}
          </span>
          <span>{clip.commentCount} комм.</span>
        </div>
      </div>
    </Link>
  );
}

function DemoAdCard({ car }: { car: DemoCar }) {
  return (
    <article className="rounded-[18px] bg-[#f4f4f4] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-[120px_1fr] gap-4 md:grid-cols-[160px_1fr]">
        <div className="overflow-hidden rounded-[10px] bg-white">
          <img src={car.imageUrl} alt={car.title} className="h-full w-full object-cover" />
        </div>

        <div>
          <h3 className="text-[18px] font-semibold leading-[1.1] text-slate-900">{car.title}</h3>

          <div className="mt-2 flex flex-wrap gap-2 text-[12px] text-slate-600">
            <span>{car.year}</span>
            <span>{car.mileageKm.toLocaleString('ru-RU')} км</span>
            <span>{car.currency}{car.price.toLocaleString('ru-RU')}</span>
            <span>{car.city}</span>
          </div>

          <div className="mt-4 text-[15px] text-slate-800">Демо-объявление</div>
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
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [profile, setProfile] = useState<UserProfileDoc | null>(null);
  const [myClips, setMyClips] = useState<AIClipView[]>([]);
  const [favoriteClips, setFavoriteClips] = useState<AIClipView[]>([]);

  const [tab, setTab] = useState<'mine' | 'favorites'>('mine');
  const [editOpen, setEditOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  const [draft, setDraft] = useState({
    displayName: displayName || '',
    bio: '',
    avatarUrl: '',
    coverUrl: ''
  });

  const [publishDraft, setPublishDraft] = useState({
    title: '',
    description: '',
    videoUrl: '',
    posterUrl: ''
  });

  const demoReelCount = reels.length;
  const adItems = useMemo(() => cars.slice(0, 4), [cars]);

  async function loadProfileData() {
    const [me, mine, favorites] = await Promise.all([
      fetchAuthJSON<ProfileResponse>('/api/profile/me'),
      fetchAuthJSON<ClipsResponse>('/api/aiclips/mine'),
      fetchAuthJSON<ClipsResponse>('/api/aiclips/favorites')
    ]);

    setProfile(me.profile || null);
    setMyClips(mine.clips || []);
    setFavoriteClips(favorites.clips || []);

    if (me.profile) {
      setDraft({
        displayName: me.profile.displayName || '',
        bio: me.profile.bio || '',
        avatarUrl: me.profile.avatarUrl || '',
        coverUrl: me.profile.coverUrl || ''
      });
    }
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setStatus('Загрузка профиля…');

        await loadProfileData();

        if (!alive) return;
        setStatus('');
      } catch (e) {
        if (!alive) return;

        const message = String((e as any)?.message || e || 'Ошибка');
        if (/401|unauthorized/i.test(message)) {
          window.location.assign('/login?next=/profile');
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
  }, []);

  async function saveProfile() {
    try {
      setSaving(true);
      setStatus('Сохранение профиля…');

      const res = await fetchAuthJSON<ProfileResponse>('/api/profile/me', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(draft)
      });

      setProfile(res.profile || null);
      setEditOpen(false);
      setStatus('Профиль сохранён ✅');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка сохранения'));
    } finally {
      setSaving(false);
    }
  }

  async function publishByUrl() {
    try {
      setPublishing(true);
      setStatus('Публикация AIClip…');

      const payload = {
        title: publishDraft.title.trim(),
        description: publishDraft.description.trim(),
        videoUrl: publishDraft.videoUrl.trim(),
        posterUrl: publishDraft.posterUrl.trim(),
        sourceType: 'url',
        visibility: 'public'
      };

      const res = await fetchAuthJSON<CreateClipResponse>('/api/aiclips', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setMyClips((prev) => [res.clip, ...prev]);
      setTab('mine');
      setPublishDraft({
        title: '',
        description: '',
        videoUrl: '',
        posterUrl: ''
      });
      setPublishOpen(false);
      setStatus('AIClip опубликован ✅');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка публикации'));
    } finally {
      setPublishing(false);
    }
  }

  const effectiveName = draft.displayName || profile?.displayName || displayName || 'Пользователь';
  const effectiveBio = draft.bio || profile?.bio || '';
  const visibleClips = tab === 'mine' ? myClips : favoriteClips;

  return (
    <section className="pb-[72px] pt-[18px] md:pb-[120px] md:pt-[28px]">
      <div className="aicar-container">
        <div className="mx-auto max-w-[960px]">
          <div
            className="relative overflow-hidden rounded-[22px] bg-[#d9d9d9] md:rounded-[0px]"
            style={{
              minHeight: '180px',
              backgroundImage: profile?.coverUrl ? `url(${profile.coverUrl})` : undefined,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          >
            {!profile?.coverUrl ? (
              <div className="flex h-[180px] items-center justify-center text-center text-[18px] text-slate-900 md:h-[338px] md:text-[20px]">
                Обложка профиля
              </div>
            ) : (
              <div className="h-[180px] md:h-[338px]" />
            )}
          </div>

          <div className="-mt-[88px] flex justify-center md:-mt-[130px]">
            <div className="flex h-[176px] w-[176px] items-center justify-center overflow-hidden rounded-full bg-[#d9d9d9] text-center text-[18px] text-slate-900 shadow-[0_4px_16px_rgba(0,0,0,0.12)] md:h-[260px] md:w-[260px] md:text-[20px]">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={effectiveName} className="h-full w-full object-cover" />
              ) : (
                <span className="px-4">Фото профиля</span>
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-[22px] font-semibold text-slate-900 md:text-[28px]">{effectiveName}</div>
            <div className="mx-auto mt-3 max-w-[640px] text-[15px] leading-[1.45] text-slate-700 md:text-[17px]">
              {effectiveBio || `Профиль пользователя AICar. Демо-роликов в системе: ${demoReelCount}.`}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:mt-8">
            <button
              type="button"
              onClick={() => setEditOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-[14px] font-medium text-white"
            >
              <Pencil className="h-4 w-4" />
              Редактировать профиль
            </button>

            <button
              type="button"
              onClick={() => setPublishOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full bg-[#e8e8e8] px-5 py-3 text-[14px] font-medium text-slate-900"
            >
              <Plus className="h-4 w-4" />
              Опубликовать AIClip
            </button>
          </div>

          {editOpen ? (
            <div className="mt-6 rounded-[22px] bg-[#f4f4f4] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.05)] md:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="mb-2 text-[13px] text-slate-700">Отображаемое имя</div>
                  <input
                    value={draft.displayName}
                    onChange={(e) => setDraft((prev) => ({ ...prev, displayName: e.target.value }))}
                    className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-[13px] text-slate-700">Avatar URL</div>
                  <input
                    value={draft.avatarUrl}
                    onChange={(e) => setDraft((prev) => ({ ...prev, avatarUrl: e.target.value }))}
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
                  <div className="mb-2 text-[13px] text-slate-700">Bio</div>
                  <textarea
                    value={draft.bio}
                    onChange={(e) => setDraft((prev) => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-[14px] font-medium text-white disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Сохранить
                </button>
              </div>
            </div>
          ) : null}

          {publishOpen ? (
            <div className="mt-6 rounded-[22px] bg-[#f4f4f4] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.05)] md:p-6">
              <div className="mb-4 text-[18px] font-semibold text-slate-900 md:text-[22px]">
                Новый AIClip по URL
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="mb-2 text-[13px] text-slate-700">Заголовок</div>
                  <input
                    value={publishDraft.title}
                    onChange={(e) => setPublishDraft((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-[13px] text-slate-700">Poster URL</div>
                  <input
                    value={publishDraft.posterUrl}
                    onChange={(e) => setPublishDraft((prev) => ({ ...prev, posterUrl: e.target.value }))}
                    className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                  />
                </label>

                <label className="block md:col-span-2">
                  <div className="mb-2 text-[13px] text-slate-700">Video URL</div>
                  <input
                    value={publishDraft.videoUrl}
                    onChange={(e) => setPublishDraft((prev) => ({ ...prev, videoUrl: e.target.value }))}
                    className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                  />
                </label>

                <label className="block md:col-span-2">
                  <div className="mb-2 text-[13px] text-slate-700">Описание</div>
                  <textarea
                    value={publishDraft.description}
                    onChange={(e) => setPublishDraft((prev) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={publishByUrl}
                  disabled={publishing}
                  className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-[14px] font-medium text-white disabled:opacity-60"
                >
                  {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Опубликовать
                </button>
              </div>
            </div>
          ) : null}

          {status ? (
            <div className="mt-5 rounded-[16px] bg-[#f4f4f4] px-4 py-3 text-[14px] text-slate-800">
              {status}
            </div>
          ) : null}

          <section className="mt-[42px] md:mt-[64px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[28px] font-medium text-slate-900 md:text-[36px]">AIClips</h2>

              <div className="flex rounded-full bg-[#ededed] p-1">
                <button
                  type="button"
                  onClick={() => setTab('mine')}
                  className={`rounded-full px-4 py-2 text-[14px] ${
                    tab === 'mine' ? 'bg-black text-white' : 'text-slate-700'
                  }`}
                >
                  Мои клипы
                </button>
                <button
                  type="button"
                  onClick={() => setTab('favorites')}
                  className={`rounded-full px-4 py-2 text-[14px] ${
                    tab === 'favorites' ? 'bg-black text-white' : 'text-slate-700'
                  }`}
                >
                  Избранное
                </button>
              </div>
            </div>

            {loading ? (
              <div className="mt-6 text-[15px] text-slate-700">Загрузка…</div>
            ) : visibleClips.length > 0 ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleClips.map((clip) => (
                  <ClipCard key={clip.id} clip={clip} />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[18px] bg-[#f4f4f4] px-5 py-5 text-[15px] text-slate-700">
                {tab === 'mine'
                  ? 'У вас пока нет опубликованных AIClips.'
                  : 'У вас пока нет избранных AIClips.'}
              </div>
            )}

            <div className="mt-5">
              <Link href="/aiclips" className="text-[14px] text-slate-800 underline underline-offset-4">
                Открыть ленту AIClips
              </Link>
            </div>
          </section>

          <section className="mt-[54px] md:mt-[90px]">
            <h2 className="text-[28px] font-medium text-slate-900 md:text-[36px]">Объявления</h2>

            <div className="mt-6 space-y-4">
              {adItems.map((car) => (
                <DemoAdCard key={car.id} car={car} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}