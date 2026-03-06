'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string>('');

  const error = useMemo(() => sp.get('error') || '', [sp]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Входим…');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setStatus(j?.error ? String(j.error) : 'Ошибка входа');
        return;
      }
      setStatus('Ок ✅');
      router.push(next);
      router.refresh();
    } catch (err) {
      setStatus(String(err));
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 grid place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-xl font-bold">Войти</div>
        <div className="mt-1 text-sm text-slate-600">
          Доступ к админке и функциям управления.
        </div>

        {error === 'forbidden' ? (
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
            У вас нет прав для доступа.
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <label className="block">
            <div className="text-xs font-medium text-slate-600">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="admin@aicar.local"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <div className="text-xs font-medium text-slate-600">Пароль</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800"
          >
            Войти
          </button>
        </form>

        <div className="mt-4 text-xs text-slate-500">
          Если это первый запуск, создайте супер‑админа командой <span className="font-mono">npm run bootstrap:superadmin</span>.
        </div>

        {status ? <div className="mt-3 text-sm text-slate-700">{status}</div> : null}
      </div>
    </div>
  );
}
