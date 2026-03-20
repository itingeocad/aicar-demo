'use client';

import Link from 'next/link';
import React from 'react';
import { ChevronLeft, ChevronRight, Eye, Heart, Loader2, Play } from 'lucide-react';
import type { DemoReel } from '@/lib/site/types';
import type { AIClipView } from '@/lib/aiclips/types';

type StripReel = {
  id: string;
  title: string;
  thumbUrl?: string;
  posterUrl?: string;
  previewUrl?: string;
  videoUrl?: string;
  views?: number;
  likes?: number;
  badges?: string[];
  linkedCarId?: string;
};

function formatCount(n?: number) {
  const v = typeof n === 'number' ? n : 0;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(v);
}

function Badge({ text }: { text: string }) {
  const cls = text === 'Top' ? 'bg-amber-500/90 text-white' : 'bg-emerald-500/90 text-white';
  return <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${cls}`}>{text}</span>;
}

function mapDemoReel(reel: DemoReel): StripReel {
  return {
    id: reel.id,
    title: reel.title,
    thumbUrl: reel.thumbUrl ?? reel.posterUrl,
    posterUrl: reel.posterUrl,
    previewUrl: reel.previewUrl ?? reel.videoUrl,
    videoUrl: reel.videoUrl,
    views: reel.views,
    likes: reel.likes,
    badges: reel.badges ? [...reel.badges] : undefined,
    linkedCarId: reel.linkedCarId
  };
}

function mapLiveClip(clip: AIClipView): StripReel {
  return {
    id: clip.id,
    title: clip.title,
    thumbUrl: clip.posterUrl || clip.videoUrl,
    posterUrl: clip.posterUrl,
    previewUrl: clip.videoUrl,
    videoUrl: clip.videoUrl,
    views: clip.commentCount ?? 0,
    likes: clip.likeCount ?? 0,
    badges: ['AI'],
    linkedCarId: undefined
  };
}

function ReelCard({ reel }: { reel: StripReel }) {
  const [hover, setHover] = React.useState(false);
  const vref = React.useRef<HTMLVideoElement | null>(null);

  const thumb = reel.thumbUrl ?? reel.posterUrl ?? reel.videoUrl ?? '';
  const preview = reel.previewUrl ?? reel.videoUrl ?? '';
  const href = reel.linkedCarId
    ? `/aiclips?reel=${encodeURIComponent(reel.id)}&car=${encodeURIComponent(reel.linkedCarId)}`
    : `/aiclips?reel=${encodeURIComponent(reel.id)}`;

  const onEnter = async () => {
    if (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(hover: hover)').matches) return;
    setHover(true);
    const el = vref.current;
    if (!el) return;
    try {
      el.currentTime = 0;
      await el.play();
    } catch {}
  };

  const onLeave = () => {
    setHover(false);
    const el = vref.current;
    if (!el) return;
    try {
      el.pause();
      el.currentTime = 0;
    } catch {}
  };

  return (
    <Link
      href={href}
      className="group block w-full shrink-0"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-label={reel.title}
    >
      <div className="relative aspect-[200/354] overflow-hidden rounded-[12px] bg-slate-200 shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
        {thumb ? (
          <img
            src={thumb}
            alt={reel.title}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${hover ? 'opacity-0' : 'opacity-100'}`}
            loading="lazy"
          />
        ) : null}

        {preview ? (
          <video
            ref={vref}
            src={preview}
            poster={thumb}
            muted
            loop
            playsInline
            preload="metadata"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${hover ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/10" />

        <div className="absolute left-2 top-2 flex gap-1">
          {(reel.badges ?? []).map((b) => (
            <Badge key={b} text={b} />
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm transition group-hover:bg-black/45">
            <Play className="h-5 w-5 text-white" fill="white" />
          </div>
        </div>

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{formatCount(reel.views)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{formatCount(reel.likes)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LoadingCard() {
  return (
    <div className="w-[200px] shrink-0">
      <div className="relative aspect-[200/354] overflow-hidden rounded-[12px] bg-slate-200 shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/90" />
        </div>
      </div>
    </div>
  );
}

export function ReelsStripClient({
  reels,
  showArrows
}: {
  reels: DemoReel[];
  showArrows?: boolean;
}) {
  const [items, setItems] = React.useState<StripReel[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [mobileIndex, setMobileIndex] = React.useState(0);
  const [desktopIndex, setDesktopIndex] = React.useState(0);
  const desktopScrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const res = await fetch('/api/aiclips/feed', {
          cache: 'no-store',
          credentials: 'include'
        });

        const data = await res.json().catch(() => ({}));

        if (!alive) return;

        if (res.ok && Array.isArray((data as any)?.clips) && (data as any).clips.length > 0) {
          setItems((data as any).clips.map(mapLiveClip));
        } else {
          setItems(reels.map(mapDemoReel));
        }
      } catch {
        if (!alive) return;
        setItems(reels.map(mapDemoReel));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [reels]);

  React.useEffect(() => {
    if (mobileIndex >= items.length && items.length > 0) {
      setMobileIndex(0);
    }
  }, [items.length, mobileIndex]);

  const desktopVisibleCount = 4;
  const desktopItems = items.length > 0 ? items : [];
  const maxDesktopIndex = Math.max(0, desktopItems.length - desktopVisibleCount);

  function desktopPrev() {
    if (desktopItems.length <= desktopVisibleCount) return;
    setDesktopIndex((prev) => (prev <= 0 ? maxDesktopIndex : prev - 1));
  }

  function desktopNext() {
    if (desktopItems.length <= desktopVisibleCount) return;
    setDesktopIndex((prev) => (prev >= maxDesktopIndex ? 0 : prev + 1));
  }

  function mobilePrev() {
    if (items.length <= 1) return;
    setMobileIndex((prev) => (prev <= 0 ? items.length - 1 : prev - 1));
  }

  function mobileNext() {
    if (items.length <= 1) return;
    setMobileIndex((prev) => (prev >= items.length - 1 ? 0 : prev + 1));
  }

  const mobileItem = items[mobileIndex];

  return (
    <>
      <div className="relative hidden md:block">
        {showArrows ? (
          <>
            <button
              aria-label="prev"
              className="absolute -left-10 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
              type="button"
              onClick={desktopPrev}
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
            <button
              aria-label="next"
              className="absolute -right-10 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
              type="button"
              onClick={desktopNext}
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          </>
        ) : null}

        <div className="mx-auto max-w-[926px] overflow-hidden pb-2">
          {loading ? (
            <div className="grid grid-cols-4 gap-x-[42px]">
              {Array.from({ length: 4 }).map((_, idx) => <LoadingCard key={idx} />)}
            </div>
          ) : (
            <div
              className="flex gap-x-[42px] transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${desktopIndex * 242}px)` }}
            >
              {items.map((r) => (
                <div key={r.id} className="w-[200px] shrink-0">
                  <ReelCard reel={r} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative md:hidden">
        {showArrows && !loading ? (
          <>
            <button
              aria-label="prev"
              className="absolute -left-5 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              type="button"
              onClick={mobilePrev}
            >
              <ChevronLeft className="h-9 w-9" />
            </button>
            <button
              aria-label="next"
              className="absolute -right-5 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              type="button"
              onClick={mobileNext}
            >
              <ChevronRight className="h-9 w-9" />
            </button>
          </>
        ) : null}

        <div className="mx-auto max-w-[200px]">
          {loading ? (
            <LoadingCard />
          ) : mobileItem ? (
            <ReelCard reel={mobileItem} />
          ) : (
            <div className="aspect-[200/354] rounded-[12px] bg-slate-200" />
          )}
        </div>
      </div>
    </>
  );
}