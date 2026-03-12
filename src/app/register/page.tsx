import { redirect } from 'next/navigation';
import { SiteFrame } from '@/components/SiteChrome';
import AuthPanelClient from '@/components/auth/AuthPanelClient';
import { PERM_ADMIN_ACCESS } from '@/lib/auth/constants';
import { getSession, hasPermission } from '@/lib/auth/session.server';
import { getSiteConfig } from '@/lib/site/store.server';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect(hasPermission(session, PERM_ADMIN_ACCESS) ? '/admin' : '/profile');
  }

  const config = await getSiteConfig();

  return (
    <SiteFrame config={config} variant="aichat">
      <AuthPanelClient mode="register" />
    </SiteFrame>
  );
}