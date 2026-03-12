import Link from 'next/link';
import { Bell, ChevronDown, Heart, Menu, MessageCircle, X } from 'lucide-react';
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

function MobileMenuPanel({
  config,
  session
}: {
  config: SiteConfig;
  session: Awaited<ReturnType<typeof getSession>>;
}) {
  const footerGroups = config.footer.groups ?? [];
  const canAdmin = Boolean(session);

  return (
    <div className="fixed inset-x-0 top-[57px] z-50 md:hidden">
      <div className="bg-black/20 px-4 pb-4 pt-2 backdrop-blur-[1px]">
        <div className="aicar-header-container">
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl">
            <div className="border-b border-black/5 px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Меню
            </div>

            <div className="space-y-1 p-3">
              {config.nav.items.map((item) => {
                const href = item.href || item.children?.[0]?.href || '#';

                return (
                  <div key={(item.href || item.label) + ':' + item.label} className="rounded-xl border border-black/5">
                    <Link href={href} className="block px-4 py-3 text-[15px] font-medium text-slate-900">
                      {item.label}
                    </Link>

                    {item.children && item.children.length > 0 ? (
                      <div className="border-t border-black/5 bg-slate-50/70 px-2 py-2">
                        {item.children.map((c) => (
                          <Link
                            key={c.href}
                            href={c.href}
                            className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-white"
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {footerGroups.length ? (
              <div className="border-t border-black/5 px-4 py-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                  Дополнительно
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {footerGroups.map((g) => (
                    <div key={g.title}>
                      <div className="mb-1 text-sm font-semibold text-slate-800">{g.title}</div>
                      <div className="space-y-1">
                        {g.links.map((l) => (
                          <Link key={l.href} href={l.href} className="block text-sm text-slate-600 hover:text-slate-900">
                            {l.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="border-t border-black/5 p-3">
              <div className="flex flex-wrap gap-2">
                {!session ? (
                  <Link href="/login" className="rounded-xl bg-slate-200 px-4 py-2 text-sm text-slate-900">
                    Войти
                  </Link>
                ) : (
                  <>
                    {canAdmin ? (
                      <Link href="/admin" className="rounded-xl bg-slate-200 px-4 py-2 text-sm text-slate-900">
                        Админка
                      </Link>
                    ) : null}
                    <Link href="/logout?next=/" className="rounded-xl bg-slate-200 px-4 py-2 text-sm text-slate-900">
                      Выйти
                    </Link>
                  </>
                )}
                <div className="rounded-xl bg-slate-200 px-4 py-2 text-sm text-slate-900">Ro</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function TopNav({ config }: { config: SiteConfig }) {
  const session = await getSession();
  const canAdmin = Boolean(session);

  return (
    <header className="border-b border-black/5 bg-[#d9d9d9]">
      <div className="aicar-header-container">
        {/* Mobile */}
        <MobileTopNavClient
          config={config}
          loggedIn={Boolean(session)}
          canAdmin={canAdmin}
        />

        {/* Desktop */}
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

function SocialIcons({ socials }: { socials: SocialLink[] }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {socials.map((s) => (
        <Link
          key={s.label}
          href={s.href}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-xs text-slate-700 transition hover:bg-white"
        >
          {s.label.slice(0, 2)}
        </Link>
      ))}
    </div>
  );
}

function StoreButtons({ storeBadges }: { storeBadges: StoreBadge[] }) {
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

export function Footer({ config }: { config: SiteConfig }) {
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

export function SiteFrame({ config, children }: { config: SiteConfig; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#eeeeee] text-slate-900">
      <TopNav config={config} />
      <main>{children}</main>
      <Footer config={config} />
    </div>
  );
}