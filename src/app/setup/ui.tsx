'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SetupClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const token = sp.get('t') || sp.get('token') || '';

  const [email, setEmail] = useState('admin@aicar.local');
  const [name, setName] = useState('Super Admin');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string>('');

  const missingToken = useMemo(() => !token, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Создаём супер-админа…');
    try {
      const res = await fetch('/api/auth/bootstrap', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, email, password, name })
      });

      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus(j?.error ? String(j.error) : 'Ошибка');
        return;
      }

      setStatus('Готово ✅ Переходим в админку…');
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setStatus(String(err));
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 grid place-items-center p-6">
      <div className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-xl font-bold">Первичная настройка</div>
        <div className="mt-1 text-sm text-slate-600">
          Создание первого пользователя <span className="font-medium">Супер админ</span>.
        </div>

        {missingToken ? (
          <div className="mt-4 rounded-xl border bg-amber-50 border-amber-200 p-3 text-sm text-amber-900">
            Не найден token в URL. Откройте эту страницу как <span className="font-mono">/setup?t=ВАШ_ТОКЕН</span>.
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
              autoComplete="email"
            />
          </label>

          <label className="block">
            <div className="text-xs font-medium text-slate-600">Имя</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              required
              className="mt-1 w-full rounded-xl border px-3 py-2"
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
              placeholder="Придумайте надёжный пароль"
              autoComplete="new-password"
            />
          </label>

          <button
            type="submit"
            disabled={missingToken || !password}
            className="w-full rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
          >
            Создать супер-админа
          </button>
        </form>

        <div className="mt-4 text-xs text-slate-500">
          Рекомендация: после успешной настройки очистите переменную окружения <span className="font-mono">AICAR_BOOTSTRAP_TOKEN</span> или смените её.
        </div>

        {status ? <div className="mt-3 text-sm text-slate-700">{status}</div> : null}
      </div>
    </div>
  );
}
