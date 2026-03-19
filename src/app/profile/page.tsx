import { SiteFrame } from '@/components/SiteChrome';
import { AccountMobileBottomBar } from '@/components/profile/AccountMobileBottomBar';
import { ProfilePageClient } from '@/components/profile/ProfilePageClient';
import { getSiteConfig } from '@/lib/site/store.server';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const config = await getSiteConfig();

  return (
    <SiteFrame config={config} variant="account">
      <ProfilePageClient
        displayName={'Пользователь'}
        reels={config.demoData.reels}
        cars={config.demoData.cars}
      />
      <AccountMobileBottomBar />
    </SiteFrame>
  );
}