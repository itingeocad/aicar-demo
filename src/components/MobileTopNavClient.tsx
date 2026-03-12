'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Heart, Menu, X } from 'lucide-react';
import { SiteConfig } from '@/lib/site/types';

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

export function MobileTopNavClient({
  config,
  loggedIn,
  canAdmin,
  displayName = '',
  variant = 'default'
}: {
  config: SiteConfig;
  loggedIn: boolean;
  canAdmin: boolean;
  displayName?: string;
  variant?: 'default' | 'aichat' | 'aiclips' | 'account';
}) {
  const [open, setOpen] = useState(false);
  const footerGroups = config.footer.groups ?? [];
  const specialVariant = variant === 'aichat' || variant === 'aiclips' || variant === 'account';
  const accountVariant = variant === 'account';
  const panelTopClass = 'top-[57px]';
  const primaryHref = canAdmin ? '/admin' : '/profile';
  const primaryLabel = canAdmin ? 'Админка' : 'Профиль';
  const safeName = displayName || 'Пользователь';

  return (
    <div className="md:hidden">
      {specialVariant ? (
        <div className="flex h-14 items-center justify-between">
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-800 hover:bg-black/5"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <div className="flex items-center gap-1">
            <IconButton label="notifications">
              <Bell className="h-5 w-5" />
            </IconButton>
            <IconButton label="favorites">
              <Heart className="h-5 w-5" />
            </IconButton>

            {!loggedIn ? (
              <Link
                href="/login"
                className="rounded-xl bg-[#bdbdbd] px-4 py-2 text-[13px] font-medium text-slate-900"
                onClick={() => setOpen(false)}
              >
                Войти
              </Link>
            ) : accountVariant ? (
              <Link
                href={primaryHref}
                className="flex h-[50px] min-w-[50px] items-center justify-center rounded-full bg-white/90 px-4 text-[12px] text-slate-900"
                onClick={() => setOpen(false)}
              >
                профиль
              </Link>
            ) : (
              <>
                <div className="max-w-[88px] truncate rounded-xl bg-white/35 px-3 py-2 text-[12px] text-slate-900">
                  {safeName}
                </div>
                <Link
                  href={primaryHref}
                  className="rounded-xl bg-[#bdbdbd] px-4 py-2 text-[13px] font-medium text-slate-900"
                  onClick={() => setOpen(false)}
                >
                  {primaryLabel}
                </Link>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-14 items-center justify-between">
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-800 hover:bg-black/5"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link href="/" className="flex items-center justify-center" onClick={() => setOpen(false)}>
            {config.theme.logoImage ? (
              <img
                src={config.theme.logoImage}
                alt={config.theme.brandName || 'Лого'}
                className="max-h-8 w-auto object-contain"
              />
            ) : (
              <span className="text-[18px] font-semibold tracking-tight">{config.theme.brandName || 'Лого'}</span>
            )}
          </Link>

          <div className="flex items-center gap-1">
            <IconButton label="notifications">
              <Bell className="h-5 w-5" />
            </IconButton>

            {!loggedIn ? (
              <div className="rounded-xl bg-[#c7c7c7] px-3 py-2 text-xs text-slate-900">Ro</div>
            ) : (
              <Link
                href={primaryHref}
                className="rounded-xl bg-[#c7c7c7] px-3 py-2 text-xs text-slate-900"
                onClick={() => setOpen(false)}
              >
                {primaryLabel}
              </Link>
            )}
          </div>
        </div>
      )}

      {open ? (
        <div className={`fixed inset-x-0 ${panelTopClass} z-50`}>
          <div className="bg-black/20 px-4 pb-4 pt-2 backdrop-blur-[1px]" onClick={() => setOpen(false)}>
            <div className="aicar-header-container">
              <div
                className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
                  <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Меню</div>
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-black/5"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {loggedIn ? (
                  <div className="border-b border-black/5 px-4 py-4">
                    <div className="rounded-xl bg-slate-100 px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">{safeName}</div>
                      <div className="mt-1 text-xs text-slate-500">{canAdmin ? 'Администратор' : 'Пользователь'}</div>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-1 p-3">
                  {config.nav.items.map((item) => {
                    const href = item.href || item.children?.[0]?.href || '#';

                    return (
                      <div key={(item.href || item.label) + ':' + item.label} className="rounded-xl border border-black/5">
                        <Link
                          href={href}
                          className="block px-4 py-3 text-[15px] font-medium text-slate-900"
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                        </Link>

                        {item.children && item.children.length > 0 ? (
                          <div className="border-t border-black/5 bg-slate-50/70 px-2 py-2">
                            {item.children.map((c) => (
                              <Link
                                key={c.href}
                                href={c.href}
                                className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-white"
                                onClick={() => setOpen(false)}
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
                              <Link
                                key={l.href}
                                href={l.href}
                                className="block text-sm text-slate-600 hover:text-slate-900"
                                onClick={() => setOpen(false)}
                              >
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
                    {!loggedIn ? (
                      <>
                        <Link
                          href="/login"
                          className="rounded-xl bg-slate-200 px-4 py-2 text-sm text-slate-900"
                          onClick={() => setOpen(false)}
                        >
                          Войти
                        </Link>
                        <Link
                          href="/register"
                          className="rounded-xl bg-slate-200 px-4 py-2 text-sm text-slate-900"
                          onClick={() => setOpen(false)}
                        >
                          Регистрация
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href={primaryHref}
                          className="rounded-xl bg-slate-200 px-4 py-2 text-sm text-slate-900"
                          onClick={() => setOpen(false)}
                        >
                          {primaryLabel}
                        </Link>
                        <Link
                          href="/logout?next=/"
                          className="rounded-xl bg-slate-200 px-4 py-2 text-sm text-slate-900"
                          onClick={() => setOpen(false)}
                        >
                          Выйти
                        </Link>
                      </>
                    )}

                    {!specialVariant && !loggedIn ? (
                      <div className="rounded-xl bg-slate-200 px-4 py-2 text-sm text-slate-900">Ro</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}