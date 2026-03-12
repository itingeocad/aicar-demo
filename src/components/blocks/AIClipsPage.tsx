'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bookmark, ChevronDown, Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import type { DemoReel } from '@/lib/site/types';

function ReelSlide({
  reel,
  active,
  videoRef,
  mobile = false,
  showMeta = true
}: {
  reel: DemoReel;
  active: boolean;
  videoRef: (node: HTMLVideoElement | null) => void;
  mobile?: boolean;
  showMeta?: boolean;
}) {
  const hasMedia = Boolean(reel.videoUrl || reel.posterUrl);

  return (
    <div className={mobile ? 'relative h-full w-full bg-[#b3b3b3]' : 'relative h-full w-full overflow-hidden rounded-[18px] bg-black'}>
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

      {showMeta ? <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/10" /> : null}

      {showMeta ? (
        <div className={mobile ? 'absolute bottom-5 left-4 right-4 text-white' : 'absolute bottom-7 left-6 right-6 text-white'}>
          <div className={mobile ? 'text-[18px] font-medium leading-[1.2]' : 'text-[22px] font-medium leading-[1.15]'}>
            {reel.title}
          </div>
          <div className={mobile ? 'mt-1 text-[14px] text-white/85' : 'mt-2 text-[15px] text-white/85'}>
            @{reel.author}
          </div>

          {reel.badges && reel.badges.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {reel.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-white/18 px-3 py-1 text-[12px] font-medium text-white backdrop-blur-sm"
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {!active ? <div className="absolute inset-0 bg-black/10" /> : null}
    </div>
  );
}

function SideActions({ mobile = false }: { mobile?: boolean }) {
  const iconClass = mobile ? 'h-8 w-8' : 'h-11 w-11';
  const gapClass = mobile ? 'gap-6' : 'gap-7';

  return (
    <div className={`flex flex-col items-center text-white ${gapClass}`}>
      <Heart className={iconClass} strokeWidth={1.8} />
      <MessageCircle className={iconClass} strokeWidth={1.8} />
      <Send className={iconClass} strokeWidth={1.8} />
      <Bookmark className={iconClass} strokeWidth={1.8} />
      <MoreHorizontal className={iconClass} strokeWidth={1.8} />
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

    const scrollToInitial = () => {
      desktopSlideRefs.current[startIndex]?.scrollIntoView({ block: 'start' });
      mobileSlideRefs.current[startIndex]?.scrollIntoView({ block: 'start' });
    };

    const id = window.requestAnimationFrame(scrollToInitial);
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
    desktopSlideRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    mobileSlideRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          <div className="mx-auto max-w-[1400px] px-4 py-3">
            <div className="relative min-h-[1180px]">
              <div className="absolute left-[210px] bottom-[165px] h-[78px] w-[78px] rounded-full bg-white/95" />

              <div className="absolute left-1/2 top-3 -translate-x-1/2">
                <div className="h-[1040px] w-[640px] overflow-hidden rounded-[18px] bg-[#d5d5d5]">
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
                        className="h-[1040px]"
                      >
                        <ReelSlide
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

              <div className="absolute right-[230px] top-1/2 -translate-y-1/2">
                <SideActions />
              </div>

              {items.length > 1 ? (
                <button
                  type="button"
                  aria-label="Next reel"
                  onClick={goNext}
                  className="absolute bottom-[45px] left-1/2 -translate-x-1/2 text-white transition hover:scale-105"
                >
                  <ChevronDown className="h-16 w-16" strokeWidth={1.7} />
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <div className="md:hidden">
        <section className="bg-[#a9a9a9]">
          <div className="relative">
            <div
              ref={mobileScrollerRef}
              className="h-[1120px] overflow-y-auto snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {items.map((reel, idx) => (
                <div
                  key={reel.id}
                  ref={(node) => {
                    mobileSlideRefs.current[idx] = node;
                  }}
                  className="relative h-[1120px] snap-start"
                >
                  <div className="h-full w-full overflow-hidden bg-[#b3b3b3]">
                    <ReelSlide
                      reel={reel}
                      active={idx === activeIndex}
                      mobile
                      showMeta={false}
                      videoRef={(node) => {
                        mobileVideoRefs.current[idx] = node;
                      }}
                    />
                  </div>

                  <div className="absolute bottom-[210px] right-[28px]">
                    <SideActions mobile />
                  </div>

                  <div className="absolute bottom-[52px] left-[22px] h-[112px] w-[112px] rounded-full bg-white/92" />
                </div>
              ))}
            </div>

            <div className="flex h-[160px] items-center justify-center bg-[#9f9f9f]">
              {items.length > 1 ? (
                <button
                  type="button"
                  aria-label="Next reel"
                  onClick={goNext}
                  className="text-white transition hover:scale-105"
                >
                  <ChevronDown className="h-[88px] w-[88px]" strokeWidth={1.7} />
                </button>
              ) : (
                <ChevronDown className="h-[88px] w-[88px] text-white" strokeWidth={1.7} />
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}