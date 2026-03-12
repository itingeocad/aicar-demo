import { redirect } from 'next/navigation';
import { SiteFrame } from '@/components/SiteChrome';
import { AccountMobileBottomBar } from '@/components/profile/AccountMobileBottomBar';
import { ProfilePageClient } from '@/components/profile/ProfilePageClient';
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
    <SiteFrame config={config} variant="account">
      <ProfilePageClient
        displayName={session.displayName}
        reels={config.demoData.reels}
        cars={config.demoData.cars}
      />
      <AccountMobileBottomBar />
    </SiteFrame>
  );
}