'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type SetupMode = 'create' | 'reset';

export default function SetupClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const token = sp.get('t') || sp.get('token') || '';

  const [mode, setMode] = useState<SetupMode>('create');
  const [email, setEmail] = useState('admin@aicar.local');
  const [name, setName] = useState('Super Admin');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<string>('');

  const missingToken = useMemo(() => !token, [token]);
  const passwordsMatch = password === passwordConfirm;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!password) {
      setStatus('Введите пароль.');
      return;
    }

    if (!passwordsMatch) {
      setStatus('Пароль и подтверждение не совпадают.');
      return;
    }

    setStatus(mode === 'create' ? 'Создаём супер-админа…' : 'Сбрасываем пароль…');

    try {
      const endpoint = mode === 'create' ? '/api/auth/bootstrap' : '/api/auth/reset-password';
      const payload = mode === 'create' ? { token, email, password, name } : { token, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        const err = j?.error ? String(j.error) : 'Ошибка';
        if (mode === 'create' && err.startsWith('already initialized')) {
          setStatus('Система уже инициализирована. Переключитесь на «Сброс пароля», если нужно восстановить доступ.');
          return;
        }
        setStatus(err);
        return;
      }

      setStatus(mode === 'create' ? 'Готово ✅ Переходим в админку…' : 'Пароль обновлён ✅ Переходим в админку…');
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setStatus(String(err));
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 grid place-items-center p-6">
      <div className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-xl font-bold">Первичная настройка и восстановление доступа</div>
        <div className="mt-1 text-sm text-slate-600">
          Создание первого пользователя <span className="font-medium">Супер админ</span> или безопасный сброс его пароля по bootstrap token.
        </div>

        {missingToken ? (
          <div className="mt-4 rounded-xl border bg-amber-50 border-amber-200 p-3 text-sm text-amber-900">
            Не найден token в URL. Откройте эту страницу как <span className="font-mono">/setup?t=ВАШ_ТОКЕН</span>.
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => { setMode('create'); setStatus(''); }}
            className={`rounded-xl px-3 py-2 text-sm ${mode === 'create' ? 'bg-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Создать супер-админа
          </button>
          <button
            type="button"
            onClick={() => { setMode('reset'); setStatus(''); }}
            className={`rounded-xl px-3 py-2 text-sm ${mode === 'reset' ? 'bg-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
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

          {mode === 'create' ? (
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
          ) : null}

          <label className="block">
            <div className="text-xs font-medium text-slate-600">{mode === 'create' ? 'Пароль' : 'Новый пароль'}</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              required
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder={mode === 'create' ? 'Придумайте надёжный пароль' : 'Введите новый пароль'}
              autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
            />
          </label>

          <label className="block">
            <div className="text-xs font-medium text-slate-600">Подтверждение пароля</div>
            <input
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              required
              className={`mt-1 w-full rounded-xl border px-3 py-2 ${passwordConfirm && !passwordsMatch ? 'border-rose-300 bg-rose-50' : ''}`}
              placeholder="Повторите пароль"
              autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
            Показать пароль
          </label>

          {!passwordsMatch && passwordConfirm ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              Пароль и подтверждение не совпадают.
            </div>
          ) : null}

          <button
            type="submit"
            disabled={missingToken || !password || !passwordsMatch}
            className="w-full rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
          >
            {mode === 'create' ? 'Создать супер-админа' : 'Сбросить пароль и войти'}
          </button>
        </form>

        <div className="mt-4 text-xs text-slate-500">
          Рекомендация: после успешной настройки или восстановления доступа очистите переменную окружения <span className="font-mono">AICAR_BOOTSTRAP_TOKEN</span> или смените её.
        </div>

        {status ? <div className="mt-3 text-sm text-slate-700">{status}</div> : null}
      </div>
    </div>
  );
}
