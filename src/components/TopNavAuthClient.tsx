'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type MeResponse = {
  authenticated?: boolean;
  isAdmin?: boolean;
  redirect?: string;
  user?: {
    email?: string;
    displayName?: string;
  } | null;
};

function authToken() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('aicar_session_token') || '';
}

async function fetchMe(): Promise<MeResponse> {
  const token = authToken();
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch('/api/auth/me', {
    cache: 'no-store',
    credentials: 'include',
    headers
  });

  return (await res.json().catch(() => ({}))) as MeResponse;
}

export function TopNavAuthClient() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const me = await fetchMe();
        if (!alive) return;

        setAuthenticated(Boolean(me?.authenticated));
        setIsAdmin(Boolean(me?.isAdmin));
        setDisplayName(String(me?.user?.displayName || me?.user?.email || ''));
      } catch {
        if (!alive) return;
        setAuthenticated(false);
        setIsAdmin(false);
        setDisplayName('');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="ml-2 flex items-center gap-2">
        <div className="rounded-xl bg-[#c7c7c7] px-5 py-2 text-[14px] text-slate-900">...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
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
    );
  }

  return (
    <div className="ml-2 flex items-center gap-2">
      <div className="max-w-[180px] truncate rounded-xl bg-white/35 px-4 py-2 text-[14px] text-slate-900">
        {displayName || 'Пользователь'}
      </div>
      <Link
        href={isAdmin ? '/admin' : '/profile'}
        className="rounded-xl bg-[#c7c7c7] px-4 py-2 text-[14px] text-slate-900"
      >
        {isAdmin ? 'Админка' : 'Профиль'}
      </Link>
      <Link href="/logout?next=/" className="rounded-xl bg-[#c7c7c7] px-4 py-2 text-[14px] text-slate-900">
        Выйти
      </Link>
    </div>
  );
}