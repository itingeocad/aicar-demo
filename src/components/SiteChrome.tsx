import Link from 'next/link';
import { Bell, ChevronDown, Heart, Menu, MessageCircle } from 'lucide-react';
import { SiteConfig } from '@/lib/site/types';
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

export async function TopNav({ config }: { config: SiteConfig }) {
  const session = await getSession();
  const canAdmin = hasPermission(session, PERM_ADMIN_ACCESS);

  return (
    <header className="bg-slate-200">
      <div className="aicar-container h-12 flex items-center">
        {/* Mobile */}
        <div className="flex w-full items-center justify-between md:hidden">
          <button type="button" aria-label="menu" className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-slate-300/40">
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
              <Link key={it.href} href={it.href} className="flex items-center gap-1 hover:text-slate-950">
                {it.label}
                {it.label === 'Авто' ? <ChevronDown className="h-4 w-4 text-slate-600" /> : null}
              </Link>
            ))}
          </nav>

          {/* Center logo */}
          <div className="flex justify-center">
            <Link href="/" className="flex items-center justify-center">
              {config.theme.logoImage ? (
                <img src={config.theme.logoImage} alt={config.theme.brandName || 'Лого'} className="max-h-8 w-auto object-contain" />
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

export function Footer({ config }: { config: SiteConfig }) {
  const build = formatBuildLabel();
  const links = config.footer.links ?? [];
  const col1 = links.slice(0, Math.ceil(links.length / 2));
  const col2 = links.slice(Math.ceil(links.length / 2));

  return (
    <footer className="bg-slate-200 mt-10">
      <div className="aicar-container py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Logo */}
          <div className="md:col-span-3">
            {config.theme.logoImage ? (
              <img src={config.theme.logoImage} alt={config.theme.brandName || 'Лого'} className="max-h-10 w-auto object-contain" />
            ) : (
              <div className="text-2xl font-semibold">{config.theme.brandName || 'Лого'}</div>
            )}
            <div className="mt-2 text-xs text-slate-600">{config.footer.note}</div>
            <div className="mt-2 text-xs text-slate-500">{build}</div>
          </div>

          {/* Links */}
          <div className="md:col-span-6 grid grid-cols-2 gap-6 text-sm text-slate-700">
            <div className="space-y-2">
              {col1.map((l) => (
                <Link key={l.href} href={l.href} className="block hover:text-slate-950">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="space-y-2">
              {col2.map((l) => (
                <Link key={l.href} href={l.href} className="block hover:text-slate-950">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social + store buttons */}
          <div className="md:col-span-3">
            <div className="text-sm text-slate-700 mb-3">Мы в социальных сетях</div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-white/70" />
              <div className="h-10 w-10 rounded-full bg-white/70" />
              <div className="h-10 w-10 rounded-full bg-white/70" />
              <div className="h-10 w-10 rounded-full bg-white/70" />
            </div>
            <div className="flex flex-col gap-3 max-w-[190px]">
              <div className="rounded-xl bg-white/80 px-4 py-3 text-xs text-slate-700">Get it on Google Play</div>
              <div className="rounded-xl bg-white/80 px-4 py-3 text-xs text-slate-700">Download on the App Store</div>
            </div>
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
