import Link from 'next/link';
import { Bell, ChevronDown, Heart, MessageCircle } from 'lucide-react';
import { SiteConfig, SiteNavItem, FooterGroup, SocialLink, StoreBadge } from '@/lib/site/types';
import { formatBuildLabel } from '@/lib/version';
import { APP_VERSION_INFO } from '@/lib/version.generated';
import { MobileTopNavClient } from '@/components/MobileTopNavClient';
import { TopNavAuthClient } from '@/components/TopNavAuthClient';

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
  variant?: 'default' | 'aichat' | 'aiclips' | 'account';
}) {

  return (
    <header className="border-b border-black/5 bg-[#d9d9d9]">
      <div className="aicar-header-container">
        <MobileTopNavClient
          config={config}
          loggedIn={false}
          canAdmin={false}
          displayName={''}
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
              <div className="ml-2 flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-xl bg-[#c7c7c7] px-5 py-2 text-[14px] text-slate-900 transition hover:bg-[#bdbdbd]"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-[#c7c7c7] px-5 py-2 text-[14px] text-slate-900 transition hover:bg-[#bdbdbd]"
                >
                  Регистрация
                </Link>
              </div>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <div className="max-w-[180px] truncate rounded-xl bg-white/35 px-4 py-2 text-[14px] text-slate-900">
                  {session.displayName || session.email}
                </div>
                <Link
                  href={canAdmin ? '/admin' : '/profile'}
                  className="rounded-xl bg-[#c7c7c7] px-4 py-2 text-[14px] text-slate-900"
                >
                  {canAdmin ? 'Админка' : 'Профиль'}
                </Link>
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
  variant?: 'default' | 'aichat' | 'aiclips' | 'account';
}) {
  if (variant === 'aiclips') {
    return null;
  }

  const groups = config.footer.groups ?? [];
  const socials = config.footer.socials ?? [];
  const storeBadges = config.footer.storeBadges ?? [];
  const flatLinks = groups.flatMap((g) => g.links ?? []);
  const half = Math.ceil(flatLinks.length / 2);
  const leftCol = flatLinks.slice(0, half);
  const rightCol = flatLinks.slice(half);
  const buildVersion = APP_VERSION_INFO.version || (config as any).version || '';
  const buildGitSha = APP_VERSION_INFO.gitSha || '';
  const buildComment = APP_VERSION_INFO.gitMessage || '';

  return (
    <footer className="bg-[#d9d9d9]">
      <div className="hidden md:block">
        <div className="mx-auto grid w-full max-w-[1320px] grid-cols-[220px_1fr_320px] gap-10 px-8 pb-8 pt-10">
          <div className="self-end">
            {config.theme.logoImage ? (
              <img
                src={config.theme.logoImage}
                alt={config.theme.brandName || 'Лого'}
                className="max-h-14 w-auto object-contain"
              />
            ) : (
              <div className="text-[38px] font-semibold tracking-[-0.04em] text-slate-900">
                {config.theme.brandName || 'AICar'}
              </div>
            )}

            <div className="mt-3 max-w-[230px] text-[13px] leading-[1.25] text-slate-700">
              Demo build • контент и медиа могут быть моковыми
            </div>

            {buildVersion ? (
              <>
                <div className="mt-2 text-[12px] text-slate-600">
                  v{buildVersion}{buildGitSha ? ` (${buildGitSha})` : ''}
                </div>
                {buildComment ? (
                  <div className="mt-1 text-[12px] leading-[1.25] text-slate-600">
                    {buildComment}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-x-20 text-[15px] text-slate-900">
            <div className="space-y-4">
              {leftCol.map((l) => (
                <Link key={l.href} href={l.href} className="block hover:text-slate-950">
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="space-y-4">
              {rightCol.map((l) => (
                <Link key={l.href} href={l.href} className="block hover:text-slate-950">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="justify-self-end">
            <div className="mb-4 text-[16px] text-slate-900">Мы в социальных сетях</div>

            <div className="mb-5 flex items-center gap-3">
              {socials.slice(0, 4).map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-xs text-slate-700 transition hover:bg-white"
                >
                  {s.label.slice(0, 2)}
                </Link>
              ))}
            </div>

            <div className="flex max-w-[240px] flex-col gap-3">
              {storeBadges.slice(0, 2).map((b) => (
                <Link
                  key={b.label}
                  href={b.href}
                  className="rounded-[14px] bg-white/85 px-5 py-3 text-xs text-slate-700 transition hover:bg-white"
                >
                  {b.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="mx-auto w-full max-w-[960px] px-4 pb-8 pt-8">
          <div className="text-center">
            {config.theme.logoImage ? (
              <img
                src={config.theme.logoImage}
                alt={config.theme.brandName || 'Лого'}
                className="mx-auto max-h-14 w-auto object-contain"
              />
            ) : (
              <div className="text-[34px] font-semibold tracking-[-0.04em] text-slate-900">
                {config.theme.brandName || 'AICar'}
              </div>
            )}

            <div className="mt-3 text-[13px] leading-[1.25] text-slate-700">
              Demo build • контент и медиа могут быть моковыми
            </div>

            {buildVersion ? (
              <>
                <div className="mt-2 text-[12px] text-slate-600">
                  v{buildVersion}{buildGitSha ? ` (${buildGitSha})` : ''}
                </div>
                {buildComment ? (
                  <div className="mt-1 text-[12px] leading-[1.25] text-slate-600">
                    {buildComment}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 text-[15px] text-slate-900">
            {flatLinks.map((l) => (
              <Link key={l.href} href={l.href} className="block hover:text-slate-950">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="text-[16px] text-slate-900">Мы в социальных сетях</div>

            <div className="mt-4 flex items-center justify-center gap-3">
              {socials.slice(0, 4).map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-[10px] text-slate-700"
                >
                  {s.label.slice(0, 2)}
                </Link>
              ))}
            </div>

            <div className="mt-5 flex flex-col items-center gap-3">
              {storeBadges.slice(0, 2).map((b) => (
                <Link
                  key={b.label}
                  href={b.href}
                  className="rounded-[14px] bg-white/85 px-5 py-3 text-[10px] text-slate-700"
                >
                  {b.label}
                </Link>
              ))}
            </div>
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
  variant?: 'default' | 'aichat' | 'aiclips' | 'account';
}) {
  if (variant === 'aiclips') {
    return (
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#eeeeee] text-slate-900">
        <TopNav config={config} variant={variant} />
        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#eeeeee] text-slate-900">
      <TopNav config={config} variant={variant} />
      <main className="flex-1">{children}</main>
      <Footer config={config} variant={variant} />
    </div>
  );
}