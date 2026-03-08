'use client';

import Link from 'next/link';
import React from 'react';
import { ChevronLeft, ChevronRight, Eye, Heart, Play } from 'lucide-react';
import type { DemoReel } from '@/lib/site/types';

function formatCount(n?: number) {
  const v = typeof n === 'number' ? n : 0;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(v);
}

function Badge({ text }: { text: string }) {
  const cls =
    text === 'Top'
      ? 'bg-amber-500/90 text-white'
      : 'bg-emerald-500/90 text-white';
  return <span className={`px-2 py-1 text-[10px] font-semibold rounded-full ${cls}`}>{text}</span>;
}

function ReelCard({ reel }: { reel: DemoReel }) {
  const [hover, setHover] = React.useState(false);
  const vref = React.useRef<HTMLVideoElement | null>(null);

  const thumb = reel.thumbUrl ?? reel.posterUrl;
  const preview = reel.previewUrl ?? reel.videoUrl;
  const href = reel.linkedCarId ? `/aiclips?reel=${encodeURIComponent(reel.id)}&car=${encodeURIComponent(reel.linkedCarId)}` : `/aiclips?reel=${encodeURIComponent(reel.id)}`;

  const onEnter = async () => {
    // Only try to auto-play on devices that support hover.
    if (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(hover: hover)').matches) return;
    setHover(true);
    const el = vref.current;
    if (!el) return;
    try {
      el.currentTime = 0;
      await el.play();
    } catch {
      // ignore autoplay restrictions
    }
  };

  const onLeave = () => {
    setHover(false);
    const el = vref.current;
    if (!el) return;
    try {
      el.pause();
      el.currentTime = 0;
    } catch {
      // ignore
    }
  };

  return (
    <Link
      href={href}
      className="group w-full"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-label={reel.title}
    >
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-slate-200 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumb}
          alt={reel.title}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${hover ? 'opacity-0' : 'opacity-100'}`}
          loading="lazy"
        />

        {/* Hover preview (desktop) */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/10" />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex gap-1">
          {(reel.badges ?? []).map((b) => (
            <Badge key={b} text={b} />
          ))}
        </div>

        {/* Play icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/50 transition">
            <Play className="h-5 w-5 text-white" fill="white" />
          </div>
        </div>

        {/* Counters */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs">
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

export function ReelsStripClient({
  reels,
  showArrows
}: {
  reels: DemoReel[];
  showArrows?: boolean;
}) {
  const items = reels.slice(0, 4);
  const first = items[0];

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block relative">
        {showArrows ? (
          <>
            <button
              aria-label="prev"
              className="absolute -left-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              type="button"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
            <button
              aria-label="next"
              className="absolute -right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              type="button"
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          </>
        ) : null}

        <div className="grid grid-cols-4 gap-8 justify-items-center">
          {items.map((r) => (
            <div key={r.id} className="w-full max-w-[210px]">
              <ReelCard reel={r} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden relative">
        {showArrows ? (
          <>
            <button aria-label="prev" className="absolute -left-6 top-1/2 -translate-y-1/2 text-slate-400" type="button">
              <ChevronLeft className="h-10 w-10" />
            </button>
            <button aria-label="next" className="absolute -right-6 top-1/2 -translate-y-1/2 text-slate-400" type="button">
              <ChevronRight className="h-10 w-10" />
            </button>
          </>
        ) : null}
        <div className="mx-auto max-w-xs">
          {first ? <ReelCard reel={first} /> : <div className="aspect-[9/16] rounded-2xl bg-slate-200 shadow-sm" />}
        </div>
      </div>
    </>
  );
}
