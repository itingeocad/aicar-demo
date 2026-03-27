'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Heart,
  Loader2,
  MessageCircle,
  MessageSquareOff,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Send,
  X
} from 'lucide-react';
import type { AIClipCommentDoc, AIClipView } from '@/lib/aiclips/types';
import type { DemoReel } from '@/lib/site/types';

const PROTO_W = 543;
const PROTO_H = 961;

type ReelItem = {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  posterUrl?: string;
  ownerDisplayName: string;
  ownerAvatarUrl?: string;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  isLiked: boolean;
  isFavorited: boolean;
  source: 'live' | 'demo';
};

type PlaybackFlash = {
  reelId: string;
  mode: 'play' | 'pause';
} | null;

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

function scrollToIndex(container: HTMLDivElement | null, index: number, smooth = true) {
  if (!container) return;
  const pageHeight = container.clientHeight;
  container.scrollTo({
    top: index * pageHeight,
    behavior: smooth ? 'smooth' : 'auto'
  });
}

function mapLiveClip(clip: AIClipView): ReelItem {
  return {
    id: clip.id,
    title: clip.title,
    description: clip.description,
    videoUrl: clip.videoUrl,
    posterUrl: clip.posterUrl,
    ownerUid: clip.ownerUid,
    ownerDisplayName: clip.ownerProfile?.displayName || clip.ownerDisplayName,
    ownerAvatarUrl: clip.ownerProfile?.avatarUrl,
    likeCount: clip.likeCount,
    commentCount: clip.commentCount,
    favoriteCount: clip.favoriteCount,
    isLiked: clip.isLiked,
    isFavorited: clip.isFavorited,
    source: 'live'
  };
}

function mapDemoReel(reel: DemoReel): ReelItem {
  return {
    id: reel.id,
    title: reel.title,
    description: ((reel as DemoReel & { description?: string }).description || ''),
    videoUrl: reel.videoUrl,
    posterUrl: reel.posterUrl || reel.thumbUrl,
    ownerDisplayName: 'AICar',
    ownerAvatarUrl: '',
    likeCount: 0,
    commentCount: 0,
    favoriteCount: 0,
    isLiked: false,
    isFavorited: false,
    source: 'demo'
  };
}

function ReelMedia({
  reel,
  active,
  videoRef,
  playbackFlash,
  onTogglePlayback,
  muted,
  volume,
  onVideoVolumeChange
}: {
  reel: ReelItem;
  active: boolean;
  videoRef: (node: HTMLVideoElement | null) => void;
  playbackFlash: PlaybackFlash;
  onTogglePlayback: () => void;
  muted: boolean;
  volume: number;
  onVideoVolumeChange: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
}) {
  const hasMedia = Boolean(reel.videoUrl || reel.posterUrl);
  const showFlash = playbackFlash?.reelId === reel.id;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0b1220]">
      <video
        ref={videoRef}
        src={reel.videoUrl || undefined}
        poster={reel.posterUrl || undefined}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        controls={active}
        autoPlay={active}
        onLoadedMetadata={(e) => {
          if (active) {
            try {
              e.currentTarget.muted = muted;
              e.currentTarget.volume = volume;
            } catch {}
            e.currentTarget.play().catch(() => {});
          }
        }}
        onVolumeChange={onVideoVolumeChange}
        className="h-full w-full object-cover"
      />

      <button
        type="button"
        onClick={onTogglePlayback}
        className="absolute inset-x-0 top-0 z-[5] block bottom-[112px] md:bottom-[132px]"
        aria-label="Toggle video playback"
      />


      {!hasMedia ? (
        <div className="absolute inset-0 flex items-center justify-center text-[18px] text-white">
          Video
        </div>
      ) : null}

      {showFlash ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="rounded-full bg-black/35 p-5 text-white backdrop-blur-sm">
            {playbackFlash?.mode === 'pause' ? (
              <Pause className="h-12 w-12" strokeWidth={2.4} />
            ) : (
              <Play className="h-12 w-12" strokeWidth={2.4} fill="currentColor" />
            )}
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-[56px] text-white md:px-5 md:pb-[56px]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/90 text-[13px] font-medium text-slate-900 md:h-11 md:w-11">
            {reel.ownerAvatarUrl ? (
              <img src={reel.ownerAvatarUrl} alt={reel.ownerDisplayName} className="h-full w-full object-cover" />
            ) : (
              <span>{reel.ownerDisplayName.slice(0, 1).toUpperCase()}</span>
            )}
          </div>

          <div className="min-w-0 max-w-[80%] pt-[2px]">
            <div className="truncate text-[14px] font-medium md:text-[15px]">{reel.ownerDisplayName}</div>
            <div className="mt-1 line-clamp-1 text-[18px] font-semibold leading-[1.1] md:text-[22px]">{reel.title}</div>
            {reel.description ? (
              <div className="mt-1 line-clamp-2 text-[13px] leading-[1.35] text-white md:text-[14px]">
                {reel.description}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionStack({
  reel,
  mobile = false,
  busyLike,
  busyFavorite,
  onRequireAuth,
  onPublish,
  onLike,
  onComment,
  onShare,
  onFavorite
}: {
  reel: ReelItem;
  mobile?: boolean;
  busyLike: boolean;
  busyFavorite: boolean;
  onRequireAuth: () => void;
  onPublish: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onFavorite: () => void;
}) {
  const iconSize = mobile ? 'h-6 w-6' : 'h-10 w-10';
  const labelClass = mobile ? 'text-[10px]' : 'text-[12px]';
  const gap = mobile ? 'gap-4' : 'gap-6';

  const btn = (active: boolean) =>
    `flex flex-col items-center ${labelClass} text-white ${active ? 'opacity-100' : 'opacity-95'} transition`;

  return (
    <div className={`flex flex-col items-center text-white ${gap}`}>
      <button
        type="button"
        onClick={onPublish}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white/16 text-white backdrop-blur"
        aria-label="Опубликовать AIClip"
      >
        <Plus className="h-6 w-6" strokeWidth={2} />
      </button>

      <button type="button" onClick={onLike} disabled={busyLike} className={btn(reel.isLiked)}>
        <Heart className={iconSize} strokeWidth={1.8} fill={reel.isLiked ? 'currentColor' : 'none'} />
        <span className="mt-1">{reel.likeCount}</span>
      </button>

      <button type="button" onClick={onComment} className={btn(false)}>
        <MessageCircle className={iconSize} strokeWidth={1.8} />
        <span className="mt-1">{reel.commentCount}</span>
      </button>

      <button type="button" onClick={onShare} className={btn(false)}>
        <Send className={iconSize} strokeWidth={1.8} />
      </button>

      <button type="button" onClick={onFavorite} disabled={busyFavorite} className={btn(reel.isFavorited)}>
        <Bookmark className={iconSize} strokeWidth={1.8} fill={reel.isFavorited ? 'currentColor' : 'none'} />
        <span className="mt-1">{reel.favoriteCount}</span>
      </button>

      <button type="button" onClick={onRequireAuth} className={btn(false)} aria-label="More">
        <MoreHorizontal className={iconSize} strokeWidth={1.8} />
      </button>
    </div>
  );
}

export function AIClipsPage({ reels }: { reels: DemoReel[] }) {
  const searchParams = useSearchParams();
  const requestedReel = searchParams.get('reel');

  const desktopScrollerRef = useRef<HTMLDivElement | null>(null);
  const mobileScrollerRef = useRef<HTMLDivElement | null>(null);

  const desktopSlideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileSlideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const desktopVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const mobileVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const wheelLockRef = useRef(0);
  const dragStartYRef = useRef<number | null>(null);
  const flashTimerRef = useRef<number | null>(null);

  const [items, setItems] = useState<ReelItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState('');
  const [busyLike, setBusyLike] = useState(false);
  const [busyFavorite, setBusyFavorite] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [playbackFlash, setPlaybackFlash] = useState<PlaybackFlash>(null);
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem('aicar_reel_muted') !== 'false';
  });
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const raw = Number(window.localStorage.getItem('aicar_reel_volume') || '1');
    return Number.isFinite(raw) ? Math.max(0, Math.min(1, raw)) : 1;
  });

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState<AIClipCommentDoc[]>([]);
  const [commentText, setCommentText] = useState('');

  const startIndex = useMemo(() => {
    if (!requestedReel) return 0;
    const idx = items.findIndex((r) => r.id === requestedReel);
    return idx >= 0 ? idx : 0;
  }, [requestedReel, items]);

  const activeReel = items[activeIndex] || null;

  function patchReel(next: ReelItem) {
    setItems((prev) => prev.map((item) => (item.id === next.id ? next : item)));
  }

  function goToIndex(index: number, smooth = true) {
    if (items.length === 0) return;
    const next = Math.max(0, Math.min(index, items.length - 1));
    scrollToIndex(desktopScrollerRef.current, next, smooth);
    scrollToIndex(mobileScrollerRef.current, next, smooth);
    setActiveIndex(next);
  }

  function goNext() {
    if (items.length <= 1) return;
    goToIndex(activeIndex >= items.length - 1 ? 0 : activeIndex + 1, true);
  }

  function goPrev() {
    if (items.length <= 1) return;
    goToIndex(activeIndex <= 0 ? items.length - 1 : activeIndex - 1, true);
  }

  function loginTarget() {
    const next = activeReel ? `/aiclips?reel=${encodeURIComponent(activeReel.id)}` : '/aiclips';
    return `/login?next=${encodeURIComponent(next)}`;
  }

  function requireAuth(): boolean {
    if (authenticated) return true;
    window.location.assign(loginTarget());
    return false;
  }

  function openPublish() {
    if (!requireAuth()) return;
    window.location.assign('/profile');
  }

  function currentVideoElement() {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return desktopVideoRefs.current[activeIndex] || null;
    }
    return mobileVideoRefs.current[activeIndex] || null;
  }

  function flashPlayback(mode: 'play' | 'pause') {
    if (!activeReel) return;

    setPlaybackFlash({
      reelId: activeReel.id,
      mode
    });

    if (flashTimerRef.current) {
      window.clearTimeout(flashTimerRef.current);
    }

    flashTimerRef.current = window.setTimeout(() => {
      setPlaybackFlash(null);
    }, 520);
  }

  function handleVideoVolumeChange(e: React.SyntheticEvent<HTMLVideoElement>) {
    const nextMuted = e.currentTarget.muted;
    const nextVolume = e.currentTarget.volume;

    setMuted(nextMuted);
    setVolume(nextVolume);

    try {
      window.localStorage.setItem('aicar_reel_muted', String(nextMuted));
      window.localStorage.setItem('aicar_reel_volume', String(nextVolume));
    } catch {}
  }

  function toggleCurrentPlayback() {
    const video = currentVideoElement();
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      flashPlayback('play');
    } else {
      video.pause();
      flashPlayback('pause');
    }
  }

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
        setFeedLoading(true);

        const data = await fetchAuthJSON<{ ok: true; clips: AIClipView[] }>('/api/aiclips/feed');

        if (!alive) return;

        if (Array.isArray(data.clips) && data.clips.length > 0) {
          setItems(data.clips.map(mapLiveClip));
        } else {
          setItems(reels.map(mapDemoReel));
        }
      } catch {
        if (!alive) return;
        setItems(reels.map(mapDemoReel));
      } finally {
        if (alive) setFeedLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [reels]);

  useEffect(() => {
    if (items.length === 0) return;

    setActiveIndex(startIndex);

    const id = window.requestAnimationFrame(() => {
      scrollToIndex(desktopScrollerRef.current, startIndex, false);
      scrollToIndex(mobileScrollerRef.current, startIndex, false);
    });

    return () => window.cancelAnimationFrame(id);
  }, [startIndex, items.length]);

  useEffect(() => {
    const desktopNodes = desktopSlideRefs.current.filter(Boolean) as HTMLDivElement[];
    const mobileNodes = mobileSlideRefs.current.filter(Boolean) as HTMLDivElement[];

    const desktopObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = desktopNodes.indexOf(visible.target as HTMLDivElement);
        if (idx >= 0) setActiveIndex(idx);
      },
      { root: desktopScrollerRef.current, threshold: [0.55, 0.7, 0.85] }
    );

    const mobileObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = mobileNodes.indexOf(visible.target as HTMLDivElement);
        if (idx >= 0) setActiveIndex(idx);
      },
      { root: mobileScrollerRef.current, threshold: [0.55, 0.7, 0.85] }
    );

    desktopNodes.forEach((n) => desktopObserver.observe(n));
    mobileNodes.forEach((n) => mobileObserver.observe(n));

    return () => {
      desktopObserver.disconnect();
      mobileObserver.disconnect();
    };
  }, [items.length]);

  useEffect(() => {
    const syncVideos = async (refs: (HTMLVideoElement | null)[]) => {
      for (let i = 0; i < refs.length; i += 1) {
        const el = refs[i];
        if (!el) continue;

        try {
          el.muted = muted;
          el.volume = volume;
        } catch {}

        if (i === activeIndex) {
          try {
            await el.play();
          } catch {}
        } else {
          try {
            el.pause();
            el.currentTime = 0;
          } catch {}
        }
      }
    };

    syncVideos(desktopVideoRefs.current);
    syncVideos(mobileVideoRefs.current);
  }, [activeIndex, items, muted, volume]);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!activeReel || activeReel.source !== 'live') {
        if (alive) setActiveCommentsEnabled(null);
        return;
      }

      const canModerate = Boolean(currentIsAdmin || (currentUid && activeReel.ownerUid === currentUid));
      if (!canModerate) {
        if (alive) setActiveCommentsEnabled(null);
        return;
      }

      try {
        const data = await fetchAuthJSON<{ ok: true; policy: { enabled: boolean } }>(
          `/api/aiclips/${encodeURIComponent(activeReel.id)}/comments-policy`
        );
        if (!alive) return;
        setActiveCommentsEnabled(data.policy?.enabled !== false);
      } catch {
        if (!alive) return;
        setActiveCommentsEnabled(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, [activeReel?.id, activeReel?.ownerUid, activeReel?.source, currentUid, currentIsAdmin]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) {
        window.clearTimeout(flashTimerRef.current);
      }
    };
  }, []);

  function onDesktopWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (Math.abs(e.deltaY) < 24) return;
    e.preventDefault();

    const now = Date.now();
    if (now - wheelLockRef.current < 420) return;
    wheelLockRef.current = now;

    if (e.deltaY > 0) {
      goNext();
    } else {
      goPrev();
    }
  }

  function onDesktopPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const localY = e.clientY - rect.top;

    if (localY > rect.height - 120) {
      dragStartYRef.current = null;
      return;
    }

    dragStartYRef.current = e.clientY;
  }

  function onDesktopPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (dragStartYRef.current == null) return;

    const delta = e.clientY - dragStartYRef.current;
    dragStartYRef.current = null;

    if (Math.abs(delta) < 60) return;

    if (delta < 0) {
      goNext();
    } else {
      goPrev();
    }
  }

  async function openComments() {
    if (!activeReel) return;
    if (!requireAuth()) return;

    try {
      setCommentsOpen(true);
      setCommentsLoading(true);

      if (activeReel.source === 'demo') {
        setComments([]);
        setStatus('Для demo-клипов комментарии не сохраняются.');
        return;
      }

      const data = await fetchAuthJSON<{ ok: true; comments: AIClipCommentDoc[] }>(
        `/api/aiclips/${encodeURIComponent(activeReel.id)}/comments`
      );

      setComments(data.comments || []);
      setStatus('');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка загрузки комментариев'));
    } finally {
      setCommentsLoading(false);
    }
  }

  async function toggleLike() {
    if (!activeReel) return;
    if (!requireAuth()) return;

    if (activeReel.source === 'demo') {
      setStatus('Лайки работают только для опубликованных AIClips.');
      return;
    }

    try {
      setBusyLike(true);

      const method = activeReel.isLiked ? 'DELETE' : 'POST';
      const data = await fetchAuthJSON<{ ok: true; clip: AIClipView }>(
        `/api/aiclips/${encodeURIComponent(activeReel.id)}/like`,
        { method }
      );

      patchReel(mapLiveClip(data.clip));
      setStatus('');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка'));
    } finally {
      setBusyLike(false);
    }
  }

  async function toggleFavorite() {
    if (!activeReel) return;
    if (!requireAuth()) return;

    if (activeReel.source === 'demo') {
      setStatus('Избранное работает только для опубликованных AIClips.');
      return;
    }

    try {
      setBusyFavorite(true);

      const method = activeReel.isFavorited ? 'DELETE' : 'POST';
      const data = await fetchAuthJSON<{ ok: true; clip: AIClipView }>(
        `/api/aiclips/${encodeURIComponent(activeReel.id)}/favorite`,
        { method }
      );

      patchReel(mapLiveClip(data.clip));
      setStatus('');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка'));
    } finally {
      setBusyFavorite(false);
    }
  }

  async function submitComment() {
    if (!activeReel || !commentText.trim()) return;
    if (!requireAuth()) return;

    if (activeReel.source === 'demo') {
      setStatus('Комментарии работают только для опубликованных AIClips.');
      return;
    }

    try {
      const data = await fetchAuthJSON<{ ok: true; comment: AIClipCommentDoc }>(
        `/api/aiclips/${encodeURIComponent(activeReel.id)}/comments`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text: commentText.trim() })
        }
      );

      setComments((prev) => [...prev, data.comment]);
      setCommentText('');
      patchReel({
        ...activeReel,
        commentCount: activeReel.commentCount + 1
      });
      setStatus('');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка'));
    }
  }

  async function toggleActiveClipComments(nextEnabled: boolean) {
    if (!activeReel || activeReel.source !== 'live') return;
    if (!(currentIsAdmin || (currentUid && activeReel.ownerUid === currentUid))) return;

    try {
      setCommentsPolicyBusy(true);
      setStatus(nextEnabled ? 'Включение комментариев…' : 'Отключение комментариев…');

      const data = await fetchAuthJSON<{ ok: true; policy: { enabled: boolean } }>(
        `/api/aiclips/${encodeURIComponent(activeReel.id)}/comments-policy`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ enabled: nextEnabled })
        }
      );

      setActiveCommentsEnabled(data.policy?.enabled !== false);
      setStatus(nextEnabled ? 'Комментарии на видео включены ✅' : 'Комментарии на видео отключены ✅');
    } catch (e) {
      setStatus(String((e as any)?.message || e || 'Ошибка изменения комментариев'));
    } finally {
      setCommentsPolicyBusy(false);
    }
  }

  async function shareClip() {
    if (!activeReel) return;

    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/aiclips?reel=${encodeURIComponent(activeReel.id)}`
        : `/aiclips?reel=${encodeURIComponent(activeReel.id)}`;

    try {
      await navigator.clipboard.writeText(url);
      setStatus('Ссылка на AIClip скопирована ✅');
    } catch {
      setStatus(url);
    }
  }

  if (feedLoading) {
    return (
      <section className="flex h-full items-center justify-center bg-[#a9a9a9] px-4">
        <div className="flex items-center gap-8">
          <div
            className="animate-pulse bg-[#8f8f8f]"
            style={{
              aspectRatio: `${PROTO_W} / ${PROTO_H}`,
              height: 'min(calc(100dvh - 56px - 24px), 1040px)'
            }}
          />
          <div className="hidden md:flex flex-col items-center gap-4 text-white">
            <Loader2 className="h-10 w-10 animate-spin" />
            <div className="text-[14px]">Загрузка AIClips…</div>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="flex h-full items-center justify-center bg-[#a9a9a9] px-4">
        <div className="text-center text-[20px] text-white">Пока нет роликов AIClips</div>
      </section>
    );
  }

  return (
    <>
      {status ? (
        <div className="fixed left-1/2 top-[92px] z-40 -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-[13px] text-white">
          {status}
        </div>
      ) : null}

      <div className="hidden h-full md:block">
        <section className="relative h-full overflow-hidden bg-[#a9a9a9]">
          <div className="mx-auto flex h-full max-w-[1900px] items-center justify-center px-6 py-3">
            <div className="flex items-center gap-8" onWheel={onDesktopWheel}>
              <div
                className="relative shrink-0 select-none"
                style={{
                  aspectRatio: `${PROTO_W} / ${PROTO_H}`,
                  height: 'min(calc(100dvh - 56px - 20px), 1060px)'
                }}
                onPointerDown={onDesktopPointerDown}
                onPointerUp={onDesktopPointerUp}
              >
                <div
                  ref={desktopScrollerRef}
                  className="h-full w-full overflow-y-auto overscroll-contain snap-y snap-mandatory bg-[#0b1220] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {items.map((reel, idx) => (
                    <div
                      key={reel.id}
                      ref={(node) => {
                        desktopSlideRefs.current[idx] = node;
                      }}
                      className="h-full snap-start"
                    >
                      <ReelMedia
                        reel={reel}
                        active={idx === activeIndex}
                        playbackFlash={playbackFlash}
                        onTogglePlayback={toggleCurrentPlayback}
                        muted={muted}
                        volume={volume}
                        onVideoVolumeChange={handleVideoVolumeChange}
                        videoRef={(node) => {
                          desktopVideoRefs.current[idx] = node;
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="flex flex-col items-center justify-between text-white"
                style={{ height: 'min(calc(100dvh - 56px - 20px), 1060px)' }}
              >
                <div className="h-12 w-12" />

                {activeReel ? (
                  <div className="flex flex-col items-center gap-4">
                    <ActionStack
                      reel={activeReel}
                      busyLike={busyLike}
                      busyFavorite={busyFavorite}
                      onRequireAuth={() => {
                        if (!authenticated) {
                          window.location.assign(loginTarget());
                          return;
                        }
                        setStatus('');
                      }}
                      onPublish={openPublish}
                      onLike={toggleLike}
                      onComment={openComments}
                      onShare={shareClip}
                      onFavorite={toggleFavorite}
                    />

                    {(currentIsAdmin || (currentUid && activeReel.ownerUid === currentUid)) && activeReel.source === 'live' ? (
                      <button
                        type="button"
                        disabled={commentsPolicyBusy}
                        onClick={() => void toggleActiveClipComments(!(activeCommentsEnabled !== false))}
                        className="flex flex-col items-center text-[12px] text-white disabled:opacity-60"
                      >
                        <MessageSquareOff className="h-10 w-10" strokeWidth={1.8} />
                        <span className="mt-1">
                          {activeCommentsEnabled === false ? 'Вкл. комм.' : 'Откл. комм.'}
                        </span>
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div />
                )}

                <div className="flex flex-col items-center gap-4">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/16 text-white backdrop-blur"
                    aria-label="Предыдущее видео"
                  >
                    <ChevronUp className="h-7 w-7" strokeWidth={1.8} />
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/16 text-white backdrop-blur"
                    aria-label="Следующее видео"
                  >
                    <ChevronDown className="h-7 w-7" strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="md:hidden h-[calc(100dvh-56px)]">
        <section className="h-full overflow-hidden bg-[#a9a9a9]">
          <div className="flex h-full items-center justify-center">
            <div className="relative flex h-full w-full flex-col">
              <div
                ref={mobileScrollerRef}
                className="flex-1 w-full overflow-y-auto overscroll-contain snap-y snap-mandatory bg-[#0b1220] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {items.map((reel, idx) => (
                  <div
                    key={reel.id}
                    ref={(node) => {
                      mobileSlideRefs.current[idx] = node;
                    }}
                    className="relative h-full snap-start"
                  >
                    <ReelMedia
                      reel={reel}
                      active={idx === activeIndex}
                      playbackFlash={playbackFlash}
                      onTogglePlayback={toggleCurrentPlayback}
                      muted={muted}
                      volume={volume}
                      onVideoVolumeChange={handleVideoVolumeChange}
                      videoRef={(node) => {
                        mobileVideoRefs.current[idx] = node;
                      }}
                    />

                    {activeReel && idx === activeIndex ? (
                      <div className="absolute bottom-[138px] right-[10px] z-10 flex flex-col items-center gap-4">
                        <ActionStack
                          reel={activeReel}
                          mobile
                          busyLike={busyLike}
                          busyFavorite={busyFavorite}
                          onRequireAuth={() => {
                            if (!authenticated) {
                              window.location.assign(loginTarget());
                              return;
                            }
                            setStatus('');
                          }}
                          onPublish={openPublish}
                          onLike={toggleLike}
                          onComment={openComments}
                          onShare={shareClip}
                          onFavorite={toggleFavorite}
                        />

                        {(currentIsAdmin || (currentUid && activeReel.ownerUid === currentUid)) && activeReel.source === 'live' ? (
                          <button
                            type="button"
                            disabled={commentsPolicyBusy}
                            onClick={() => void toggleActiveClipComments(!(activeCommentsEnabled !== false))}
                            className="flex flex-col items-center text-[10px] text-white disabled:opacity-60"
                          >
                            <MessageSquareOff className="h-6 w-6" strokeWidth={1.8} />
                            <span className="mt-1">
                              {activeCommentsEnabled === false ? 'Вкл. комм.' : 'Откл. комм.'}
                            </span>
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="flex h-[44px] items-center justify-center bg-[#a9a9a9]">
                {items.length > 1 ? (
                  <button
                    type="button"
                    aria-label="Next reel"
                    onClick={goNext}
                    className="text-white"
                  >
                    <ChevronDown className="h-[32px] w-[32px]" strokeWidth={1.7} />
                  </button>
                ) : (
                  <div className="text-white">
                    <ChevronDown className="h-[32px] w-[32px]" strokeWidth={1.7} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {commentsOpen ? (
        <>
          <button
            type="button"
            onClick={() => setCommentsOpen(false)}
            className="fixed inset-0 z-40 bg-black/45"
            aria-label="Close comments"
          />

          <div className="fixed bottom-0 right-0 z-50 flex h-[78dvh] w-full flex-col rounded-t-[24px] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.22)] md:top-0 md:h-full md:w-[420px] md:rounded-none">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <div>
                <div className="text-[17px] font-semibold text-slate-900">Комментарии</div>
                <div className="text-[12px] text-slate-500">{activeReel?.title || 'AIClip'}</div>
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