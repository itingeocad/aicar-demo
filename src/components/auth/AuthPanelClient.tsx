'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

type Mode = 'login' | 'register';

export default function AuthPanelClient({ mode }: { mode: Mode }) {
  const router = useRouter();
  const sp = useSearchParams();

  const next = sp.get('next') || '';

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');

  const error = useMemo(() => sp.get('error') || '', [sp]);
  const isLogin = mode === 'login';
  const passwordsMatch = isLogin || (password.length > 0 && password === confirmPassword);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!passwordsMatch) {
      setStatus('Пароли не совпадают.');
      return;
    }

    setStatus(isLogin ? 'Входим…' : 'Регистрируем аккаунт…');

    try {
      const res = await fetch(isLogin ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(
          isLogin
            ? { email, password, next }
            : { displayName: displayName.trim(), email, password }
        )
      });

      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus(j?.error ? String(j.error) : 'Ошибка');
        return;
      }

      const redirectTo = typeof j?.redirect === 'string' && j.redirect ? j.redirect : '/';
      setStatus('Готово ✅');
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setStatus(String(err));
    }
  }

  return (
    <>
      <div className="hidden md:block">
        <section className="py-[92px]">
          <div className="mx-auto max-w-[650px] rounded-[16px] bg-[#d3d3d3] px-[48px] py-[34px]">
            <h1 className="text-center text-[24px] font-medium text-slate-900">
              {isLogin ? 'Войти в аккаунт' : 'Зарегистрироваться'}
            </h1>

            {error === 'forbidden' ? (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                У текущей сессии нет прав для доступа.
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {!isLogin ? (
                <label className="block">
                  <div className="mb-2 text-[14px] text-slate-900">Имя</div>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    type="text"
                    required
                    className="h-[44px] w-full rounded-[10px] bg-white px-4 text-[16px] outline-none"
                  />
                </label>
              ) : null}

              <label className="block">
                <div className="mb-2 text-[14px] text-slate-900">e-mail</div>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  autoComplete="email"
                  className="h-[44px] w-full rounded-[10px] bg-white px-4 text-[16px] outline-none"
                />
              </label>

              <label className="block">
                <div className="mb-2 text-[14px] text-slate-900">Пароль</div>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="h-[44px] w-full rounded-[10px] bg-white px-4 text-[16px] outline-none"
                />
              </label>

              {!isLogin ? (
                <label className="block">
                  <div className="mb-2 text-[14px] text-slate-900">Подтвердите пароль</div>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    required
                    autoComplete="new-password"
                    className="h-[44px] w-full rounded-[10px] bg-white px-4 text-[16px] outline-none"
                  />
                </label>
              ) : null}

              <div className="flex items-center gap-4 pt-3">
                <button
                  type="submit"
                  className="min-w-[120px] rounded-[12px] bg-[#bdbdbd] px-8 py-3 text-[16px] text-slate-900"
                >
                  {isLogin ? 'Войти' : 'Создать аккаунт'}
                </button>

                <Link
                  href={isLogin ? '/register' : '/login'}
                  className="text-[16px] text-slate-900 underline underline-offset-4"
                >
                  {isLogin ? 'Зарегестрироваться' : 'Войти'}
                </Link>
              </div>
            </form>
          </div>

          <div className="pt-6 text-center">
            {isLogin ? (
              <button
                type="button"
                onClick={() => setStatus('Восстановление пароля добавим следующим этапом.')}
                className="text-[16px] text-slate-900 underline underline-offset-4"
              >
                Забыл пароль?
              </button>
            ) : null}

            {status ? <div className="mt-4 text-sm text-slate-700">{status}</div> : null}
          </div>
        </section>
      </div>

      <div className="md:hidden">
        <section className="px-4 pb-[90px] pt-[86px]">
          <div className="mx-auto max-w-[520px] rounded-[18px] bg-[#d3d3d3] px-5 py-7">
            <h1 className="text-center text-[22px] font-medium text-slate-900">
              {isLogin ? 'Войти в аккаунт' : 'Зарегистрироваться'}
            </h1>

            <form onSubmit={onSubmit} className="mt-7 space-y-4">
              {!isLogin ? (
                <label className="block">
                  <div className="mb-2 text-[14px] text-slate-900">Имя</div>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    type="text"
                    required
                    className="h-[56px] w-full rounded-[14px] bg-white px-4 text-[16px] outline-none"
                  />
                </label>
              ) : null}

              <label className="block">
                <div className="mb-2 text-[14px] text-slate-900">e-mail</div>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="h-[56px] w-full rounded-[14px] bg-white px-4 text-[16px] outline-none"
                />
              </label>

              <label className="block">
                <div className="mb-2 text-[14px] text-slate-900">Пароль</div>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  className="h-[56px] w-full rounded-[14px] bg-white px-4 text-[16px] outline-none"
                />
              </label>

              {!isLogin ? (
                <label className="block">
                  <div className="mb-2 text-[14px] text-slate-900">Подтвердите пароль</div>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    required
                    className="h-[56px] w-full rounded-[14px] bg-white px-4 text-[16px] outline-none"
                  />
                </label>
              ) : null}

              <div className="flex items-center gap-4 pt-3">
                <button
                  type="submit"
                  className="min-w-[128px] rounded-[16px] bg-[#bdbdbd] px-8 py-3 text-[16px] text-slate-900"
                >
                  {isLogin ? 'Войти' : 'Создать'}
                </button>

                <Link
                  href={isLogin ? '/register' : '/login'}
                  className="text-[16px] text-slate-900 underline underline-offset-4"
                >
                  {isLogin ? 'Зарегестрироваться' : 'Войти'}
                </Link>
              </div>
            </form>
          </div>

          <div className="pt-6 text-center">
            {isLogin ? (
              <button
                type="button"
                onClick={() => setStatus('Восстановление пароля добавим следующим этапом.')}
                className="text-[16px] text-slate-900 underline underline-offset-4"
              >
                Забыл пароль?
              </button>
            ) : null}

            {status ? <div className="mt-4 text-sm text-slate-700">{status}</div> : null}
          </div>
        </section>
      </div>
    </>
  );
}