import Link from 'next/link';
import { Bell, ChevronDown, Heart, Menu, MessageCircle } from 'lucide-react';
import { SiteConfig, SiteNavItem, FooterGroup, SocialLink, StoreBadge } from '@/lib/site/types';
import { formatBuildLabel } from '@/lib/version';
import { getSession, hasPermission } from '@/lib/auth/session.server';
import { PERM_ADMIN_ACCESS } from '@/lib/auth/constants';

function IconButton({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-slate-300/40 text-slate-700"
    >
      {children}
    </button>
  );
}

function NavItem({ item }: { item: SiteNavItem }) {
  const href = item.href || item.children?.[0]?.href || '#';
  if (item.children && item.children.length > 0) {
    return (
      <div className="relative group">
        <Link href={href} className="flex items-center gap-1 hover:text-slate-950">
          {item.label}
          <ChevronDown className="h-4 w-4 text-slate-600" />
        </Link>
        <div className="absolute left-0 top-full pt-2 hidden group-hover:block">
          <div className="min-w-[220px] rounded-2xl border bg-white shadow-lg overflow-hidden">
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
    <Link href={href} className="flex items-center gap-1 hover:text-slate-950">
      {item.label}
    </Link>
  );
}

export async function TopNav({ config }: { config: SiteConfig }) {
  const session = await getSession();
  const canAdmin = hasPermission(session, PERM_ADMIN_ACCESS);

  return (
    <header className="bg-slate-200">
      <div className="aicar-container h-12 flex items-center">
        {/* Mobile */}
        <div className="flex w-full items-center justify-between md:hidden">
          <button
            type="button"
            aria-label="menu"
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-slate-300/40"
          >
            <Menu className="h-6 w-6 text-slate-800" />
          </button>

          <div className="flex items-center gap-1">
            <IconButton label="notifications">
              <Bell className="h-5 w-5" />
            </IconButton>
            <IconButton label="favorites">
              <Heart className="h-5 w-5" />
            </IconButton>

            {!session ? (
              <Link href="/login" className="ml-2 rounded-xl bg-slate-300 px-4 py-2 text-sm">
                Войти
              </Link>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                {canAdmin ? (
                  <Link href="/admin" className="rounded-xl bg-slate-300 px-3 py-2 text-sm">
                    Админка
                  </Link>
                ) : null}
                <Link href="/logout?next=/" className="rounded-xl bg-slate-300 px-3 py-2 text-sm">
                  Выйти
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:grid w-full grid-cols-3 items-center">
          {/* Left nav */}
          <nav className="flex items-center gap-10 text-sm text-slate-800">
            {config.nav.items.map((it) => (
              <NavItem key={(it.href || it.label) + ':' + it.label} item={it} />
            ))}
          </nav>

          {/* Center logo */}
          <div className="flex justify-center">
            <Link href="/" className="flex items-center justify-center">
              {config.theme.logoImage ? (
                <img
                  src={config.theme.logoImage}
                  alt={config.theme.brandName || 'Лого'}
                  className="max-h-8 w-auto object-contain"
                />
              ) : (
                <span className="font-semibold tracking-tight">{config.theme.brandName || 'Лого'}</span>
              )}
            </Link>
          </div>

          {/* Right actions */}
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
              <Link href="/login" className="ml-2 rounded-xl bg-slate-300 px-5 py-2 text-sm">
                Войти
              </Link>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                {canAdmin ? (
                  <Link href="/admin" className="rounded-xl bg-slate-300 px-3 py-2 text-sm">
                    Админка
                  </Link>
                ) : null}
                <Link href="/logout?next=/" className="rounded-xl bg-slate-300 px-3 py-2 text-sm">
                  Выйти
                </Link>
              </div>
            )}

            <div className="ml-2 rounded-xl bg-slate-300 px-3 py-2 text-sm">Ro</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function SocialIcons({ socials }: { socials: SocialLink[] }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {socials.map((s) => (
        <Link
          key={s.label}
          href={s.href}
          className="h-10 w-10 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-xs text-slate-700"
        >
          {s.label.slice(0, 2)}
        </Link>
      ))}
    </div>
  );
}

function StoreButtons({ storeBadges }: { storeBadges: StoreBadge[] }) {
  return (
    <div className="flex flex-col gap-3 max-w-[210px]">
      {storeBadges.map((b) => (
        <Link key={b.label} href={b.href} className="rounded-xl bg-white/80 px-4 py-3 text-xs text-slate-700 hover:bg-white">
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
          <div className="font-semibold mb-2">{g.title}</div>
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
    <footer className="bg-slate-200 mt-10">
      <div className="aicar-container py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Logo */}
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

          {/* Groups */}
          <div className="md:col-span-6">
            <FooterGroups groups={fallbackGroups} />
          </div>

          {/* Social + store buttons */}
          <div className="md:col-span-3">
            <div className="text-sm text-slate-700 mb-3">Мы в социальных сетях</div>
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
    <div className="min-h-screen flex flex-col bg-slate-100">
      <TopNav config={config} />
      <main className="flex-1">{children}</main>
      <Footer config={config} />
    </div>
  );
}
