'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Mode = 'setup' | 'reset';

export default function SetupClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const token = sp.get('t') || sp.get('token') || '';

  const [mode, setMode] = useState<Mode>('reset');
  const [email, setEmail] = useState('admin@aicar.md');
  const [name, setName] = useState('Super Admin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<string>('');

  const missingToken = useMemo(() => !token, [token]);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!passwordsMatch) {
      setStatus('Пароли не совпадают.');
      return;
    }

    const endpoint = mode === 'setup' ? '/api/auth/bootstrap' : '/api/auth/reset-password';
    const pendingLabel = mode === 'setup' ? 'Создаём супер-админа…' : 'Сбрасываем пароль и права супер-админа…';
    const doneLabel = mode === 'setup' ? 'Готово ✅ Переходим в админку…' : 'Пароль и права супер-админа обновлены ✅ Переходим в админку…';

    setStatus(pendingLabel);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, email, password, name })
      });

      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus(j?.error ? String(j.error) : 'Ошибка');
        return;
      }

      setStatus(doneLabel);
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
          Создание первого пользователя <span className="font-medium">Супер админ</span> или восстановление доступа.
        </div>

        {missingToken ? (
          <div className="mt-4 rounded-xl border bg-amber-50 border-amber-200 p-3 text-sm text-amber-900">
            Не найден token в URL. Откройте эту страницу как <span className="font-mono">/setup?t=ВАШ_ТОКЕН</span>.
          </div>
        ) : null}

        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
          Для уже инициализированного проекта используйте режим <span className="font-medium">Сброс пароля</span> — он также
          восстанавливает роль <span className="font-mono">super_admin</span> и права на сохранение конфигурации.
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 text-sm">
          <button
            type="button"
            onClick={() => {
              setMode('setup');
              setStatus('');
            }}
            className={`rounded-lg px-3 py-2 ${mode === 'setup' ? 'bg-white shadow-sm' : 'text-slate-600'}`}
          >
            Создать супер-админа
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('reset');
              setStatus('');
            }}
            className={`rounded-lg px-3 py-2 ${mode === 'reset' ? 'bg-white shadow-sm' : 'text-slate-600'}`}
          >
            Сброс пароля
          </button>
        </div>

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
              required={mode === 'setup'}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </label>

          <label className="block">
            <div className="text-xs font-medium text-slate-600">Пароль</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              required
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder={mode === 'setup' ? 'Придумайте надёжный пароль' : 'Введите новый пароль'}
              autoComplete="new-password"
            />
          </label>

          <label className="block">
            <div className="text-xs font-medium text-slate-600">Подтверждение пароля</div>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              required
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="Повторите пароль"
              autoComplete="new-password"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
            Показать пароль
          </label>

          {!passwordsMatch && confirmPassword ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              Пароли не совпадают.
            </div>
          ) : null}

          <button
            type="submit"
            disabled={missingToken || !password || !confirmPassword || !passwordsMatch}
            className="w-full rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
          >
            {mode === 'setup' ? 'Создать супер-админа' : 'Сбросить пароль и права'}
          </button>
        </form>

        <div className="mt-4 text-xs text-slate-500">
          После восстановления доступа лучше сменить значение <span className="font-mono">AICAR_BOOTSTRAP_TOKEN</span> в Vercel.
        </div>

        {status ? <div className="mt-3 text-sm text-slate-700">{status}</div> : null}
      </div>
    </div>
  );
}
