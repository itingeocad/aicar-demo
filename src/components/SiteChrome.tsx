import Link from 'next/link';
import { SiteConfig } from '@/lib/site/types';

export function TopNav({ config }: { config: SiteConfig }) {
  return (
    <header className="border-b bg-white">
      <div className="aicar-container h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bold tracking-tight">
            {config.theme.brandName}
          </Link>
          <nav className="hidden md:flex items-center gap-3 text-sm text-slate-600">
            {config.nav.items.map((it) => (
              <Link key={it.href} href={it.href} className="hover:text-slate-900">
                {it.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin" className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer({ config }: { config: SiteConfig }) {
  return (
    <footer className="border-t bg-white">
      <div className="aicar-container py-8">
        <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <div>
            <div className="font-semibold">{config.theme.brandName}</div>
            <div className="text-sm text-slate-600">{config.footer.note}</div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            {config.footer.links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-slate-900">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SiteFrame({ config, children }: { config: SiteConfig; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav config={config} />
      <main className="flex-1">{children}</main>
      <Footer config={config} />
    </div>
  );
}
