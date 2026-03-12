'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bookmark, ChevronDown, Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import type { DemoReel } from '@/lib/site/types';

function ReelMedia({
  reel,
  active,
  videoRef
}: {
  reel: DemoReel;
  active: boolean;
  videoRef: (node: HTMLVideoElement | null) => void;
}) {
  const hasMedia = Boolean(reel.videoUrl || reel.posterUrl);

  return (
    <div className="relative h-full w-full bg-[#b3b3b3]">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src={reel.videoUrl || undefined}
        poster={reel.posterUrl || undefined}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />

      {!hasMedia ? (
        <div className="absolute inset-0 flex items-center justify-center text-[18px] text-black">
          Video
        </div>
      ) : null}

      {!active ? <div className="absolute inset-0 bg-black/8" /> : null}
    </div>
  );
}

function ActionStack({ mobile = false }: { mobile?: boolean }) {
  const iconSize = mobile ? 'h-8 w-8' : 'h-11 w-11';
  const gap = mobile ? 'gap-6' : 'gap-7';

  return (
    <div className={`flex flex-col items-center text-white ${gap}`}>
      <Heart className={iconSize} strokeWidth={1.8} />
      <MessageCircle className={iconSize} strokeWidth={1.8} />
      <Send className={iconSize} strokeWidth={1.8} />
      <Bookmark className={iconSize} strokeWidth={1.8} />
      <MoreHorizontal className={iconSize} strokeWidth={1.8} />
    </div>
  );
}

export function AIClipsPage({ reels }: { reels: DemoReel[] }) {
  const items = reels && reels.length > 0 ? reels : [];
  const searchParams = useSearchParams();
  const requestedReel = searchParams.get('reel');

  const desktopScrollerRef = useRef<HTMLDivElement | null>(null);
  const mobileScrollerRef = useRef<HTMLDivElement | null>(null);

  const desktopSlideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileSlideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const desktopVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const mobileVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const [activeIndex, setActiveIndex] = useState(0);

  const startIndex = useMemo(() => {
    if (!requestedReel) return 0;
    const idx = items.findIndex((r) => r.id === requestedReel);
    return idx >= 0 ? idx : 0;
  }, [requestedReel, items]);

  useEffect(() => {
    setActiveIndex(startIndex);

    const id = window.requestAnimationFrame(() => {
      desktopSlideRefs.current[startIndex]?.scrollIntoView({ block: 'start' });
      mobileSlideRefs.current[startIndex]?.scrollIntoView({ block: 'start' });
    });

    return () => window.cancelAnimationFrame(id);
  }, [startIndex]);

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
      {
        root: desktopScrollerRef.current,
        threshold: [0.55, 0.7, 0.85]
      }
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
      {
        root: mobileScrollerRef.current,
        threshold: [0.55, 0.7, 0.85]
      }
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
  }, [activeIndex]);

  const goNext = () => {
    if (items.length <= 1) return;

    const next = activeIndex >= items.length - 1 ? 0 : activeIndex + 1;

    desktopSlideRefs.current[next]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    mobileSlideRefs.current[next]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    setActiveIndex(next);
  };

  if (items.length === 0) {
    return (
      <section className="bg-[#a9a9a9] px-4 py-20">
        <div className="mx-auto max-w-[1100px] text-center text-[20px] text-white">
          Пока нет роликов AIClips
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <section className="bg-[#a9a9a9]">
          <div className="relative mx-auto h-[1010px] max-w-[1440px] px-4">
            <div className="absolute left-1/2 top-[18px] -translate-x-1/2">
              <div className="h-[820px] w-[660px] overflow-hidden rounded-[16px] bg-[#d3d3d3]">
                <div
                  ref={desktopScrollerRef}
                  className="h-full overflow-y-auto snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {items.map((reel, idx) => (
                    <div
                      key={reel.id}
                      ref={(node) => {
                        desktopSlideRefs.current[idx] = node;
                      }}
                      className="h-[820px] snap-start"
                    >
                      <ReelMedia
                        reel={reel}
                        active={idx === activeIndex}
                        videoRef={(node) => {
                          desktopVideoRefs.current[idx] = node;
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-[145px] left-[220px] h-[78px] w-[78px] rounded-full bg-white/95" />

            <div className="absolute right-[240px] top-1/2 -translate-y-1/2">
              <ActionStack />
            </div>

            {items.length > 1 ? (
              <button
                type="button"
                aria-label="Next reel"
                onClick={goNext}
                className="absolute bottom-[28px] left-1/2 -translate-x-1/2 text-white transition hover:scale-105"
              >
                <ChevronDown className="h-[72px] w-[72px]" strokeWidth={1.7} />
              </button>
            ) : (
              <div className="absolute bottom-[28px] left-1/2 -translate-x-1/2 text-white">
                <ChevronDown className="h-[72px] w-[72px]" strokeWidth={1.7} />
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="md:hidden">
        <section className="bg-[#a9a9a9]">
          <div className="relative">
            <div
              ref={mobileScrollerRef}
              className="h-[1160px] overflow-y-auto snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {items.map((reel, idx) => (
                <div
                  key={reel.id}
                  ref={(node) => {
                    mobileSlideRefs.current[idx] = node;
                  }}
                  className="relative h-[1160px] snap-start"
                >
                  <ReelMedia
                    reel={reel}
                    active={idx === activeIndex}
                    videoRef={(node) => {
                      mobileVideoRefs.current[idx] = node;
                    }}
                  />

                  <div className="absolute bottom-[205px] right-[26px]">
                    <ActionStack mobile />
                  </div>

                  <div className="absolute bottom-[28px] left-[18px] h-[92px] w-[92px] rounded-full bg-white/92" />
                </div>
              ))}
            </div>

            <div className="flex h-[128px] items-center justify-center bg-[#9f9f9f]">
              {items.length > 1 ? (
                <button
                  type="button"
                  aria-label="Next reel"
                  onClick={goNext}
                  className="text-white transition hover:scale-105"
                >
                  <ChevronDown className="h-[78px] w-[78px]" strokeWidth={1.7} />
                </button>
              ) : (
                <ChevronDown className="h-[78px] w-[78px] text-white" strokeWidth={1.7} />
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}