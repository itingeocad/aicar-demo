'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bookmark, ChevronDown, Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import type { DemoReel } from '@/lib/site/types';

function setMobileFooterState(visible: boolean) {
  const root = document.documentElement;
  root.style.setProperty('--aiclips-mobile-footer-height', visible ? '188px' : '0px');
  root.style.setProperty('--aiclips-mobile-footer-opacity', visible ? '1' : '0');
  root.style.setProperty('--aiclips-mobile-footer-padding-top', visible ? '16px' : '0px');
  root.style.setProperty('--aiclips-mobile-footer-padding-bottom', visible ? '16px' : '0px');
}

function clearMobileFooterState() {
  const root = document.documentElement;
  root.style.removeProperty('--aiclips-mobile-footer-height');
  root.style.removeProperty('--aiclips-mobile-footer-opacity');
  root.style.removeProperty('--aiclips-mobile-footer-padding-top');
  root.style.removeProperty('--aiclips-mobile-footer-padding-bottom');
}

function scrollToIndex(container: HTMLDivElement | null, index: number, smooth = true) {
  if (!container) return;

  const pageHeight = container.clientHeight;
  container.scrollTo({
    top: index * pageHeight,
    behavior: smooth ? 'smooth' : 'auto'
  });
}

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
    <div className="relative h-full w-full overflow-hidden bg-[#b3b3b3]">
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
  const iconSize = mobile ? 'h-7 w-7' : 'h-11 w-11';
  const gap = mobile ? 'gap-5' : 'gap-7';

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
  const [mobileFooterVisible, setMobileFooterVisible] = useState(true);

  const startIndex = useMemo(() => {
    if (!requestedReel) return 0;
    const idx = items.findIndex((r) => r.id === requestedReel);
    return idx >= 0 ? idx : 0;
  }, [requestedReel, items]);

  useEffect(() => {
    setMobileFooterState(mobileFooterVisible);
    return () => clearMobileFooterState();
  }, [mobileFooterVisible]);

  useEffect(() => {
    setActiveIndex(startIndex);

    const id = window.requestAnimationFrame(() => {
      scrollToIndex(desktopScrollerRef.current, startIndex, false);
      scrollToIndex(mobileScrollerRef.current, startIndex, false);
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

  const goNextDesktop = () => {
    if (items.length <= 1) return;

    const next = activeIndex >= items.length - 1 ? 0 : activeIndex + 1;
    scrollToIndex(desktopScrollerRef.current, next, true);
    setActiveIndex(next);
  };

  const toggleMobileFooter = () => {
    setMobileFooterVisible((v) => !v);
  };

  if (items.length === 0) {
    return (
      <section className="flex h-full items-center justify-center bg-[#a9a9a9] px-4">
        <div className="text-center text-[20px] text-white">Пока нет роликов AIClips</div>
      </section>
    );
  }

  return (
    <>
      <div className="hidden h-full md:block">
        <section className="relative h-full overflow-hidden bg-[#a9a9a9]">
          <div className="mx-auto flex h-full max-w-[1600px] items-center justify-center px-4 py-2">
            <div
              className="relative aspect-[9/16]"
              style={{
                height: 'min(calc(100% - 14px), 680px)',
                maxWidth: '392px'
              }}
            >
              <div
                ref={desktopScrollerRef}
                className="h-full w-full overflow-y-auto overscroll-contain snap-y snap-mandatory rounded-[18px] bg-[#d3d3d3] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                      videoRef={(node) => {
                        desktopVideoRefs.current[idx] = node;
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="absolute -left-[118px] bottom-[22px] h-[68px] w-[68px] rounded-full bg-white/95" />
              <div className="absolute -right-[112px] top-1/2 -translate-y-1/2">
                <ActionStack />
              </div>
            </div>
          </div>

          <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2">
            {items.length > 1 ? (
              <button
                type="button"
                aria-label="Next reel"
                onClick={goNextDesktop}
                className="text-white transition hover:scale-105"
              >
                <ChevronDown className="h-[70px] w-[70px]" strokeWidth={1.7} />
              </button>
            ) : (
              <ChevronDown className="h-[70px] w-[70px] text-white" strokeWidth={1.7} />
            )}
          </div>
        </section>
      </div>

      <div className="h-full md:hidden">
        <section className="grid h-full grid-rows-[minmax(0,1fr)_64px] overflow-hidden bg-[#a9a9a9] px-3 py-2">
          <div className="min-h-0 flex items-center justify-center overflow-hidden">
            <div
              className="relative w-full max-w-[302px] overflow-hidden rounded-[16px] bg-[#d3d3d3]"
              style={{ height: 'min(calc(100% - 6px), 500px)' }}
            >
              <div
                ref={mobileScrollerRef}
                className="h-full overflow-y-auto overscroll-contain snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                      videoRef={(node) => {
                        mobileVideoRefs.current[idx] = node;
                      }}
                    />

                    <div className="absolute bottom-[84px] right-[12px] z-10">
                      <ActionStack mobile />
                    </div>

                    <div className="absolute bottom-[10px] left-[10px] h-[54px] w-[54px] rounded-full bg-white/92 z-10" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center rounded-[12px] bg-[#9f9f9f]">
            <button
              type="button"
              aria-label={mobileFooterVisible ? 'Hide footer' : 'Show footer'}
              onClick={toggleMobileFooter}
              className="flex h-full w-full items-center justify-center text-white"
            >
              <ChevronDown
                className={`h-[48px] w-[48px] transition-transform duration-300 ${
                  mobileFooterVisible ? '' : 'rotate-180'
                }`}
                strokeWidth={1.7}
              />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}