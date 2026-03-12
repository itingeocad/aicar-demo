import { redirect } from 'next/navigation';
import AdminClient from '@/components/admin/AdminClient';
import { PERM_ADMIN_ACCESS } from '@/lib/auth/constants';
import { getSession, hasPermission } from '@/lib/auth/session.server';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login?next=/admin');
  }

  if (!hasPermission(session, PERM_ADMIN_ACCESS)) {
    redirect('/profile');
  }

  return <AdminClient />;
}