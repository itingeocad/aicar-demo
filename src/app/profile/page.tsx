import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SiteFrame } from '@/components/SiteChrome';
import { AccountMobileBottomBar } from '@/components/profile/AccountMobileBottomBar';
import { getSession } from '@/lib/auth/session.server';
import { getSiteConfig } from '@/lib/site/store.server';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const config = await getSiteConfig();

  return (
    <SiteFrame config={config}>
      <section className="py-20">
        <div className="aicar-container">
          <div className="mx-auto max-w-[960px] rounded-[18px] bg-white/70 p-8 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
            <h1 className="text-[36px] font-semibold tracking-[-0.03em] text-slate-900">Профиль</h1>

            <div className="mt-6 grid gap-4 text-[16px] text-slate-800">
              <div><span className="font-medium">Имя:</span> {session.displayName}</div>
              <div><span className="font-medium">E-mail:</span> {session.email}</div>
              <div><span className="font-medium">Роли:</span> {session.roleIds.join(', ')}</div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className="rounded-xl bg-[#c7c7c7] px-5 py-3 text-[14px] text-slate-900">
                На главную
              </Link>
              <Link href="/logout?next=/" className="rounded-xl bg-[#c7c7c7] px-5 py-3 text-[14px] text-slate-900">
                Выйти
              </Link>
            </div>

            <div className="mt-8 text-sm text-slate-600">
              Полноценный кабинет пользователя добавим следующим этапом.
            </div>
          </div>
        </div>
      </section>

      <AccountMobileBottomBar />
    </SiteFrame>
  );
}