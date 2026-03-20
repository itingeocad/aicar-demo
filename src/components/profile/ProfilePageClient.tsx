'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { upload } from '@vercel/blob/client';
import {
  Bookmark,
  Heart,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  UploadCloud
} from 'lucide-react';
import type { AIClipView, UserProfileDoc } from '@/lib/aiclips/types';
import type { DemoCar, DemoReel } from '@/lib/site/types';

type ProfileResponse = { ok: true; profile: UserProfileDoc | null };
type ClipsResponse = { ok: true; clips: AIClipView[] };
type CreateClipResponse = { ok: true; clip: AIClipView };
type UpdateClipResponse = { ok: true; clip: AIClipView };

type BlobUploadKind = 'avatar' | 'cover' | 'clip-poster' | 'clip-video';

type UploadState = {
  avatar: boolean;
  cover: boolean;
  poster: boolean;
  video: boolean;
};

function authToken() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('aicar_session_token') || '';
}

function safeFilename(value: string) {
  const clean = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return clean || 'file';
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

async function uploadPublicFile(
  file: File,
  kind: BlobUploadKind,
  uid: string,
  onProgress?: (percentage: number) => void
) {
  const name = safeFilename(file.name);
  const pathname =
    kind === 'avatar'
      ? `profiles/${uid}/avatar-${name}`
      : kind === 'cover'
        ? `profiles/${uid}/cover-${name}`
        : kind === 'clip-poster'
          ? `clips/${uid}/posters/${Date.now()}-${name}`
          : `clips/${uid}/videos/${Date.now()}-${name}`;

  const token = authToken();

  const blob = await upload(pathname, file, {
    access: 'public',
    contentType: file.type || undefined,
    handleUploadUrl: '/api/blob/upload',
    clientPayload: JSON.stringify({
      kind,
      token
    }),
    multipart: kind === 'clip-video',
    onUploadProgress: (event) => {
      onProgress?.(Math.round(event.percentage));
    }
  });

  return blob;
}

async function createPosterFromVideoFile(file: File): Promise<File | null> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      const onLoadedData = () => resolve();
      const onError = () => reject(new Error('Не удалось прочитать видео для постера'));

      video.addEventListener('loadeddata', onLoadedData, { once: true });
      video.addEventListener('error', onError, { once: true });
    });

    const width = video.videoWidth || 720;
    const height = video.videoHeight || 1280;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas недоступен');
    }

    ctx.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.92)
    );

    if (!blob) return null;

    const base = safeFilename(file.name.replace(/\.[^.]+$/, '')) || 'poster';
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function ClipCard({
  clip,
  editable = false,
  busy = false,
  onEdit,
  onDelete
}: {
  clip: AIClipView;
  editable?: boolean;
  busy?: boolean;
  onEdit?: (clip: AIClipView) => void;
  onDelete?: (clip: AIClipView) => void;
}) {
  const media = clip.posterUrl || clip.videoUrl || '';

  return (
    <div className="overflow-hidden rounded-[20px] bg-[#efefef] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <Link href={`/aiclips?reel=${encodeURIComponent(clip.id)}`} className="group block">
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

          <div className="text-[12px] text-slate-500">
            {clip.visibility === 'draft' ? 'draft' : 'public'}
          </div>
        </div>
      </Link>

      {editable ? (
        <div className="flex gap-2 border-t border-black/5 px-4 pb-4 pt-1">
          <button
            type="button"
            disabled={busy}
            onClick={() => onEdit?.(clip)}
            className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[13px] text-white disabled:opacity-60"
          >
            <Pencil className="h-4 w-4" />
            Изменить
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete?.(clip)}
            className="inline-flex items-center gap-2 rounded-full bg-[#ececec] px-4 py-2 text-[13px] text-slate-900 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            Удалить
          </button>
        </div>
      ) : null}
    </div>
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
  const [clipBusyId, setClipBusyId] = useState('');
  const [uploading, setUploading] = useState<UploadState>({
    avatar: false,
    cover: false,
    poster: false,
    video: false
  });

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
    posterUrl: '',
    sourceType: 'url' as 'url' | 'upload',
    visibility: 'public' as 'public' | 'draft'
  });

  const demoReelCount = reels.length;
  const adItems = useMemo(() => cars.slice(0, 4), [cars]);

  function setUploadFlag(slot: keyof UploadState, value: boolean) {
    setUploading((prev) => ({ ...prev, [slot]: value }));
  }

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

  async function uploadProfileAsset(slot: 'avatar' | 'cover', file: File) {
    if (!profile?.uid || !file) return;

    try {
      setUploadFlag(slot, true);
      setStatus(`Загрузка ${slot === 'avatar' ? 'аватара' : 'обложки'}… 0%`);

      const blob = await uploadPublicFile(file, slot, profile.uid, (percentage) => {
        setStatus(`Загрузка ${slot === 'avatar' ? 'аватара' : 'обложки'}… ${percentage}%`);
      });

      if (slot === 'avatar') {
        setDraft((prev) => ({ ...prev, avatarUrl: blob.url }));
      } else {
        setDraft((prev) => ({ ...prev, coverUrl: blob.url }));
      }

      setStatus('Файл загружен ✅ Теперь нажмите «Сохранить».');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка загрузки файла'));
    } finally {
      setUploadFlag(slot, false);
    }
  }

  async function uploadClipAsset(slot: 'poster' | 'video', file: File) {
    if (!profile?.uid || !file) return;

    try {
      setUploadFlag(slot, true);
      setStatus(`Загрузка ${slot === 'poster' ? 'постера' : 'видео'}… 0%`);

      const needAutoPoster = slot === 'video' && !publishDraft.posterUrl.trim();

      const blob = await uploadPublicFile(
        file,
        slot === 'poster' ? 'clip-poster' : 'clip-video',
        profile.uid,
        (percentage) => {
          setStatus(`Загрузка ${slot === 'poster' ? 'постера' : 'видео'}… ${percentage}%`);
        }
      );

      if (slot === 'poster') {
        setPublishDraft((prev) => ({ ...prev, posterUrl: blob.url }));
        setStatus('Poster file загружен ✅');
      } else {
        let autoPosterUrl = '';

        if (needAutoPoster) {
          try {
            setStatus('Генерация постера из первого кадра…');

            const posterFile = await createPosterFromVideoFile(file);

            if (posterFile) {
              setStatus('Загрузка постера из первого кадра…');

              const posterBlob = await uploadPublicFile(
                posterFile,
                'clip-poster',
                profile.uid
              );

              autoPosterUrl = posterBlob.url;
            }
          } catch {
            autoPosterUrl = '';
          }
        }

        setPublishDraft((prev) => ({
          ...prev,
          videoUrl: blob.url,
          sourceType: 'upload',
          posterUrl: prev.posterUrl || autoPosterUrl
        }));

        if (needAutoPoster && autoPosterUrl) {
          setStatus('Видео и постер из первого кадра загружены ✅');
        } else {
          setStatus('Video file загружен ✅');
        }
      }
    } catch (e) {
      const msg = String((e as any)?.message || e || 'Ошибка загрузки AIClip');
      setStatus(`Upload error: ${msg}. Проверьте /api/blob/debug и наличие BLOB_READ_WRITE_TOKEN в Production.`);
    } finally {
      setUploadFlag(slot, false);
    }
  }

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
      setMyClips((prev) =>
        prev.map((clip) => ({
          ...clip,
          ownerProfile: clip.ownerProfile
            ? {
                ...clip.ownerProfile,
                displayName: draft.displayName || clip.ownerProfile.displayName,
                avatarUrl: draft.avatarUrl || clip.ownerProfile.avatarUrl
              }
            : {
                uid: profile?.uid || '',
                displayName: draft.displayName || displayName,
                avatarUrl: draft.avatarUrl || ''
              }
        }))
      );
      setEditOpen(false);
      setStatus('Профиль сохранён ✅');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка сохранения'));
    } finally {
      setSaving(false);
    }
  }

  async function publishClip() {
    try {
      setPublishing(true);
      setStatus('Публикация AIClip…');

      const payload = {
        title: publishDraft.title.trim(),
        description: publishDraft.description.trim(),
        videoUrl: publishDraft.videoUrl.trim(),
        posterUrl: publishDraft.posterUrl.trim(),
        sourceType: publishDraft.sourceType,
        visibility: publishDraft.visibility
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
        posterUrl: '',
        sourceType: 'url',
        visibility: 'public'
      });
      setPublishOpen(false);
      setStatus('AIClip опубликован ✅');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка публикации'));
    } finally {
      setPublishing(false);
    }
  }

  async function editMyClip(clip: AIClipView) {
    const title = window.prompt('Название AIClip', clip.title || '');
    if (title == null) return;

    const description = window.prompt('Описание AIClip', clip.description || '');
    if (description == null) return;

    const visibilityInput = window.prompt('Видимость: public или draft', clip.visibility || 'public');
    if (visibilityInput == null) return;

    const visibility = String(visibilityInput).trim().toLowerCase() === 'draft' ? 'draft' : 'public';

    try {
      setClipBusyId(clip.id);
      setStatus('Сохранение AIClip…');

      const res = await fetchAuthJSON<UpdateClipResponse>(`/api/aiclips/${encodeURIComponent(clip.id)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          visibility
        })
      });

      setMyClips((prev) => prev.map((x) => (x.id === clip.id ? res.clip : x)));
      setFavoriteClips((prev) => prev.map((x) => (x.id === clip.id ? res.clip : x)));
      setStatus('AIClip обновлён ✅');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка обновления AIClip'));
    } finally {
      setClipBusyId('');
    }
  }

  async function deleteMyClip(clip: AIClipView) {
    const ok = window.confirm(`Удалить AIClip "${clip.title}"?`);
    if (!ok) return;

    try {
      setClipBusyId(clip.id);
      setStatus('Удаление AIClip…');

      await fetchAuthJSON<{ ok: true }>(`/api/aiclips/${encodeURIComponent(clip.id)}`, {
        method: 'DELETE'
      });

      setMyClips((prev) => prev.filter((x) => x.id !== clip.id));
      setFavoriteClips((prev) => prev.filter((x) => x.id !== clip.id));
      setStatus('AIClip удалён ✅');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка удаления AIClip'));
    } finally {
      setClipBusyId('');
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
            className="relative z-0 overflow-hidden rounded-[22px] bg-[#d9d9d9] md:rounded-[0px]"
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

          <div className="relative z-10 -mt-[88px] flex justify-center md:-mt-[130px]">
            <div className="flex h-[176px] w-[176px] items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#d9d9d9] text-center text-[18px] text-slate-900 shadow-[0_4px_16px_rgba(0,0,0,0.12)] md:h-[260px] md:w-[260px] md:text-[20px]">
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

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[13px] text-slate-700 md:mt-8">
            <span className="rounded-full bg-[#f1f1f1] px-4 py-2">Мои AIClips: {myClips.length}</span>
            <span className="rounded-full bg-[#f1f1f1] px-4 py-2">Избранное: {favoriteClips.length}</span>
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
                  <div className="mb-2 text-[13px] text-slate-700">Avatar file</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadProfileAsset('avatar', file);
                        e.currentTarget.value = '';
                      }}
                      className="block w-full max-w-[420px] rounded-[14px] border border-slate-300 bg-white px-4 py-3"
                    />
                    {uploading.avatar ? (
                      <span className="inline-flex items-center gap-2 text-[13px] text-slate-700">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        upload…
                      </span>
                    ) : null}
                  </div>
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
                  <div className="mb-2 text-[13px] text-slate-700">Cover file</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadProfileAsset('cover', file);
                        e.currentTarget.value = '';
                      }}
                      className="block w-full max-w-[420px] rounded-[14px] border border-slate-300 bg-white px-4 py-3"
                    />
                    {uploading.cover ? (
                      <span className="inline-flex items-center gap-2 text-[13px] text-slate-700">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        upload…
                      </span>
                    ) : null}
                  </div>
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

                <button
                  type="button"
                  onClick={() => {
                    setDraft({
                      displayName: profile?.displayName || displayName || '',
                      bio: profile?.bio || '',
                      avatarUrl: profile?.avatarUrl || '',
                      coverUrl: profile?.coverUrl || ''
                    });
                    setEditOpen(false);
                    setStatus('');
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#e8e8e8] px-5 py-3 text-[14px] font-medium text-slate-900"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : null}

          {publishOpen ? (
            <div className="mt-6 rounded-[22px] bg-[#f4f4f4] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.05)] md:p-6">
              <div className="mb-4 text-[18px] font-semibold text-slate-900 md:text-[22px]">
                Новый AIClip
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
                  <div className="mb-2 text-[13px] text-slate-700">Видимость</div>
                  <select
                    value={publishDraft.visibility}
                    onChange={(e) =>
                      setPublishDraft((prev) => ({
                        ...prev,
                        visibility: e.target.value === 'draft' ? 'draft' : 'public'
                      }))
                    }
                    className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                  >
                    <option value="public">public</option>
                    <option value="draft">draft</option>
                  </select>
                </label>

                <label className="block">
                  <div className="mb-2 text-[13px] text-slate-700">Poster URL</div>
                  <input
                    value={publishDraft.posterUrl}
                    onChange={(e) => setPublishDraft((prev) => ({ ...prev, posterUrl: e.target.value }))}
                    className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-[13px] text-slate-700">Video URL</div>
                  <input
                    value={publishDraft.videoUrl}
                    onChange={(e) =>
                      setPublishDraft((prev) => ({
                        ...prev,
                        videoUrl: e.target.value,
                        sourceType: 'url'
                      }))
                    }
                    className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 outline-none"
                  />
                </label>

                <label className="block md:col-span-2">
                  <div className="mb-2 text-[13px] text-slate-700">Poster file</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadClipAsset('poster', file);
                        e.currentTarget.value = '';
                      }}
                      className="block w-full max-w-[420px] rounded-[14px] border border-slate-300 bg-white px-4 py-3"
                    />
                    {uploading.poster ? (
                      <span className="inline-flex items-center gap-2 text-[13px] text-slate-700">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        upload…
                      </span>
                    ) : null}
                  </div>
                </label>

                <label className="block md:col-span-2">
                  <div className="mb-2 text-[13px] text-slate-700">Video file</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadClipAsset('video', file);
                        e.currentTarget.value = '';
                      }}
                      className="block w-full max-w-[420px] rounded-[14px] border border-slate-300 bg-white px-4 py-3"
                    />
                    {uploading.video ? (
                      <span className="inline-flex items-center gap-2 text-[13px] text-slate-700">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        upload…
                      </span>
                    ) : null}
                  </div>
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

              <div className="mt-4 rounded-[16px] bg-white px-4 py-3 text-[13px] text-slate-700">
                Источник: <strong>{publishDraft.sourceType === 'upload' ? 'file upload' : 'url'}</strong>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={publishClip}
                  disabled={publishing}
                  className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-[14px] font-medium text-white disabled:opacity-60"
                >
                  {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  Опубликовать AIClip
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
                  <ClipCard
                    key={clip.id}
                    clip={clip}
                    editable={tab === 'mine'}
                    busy={clipBusyId === clip.id}
                    onEdit={editMyClip}
                    onDelete={deleteMyClip}
                  />
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