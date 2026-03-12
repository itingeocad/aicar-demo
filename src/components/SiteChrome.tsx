import Link from 'next/link';
import { Bell, ChevronDown, Heart, MessageCircle } from 'lucide-react';
import { SiteConfig, SiteNavItem, FooterGroup, SocialLink, StoreBadge } from '@/lib/site/types';
import { formatBuildLabel } from '@/lib/version';
import { getSession } from '@/lib/auth/session.server';
import { MobileTopNavClient } from '@/components/MobileTopNavClient';

function IconButton({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-black/5"
    >
      {children}
    </button>
  );
}

function DesktopNavItem({ item }: { item: SiteNavItem }) {
  const href = item.href || item.children?.[0]?.href || '#';

  if (item.children && item.children.length > 0) {
    return (
      <div className="group relative">
        <Link href={href} className="flex items-center gap-1 text-[14px] leading-none text-slate-800 hover:text-black">
          {item.label}
          <ChevronDown className="h-4 w-4 text-slate-600" />
        </Link>

        <div className="absolute left-0 top-full z-30 hidden pt-3 group-hover:block">
          <div className="min-w-[220px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg">
            {item.children.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={href} className="text-[14px] leading-none text-slate-800 hover:text-black">
      {item.label}
    </Link>
  );
}

export async function TopNav({
  config,
  variant = 'default'
}: {
  config: SiteConfig;
  variant?: 'default' | 'aichat';
}) {
  const session = await getSession();
  const canAdmin = Boolean(session);

  return (
    <header className="border-b border-black/5 bg-[#d9d9d9]">
      <div className="aicar-header-container">
        <MobileTopNavClient
          config={config}
          loggedIn={Boolean(session)}
          canAdmin={canAdmin}
          variant={variant}
        />

        <div className="hidden h-[90px] grid-cols-[1fr_auto_1fr] items-center md:grid">
          <nav className="flex items-center gap-8">
            {config.nav.items.map((it) => (
              <DesktopNavItem key={(it.href || it.label) + ':' + it.label} item={it} />
            ))}
          </nav>

          <div className="flex justify-center">
            <Link href="/" className="flex items-center justify-center">
              {config.theme.logoImage ? (
                <img
                  src={config.theme.logoImage}
                  alt={config.theme.brandName || 'Лого'}
                  className="max-h-9 w-auto object-contain"
                />
              ) : (
                <span className="text-[18px] font-semibold tracking-tight">{config.theme.brandName || 'Лого'}</span>
              )}
            </Link>
          </div>

          <div className="flex items-center justify-end gap-2">
            <IconButton label="notifications">
              <Bell className="h-5 w-5" />
            </IconButton>
            <IconButton label="messages">
              <MessageCircle className="h-5 w-5" />
            </IconButton>
            <IconButton label="favorites">
              <Heart className="h-5 w-5" />
            </IconButton>

            {!session ? (
              <Link
                href="/login"
                className="ml-2 rounded-xl bg-[#c7c7c7] px-5 py-2 text-[14px] text-slate-900 transition hover:bg-[#bdbdbd]"
              >
                Войти
              </Link>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                {canAdmin ? (
                  <Link href="/admin" className="rounded-xl bg-[#c7c7c7] px-4 py-2 text-[14px] text-slate-900">
                    Админка
                  </Link>
                ) : null}
                <Link href="/logout?next=/" className="rounded-xl bg-[#c7c7c7] px-4 py-2 text-[14px] text-slate-900">
                  Выйти
                </Link>
              </div>
            )}

            <div className="ml-2 rounded-xl bg-[#c7c7c7] px-3 py-2 text-[14px] text-slate-900">Ro</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function SocialIcons({
  socials,
  centered = false,
  minimal = false
}: {
  socials: SocialLink[];
  centered?: boolean;
  minimal?: boolean;
}) {
  return (
    <div className={centered ? 'mb-5 flex items-center justify-center gap-4' : 'mb-4 flex items-center gap-3'}>
      {socials.map((s) => (
        <Link
          key={s.label}
          href={s.href}
          className={
            centered
              ? 'flex h-14 w-14 items-center justify-center rounded-full bg-white/80 text-xs text-slate-700 transition hover:bg-white'
              : 'flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-xs text-slate-700 transition hover:bg-white'
          }
        >
          {minimal ? null : s.label.slice(0, 2)}
        </Link>
      ))}
    </div>
  );
}

function StoreButtons({
  storeBadges,
  mobile = false
}: {
  storeBadges: StoreBadge[];
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <div className="flex flex-wrap justify-center gap-3">
        {storeBadges.map((b) => (
          <Link
            key={b.label}
            href={b.href}
            className="rounded-2xl bg-white/80 px-5 py-3 text-xs text-slate-700 transition hover:bg-white"
          >
            {b.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="flex max-w-[210px] flex-col gap-3">
      {storeBadges.map((b) => (
        <Link
          key={b.label}
          href={b.href}
          className="rounded-xl bg-white/80 px-4 py-3 text-xs text-slate-700 transition hover:bg-white"
        >
          {b.label}
        </Link>
      ))}
    </div>
  );
}

function FooterGroups({ groups }: { groups: FooterGroup[] }) {
  const cols = Math.min(3, Math.max(1, groups.length));
  const gridCols = cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className={`grid ${gridCols} gap-6 text-sm text-slate-700`}>
      {groups.map((g) => (
        <div key={g.title}>
          <div className="mb-2 font-semibold">{g.title}</div>
          <div className="space-y-2">
            {g.links.map((l) => (
              <Link key={l.href} href={l.href} className="block hover:text-slate-950">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Footer({
  config,
  variant = 'default'
}: {
  config: SiteConfig;
  variant?: 'default' | 'aichat';
}) {
  const build = formatBuildLabel();

  const groups = config.footer.groups && config.footer.groups.length > 0 ? config.footer.groups : [];
  const legacyLinks = config.footer.links ?? [];
  const fallbackGroups: FooterGroup[] = groups.length
    ? groups
    : [
        { title: 'Ссылки', links: legacyLinks.slice(0, Math.ceil(legacyLinks.length / 2)) },
        { title: ' ', links: legacyLinks.slice(Math.ceil(legacyLinks.length / 2)) }
      ].filter((g) => g.links.length > 0);

  const socials = config.footer.socials ?? [];
  const storeBadges = config.footer.storeBadges ?? [];

  if (variant === 'aichat') {
    const aichatGroupCols =
      fallbackGroups.length >= 3 ? 'grid-cols-3' : fallbackGroups.length === 2 ? 'grid-cols-2' : 'grid-cols-1';

    return (
      <footer className="bg-[#d9d9d9]">
        <div className="hidden md:block">
          <div className="mx-auto max-w-[1200px] px-4 py-10">
            <div className="grid grid-cols-[220px_minmax(0,1fr)_250px] items-start gap-10">
              <div className="pt-2">
                {config.theme.logoImage ? (
                  <img
                    src={config.theme.logoImage}
                    alt={config.theme.brandName || 'Лого'}
                    className="max-h-14 w-auto object-contain"
                  />
                ) : (
                  <div className="text-[28px] font-semibold tracking-tight">{config.theme.brandName || 'Лого'}</div>
                )}
              </div>

              <div className={`grid ${aichatGroupCols} gap-10 pt-1 text-[15px] text-slate-800`}>
                {fallbackGroups.map((g, idx) => (
                  <div key={`${g.title}-${idx}`}>
                    {g.title && g.title.trim() ? (
                      <div className="mb-3 font-medium text-slate-900">{g.title}</div>
                    ) : null}

                    <div className="space-y-3">
                      {g.links.map((l) => (
                        <Link key={l.href} href={l.href} className="block hover:text-slate-950">
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="justify-self-end">
                <div className="mb-3 text-[15px] text-slate-800">Мы в социальных сетях</div>
                {socials.length ? <SocialIcons socials={socials} minimal /> : null}
                {storeBadges.length ? <StoreButtons storeBadges={storeBadges} /> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-12 text-center md:hidden">
          {config.theme.logoImage ? (
            <img
              src={config.theme.logoImage}
              alt={config.theme.brandName || 'Лого'}
              className="mx-auto max-h-14 w-auto object-contain"
            />
          ) : (
            <div className="text-[32px] font-semibold tracking-tight">{config.theme.brandName || 'Лого'}</div>
          )}

          <div className="mt-6 text-[18px] text-slate-800">Мы в социальных сетях</div>
          {socials.length ? <SocialIcons socials={socials} centered minimal /> : null}
          {storeBadges.length ? <StoreButtons storeBadges={storeBadges} mobile /> : null}
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-12 border-t border-black/5 bg-[#d9d9d9]">
      <div className="aicar-container py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-start">
          <div className="md:col-span-3">
            {config.theme.logoImage ? (
              <img
                src={config.theme.logoImage}
                alt={config.theme.brandName || 'Лого'}
                className="max-h-12 w-auto object-contain"
              />
            ) : (
              <div className="text-2xl font-semibold">{config.theme.brandName || 'Лого'}</div>
            )}
            <div className="mt-2 text-xs text-slate-600">{config.footer.note}</div>
            <div className="mt-2 text-xs text-slate-500">{build}</div>
          </div>

          <div className="md:col-span-6">
            <FooterGroups groups={fallbackGroups} />
          </div>

          <div className="md:col-span-3">
            <div className="mb-3 text-sm text-slate-700">Мы в социальных сетях</div>
            {socials.length ? <SocialIcons socials={socials} /> : null}
            {storeBadges.length ? <StoreButtons storeBadges={storeBadges} /> : null}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SiteFrame({
  config,
  children,
  variant = 'default'
}: {
  config: SiteConfig;
  children: React.ReactNode;
  variant?: 'default' | 'aichat';
}) {
  return (
    <div className="min-h-screen bg-[#eeeeee] text-slate-900">
      <TopNav config={config} variant={variant} />
      <main>{children}</main>
      <Footer config={config} variant={variant} />
    </div>
  );
}