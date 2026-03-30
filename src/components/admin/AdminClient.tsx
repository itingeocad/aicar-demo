'use client';

import { useEffect, useMemo, useState } from 'react';
import { APP_VERSION_INFO } from '@/lib/version.generated';
import Link from 'next/link';
import { BLOCK_DEFINITIONS } from '@/components/blocks/BlockRegistry';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { SiteConfig, PageDoc, BlockInstance } from '@/lib/site/types';
import { uid } from '@/lib/site/utils';
import { formatBuildLabel } from '@/lib/version';
import { CommentsSettingsCard } from '@/components/admin/CommentsSettingsCard';

type Tab = 'pages' | 'site' | 'security';

type MeUser = {
  uid: string;
  email: string;
  displayName: string;
  roleIds: string[];
  permissions: string[];
};

type RoleDoc = {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem?: boolean;
};

type UserRow = {
  id: string;
  email: string;
  displayName: string;
  roleIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

function cls(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(' ');
}

function can(me: MeUser | null, perm: string) {
  if (!me) return false;
  if (me.permissions.includes('*')) return true;
  return me.permissions.includes(perm);
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('aicar_session_token') || ''
      : '';

  const headers = new Headers(init?.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
    ...init,
    headers
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any)?.error || `HTTP ${res.status}`);
  }
  return data as T;
}

async function fetchConfig(): Promise<SiteConfig> {
  return await fetchJSON<SiteConfig>('/api/site-config');
}

async function saveConfig(config: SiteConfig): Promise<void> {
  await fetchJSON('/api/admin/site-config', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(config)
  });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-slate-600">{label}</div>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function BlockBadge({ type }: { type: string }) {
  const def = BLOCK_DEFINITIONS.find((d) => d.type === type);
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
      {def?.label ?? type}
    </span>
  );
}

function SecurityTab({ me }: { me: MeUser | null }) {
  const [roles, setRoles] = useState<RoleDoc[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [status, setStatus] = useState<string>('');

  const [activeRoleId, setActiveRoleId] = useState<string>('');
  const [activeUserId, setActiveUserId] = useState<string>('');

  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const activeRole = roles.find((r) => r.id === activeRoleId) || null;
  const activeUser = users.find((u) => u.id === activeUserId) || null;

  const [roleDraft, setRoleDraft] = useState<{ id: string; name: string; description: string; permissions: string }>(
    { id: '', name: '', description: '', permissions: '' }
  );

  const [userDraft, setUserDraft] = useState<{ email: string; displayName: string; password: string; roleIds: string[]; isActive: boolean }>(
    { email: '', displayName: '', password: '', roleIds: ['user'], isActive: true }
  );

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter((u) => {
      const matchesText = !q ||
        u.email.toLowerCase().includes(q) ||
        (u.displayName || '').toLowerCase().includes(q);

      const matchesRole = !roleFilter || (u.roleIds || []).includes(roleFilter);
      return matchesText && matchesRole;
    });
  }, [users, userSearch, roleFilter]);

  async function loadAll() {
    try {
      setStatus('Загрузка…');
      const r = can(me, 'roles:manage') ? await fetchJSON<{ roles: RoleDoc[] }>('/api/admin/roles') : { roles: [] };
      const u = can(me, 'users:manage') ? await fetchJSON<{ users: UserRow[] }>('/api/admin/users') : { users: [] };
      setRoles(r.roles || []);
      setUsers(u.users || []);
      setStatus('');
    } catch (e) {
      setStatus(`Ошибка: ${String(e)}`);
    }
  }

  function resetUserDraft() {
    setActiveUserId('');
    setUserDraft({
      email: '',
      displayName: '',
      password: '',
      roleIds: roles.some((r) => r.id === 'user') ? ['user'] : [],
      isActive: true
    });
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeRole) return;
    setRoleDraft({
      id: activeRole.id,
      name: activeRole.name,
      description: activeRole.description || '',
      permissions: (activeRole.permissions || []).join(', ')
    });
  }, [activeRoleId]);

  useEffect(() => {
    if (!activeUser) return;
    setUserDraft({
      email: activeUser.email,
      displayName: activeUser.displayName,
      password: '',
      roleIds: activeUser.roleIds || [],
      isActive: activeUser.isActive
    });
  }, [activeUserId]);

  async function createRole() {
    try {
      setStatus('Создаю роль…');
      const perms = roleDraft.permissions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await fetchJSON('/api/admin/roles', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: roleDraft.id.trim(),
          name: roleDraft.name.trim(),
          description: roleDraft.description.trim() || undefined,
          permissions: perms
        })
      });

      await loadAll();
      setStatus('Роль создана ✅');
      setTimeout(() => setStatus(''), 1500);
    } catch (e) {
      setStatus(`Ошибка: ${String(e)}`);
    }
  }

  async function updateRole() {
    if (!activeRole) return;
    try {
      setStatus('Сохраняю роль…');
      const perms = roleDraft.permissions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await fetchJSON(`/api/admin/roles/${encodeURIComponent(activeRole.id)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: roleDraft.name.trim(),
          description: roleDraft.description.trim() || undefined,
          permissions: perms
        })
      });

      await loadAll();
      setStatus('Сохранено ✅');
      setTimeout(() => setStatus(''), 1500);
    } catch (e) {
      setStatus(`Ошибка: ${String(e)}`);
    }
  }

  async function deleteRole() {
    if (!activeRole) return;
    if (!confirm(`Удалить роль ${activeRole.id}?`)) return;
    try {
      setStatus('Удаляю роль…');
      await fetchJSON(`/api/admin/roles/${encodeURIComponent(activeRole.id)}`, { method: 'DELETE' });
      setActiveRoleId('');
      setRoleDraft({ id: '', name: '', description: '', permissions: '' });
      await loadAll();
      setStatus('Удалено ✅');
      setTimeout(() => setStatus(''), 1500);
    } catch (e) {
      setStatus(`Ошибка: ${String(e)}`);
    }
  }

  async function createUser() {
    try {
      setStatus('Создаю пользователя…');
      await fetchJSON('/api/admin/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: userDraft.email.trim(),
          displayName: userDraft.displayName.trim(),
          password: userDraft.password,
          roleIds: userDraft.roleIds,
          isActive: userDraft.isActive
        })
      });
      await loadAll();
      resetUserDraft();
      setStatus('Пользователь создан ✅');
      setTimeout(() => setStatus(''), 1500);
    } catch (e) {
      setStatus(`Ошибка: ${String(e)}`);
    }
  }

  async function updateUser() {
    if (!activeUser) return;
    try {
      setStatus('Сохраняю пользователя…');
      await fetchJSON(`/api/admin/users/${encodeURIComponent(activeUser.id)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          displayName: userDraft.displayName.trim(),
          password: userDraft.password || undefined,
          roleIds: userDraft.roleIds,
          isActive: userDraft.isActive
        })
      });
      await loadAll();
      setStatus('Сохранено ✅');
      setUserDraft({ ...userDraft, password: '' });
      setTimeout(() => setStatus(''), 1500);
    } catch (e) {
      setStatus(`Ошибка: ${String(e)}`);
    }
  }

  async function deleteUser() {
    if (!activeUser) return;
    if (!confirm(`Удалить пользователя ${activeUser.email}?`)) return;
    try {
      setStatus('Удаляю пользователя…');
      await fetchJSON(`/api/admin/users/${encodeURIComponent(activeUser.id)}`, { method: 'DELETE' });
      resetUserDraft();
      await loadAll();
      setStatus('Удалено ✅');
      setTimeout(() => setStatus(''), 1500);
    } catch (e) {
      setStatus(`Ошибка: ${String(e)}`);
    }
  }

  async function toggleUserActive(u: UserRow) {
    try {
      setStatus(u.isActive ? 'Отключаю пользователя…' : 'Включаю пользователя…');
      await fetchJSON(`/api/admin/users/${encodeURIComponent(u.id)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          displayName: u.displayName,
          roleIds: u.roleIds,
          isActive: !u.isActive
        })
      });
      await loadAll();
      if (activeUserId === u.id) {
        setActiveUserId(u.id);
      }
      setStatus('Готово ✅');
      setTimeout(() => setStatus(''), 1500);
    } catch (e) {
      setStatus(`Ошибка: ${String(e)}`);
    }
  }

  async function resetPassword(u: UserRow) {
    const pw = prompt(`Новый пароль для ${u.email}`, '');
    if (!pw) return;

    try {
      setStatus('Обновляю пароль…');
      await fetchJSON(`/api/admin/users/${encodeURIComponent(u.id)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          displayName: u.displayName,
          roleIds: u.roleIds,
          isActive: u.isActive,
          password: pw
        })
      });
      await loadAll();
      setStatus('Пароль обновлён ✅');
      setTimeout(() => setStatus(''), 1500);
    } catch (e) {
      setStatus(`Ошибка: ${String(e)}`);
    }
  }

  const canRoles = can(me, 'roles:manage');
  const canUsers = can(me, 'users:manage');

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <CommentsSettingsCard />
      <div className="rounded-2xl border bg-white p-4 shadow-sm lg:col-span-4">
        <div className="text-sm font-semibold">Права (roles)</div>
        {!canRoles ? (
          <div className="mt-2 text-sm text-slate-600">Недостаточно прав (roles:manage).</div>
        ) : (
          <>
            <div className="mt-3 space-y-2">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveRoleId(r.id)}
                  className={cls(
                    'w-full rounded-xl border px-3 py-2 text-left',
                    r.id === activeRoleId ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">{r.name}</div>
                      <div className="text-xs text-slate-500">
                        {r.id}{r.isSystem ? ' (system)' : ''}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">{r.permissions?.length ?? 0}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 border-t pt-3">
              <div className="text-sm font-semibold">{activeRole ? 'Редактировать роль' : 'Создать роль'}</div>
              <div className="mt-2 space-y-2">
                <Field label="ID (например: site_editor)">
                  <input
                    className="w-full rounded-xl border px-3 py-2"
                    value={roleDraft.id}
                    disabled={Boolean(activeRole)}
                    onChange={(e) => setRoleDraft({ ...roleDraft, id: e.target.value })}
                  />
                </Field>
                <Field label="Название">
                  <input className="w-full rounded-xl border px-3 py-2" value={roleDraft.name} onChange={(e) => setRoleDraft({ ...roleDraft, name: e.target.value })} />
                </Field>
                <Field label="Описание">
                  <input className="w-full rounded-xl border px-3 py-2" value={roleDraft.description} onChange={(e) => setRoleDraft({ ...roleDraft, description: e.target.value })} />
                </Field>
                <Field label="Permissions (через запятую)">
                  <textarea className="w-full rounded-xl border px-3 py-2" rows={3} value={roleDraft.permissions} onChange={(e) => setRoleDraft({ ...roleDraft, permissions: e.target.value })} />
                </Field>
                <div className="flex flex-wrap gap-2">
                  {!activeRole ? (
                    <button onClick={createRole} className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800">
                      Создать
                    </button>
                  ) : (
                    <>
                      <button onClick={updateRole} className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800">
                        Сохранить
                      </button>
                      {!activeRole.isSystem ? (
                        <button onClick={deleteRole} className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
                          Удалить
                        </button>
                      ) : null}
                    </>
                  )}
                  <button
                    onClick={() => {
                      setActiveRoleId('');
                      setRoleDraft({ id: '', name: '', description: '', permissions: '' });
                    }}
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    Сброс
                  </button>
                </div>
                <div className="text-xs text-slate-500">
                  Для доступа к админке добавьте permission <span className="font-mono">admin:access</span>.
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm lg:col-span-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold">Пользователи</div>

          {canUsers ? (
            <div className="flex flex-wrap gap-2">
              <input
                className="rounded-xl border px-3 py-2 text-sm"
                placeholder="Поиск по email / имени"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <select
                className="rounded-xl border px-3 py-2 text-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">Все роли</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.id})
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        {!canUsers ? (
          <div className="mt-2 text-sm text-slate-600">Недостаточно прав (users:manage).</div>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className={cls(
                      'rounded-xl border px-3 py-3',
                      u.id === activeUserId ? 'bg-slate-50' : 'bg-white'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button onClick={() => setActiveUserId(u.id)} className="min-w-0 flex-1 text-left">
                        <div className="truncate text-sm font-semibold">{u.displayName}</div>
                        <div className="truncate text-xs text-slate-500">{u.email}</div>
                        <div className="mt-1 text-xs text-slate-500">Roles: {(u.roleIds || []).join(', ') || '—'}</div>
                      </button>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <div className={cls('text-xs', u.isActive ? 'text-emerald-600' : 'text-slate-400')}>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </div>

                        <div className="flex flex-wrap justify-end gap-1">
                          <button
                            onClick={() => toggleUserActive(u)}
                            className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50"
                          >
                            {u.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => resetPassword(u)}
                            className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50"
                          >
                            Reset PW
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 ? (
                  <div className="rounded-xl border border-dashed px-3 py-6 text-sm text-slate-500">
                    Ничего не найдено.
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border p-3">
                <div className="text-sm font-semibold">{activeUser ? 'Редактировать пользователя' : 'Создать пользователя'}</div>
                <div className="mt-2 space-y-2">
                  {!activeUser ? (
                    <Field label="Email">
                      <input
                        className="w-full rounded-xl border px-3 py-2"
                        value={userDraft.email}
                        onChange={(e) => setUserDraft({ ...userDraft, email: e.target.value })}
                      />
                    </Field>
                  ) : (
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">{activeUser.email}</div>
                  )}

                  <Field label="Display name">
                    <input
                      className="w-full rounded-xl border px-3 py-2"
                      value={userDraft.displayName}
                      onChange={(e) => setUserDraft({ ...userDraft, displayName: e.target.value })}
                    />
                  </Field>

                  <Field label={activeUser ? 'Новый пароль (опционально)' : 'Пароль'}>
                    <input
                      className="w-full rounded-xl border px-3 py-2"
                      type="password"
                      value={userDraft.password}
                      onChange={(e) => setUserDraft({ ...userDraft, password: e.target.value })}
                    />
                  </Field>

                  <Field label="Роли">
                    <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border p-3">
                      {roles.map((r) => (
                        <label key={r.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={userDraft.roleIds.includes(r.id)}
                            onChange={(e) => {
                              const on = e.target.checked;
                              setUserDraft({
                                ...userDraft,
                                roleIds: on
                                  ? [...userDraft.roleIds, r.id]
                                  : userDraft.roleIds.filter((x) => x !== r.id)
                              });
                            }}
                          />
                          <span>
                            {r.name} <span className="text-xs text-slate-500">({r.id})</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </Field>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={userDraft.isActive}
                      onChange={(e) => setUserDraft({ ...userDraft, isActive: e.target.checked })}
                    />
                    Активен
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {!activeUser ? (
                      <button onClick={createUser} className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800">
                        Создать
                      </button>
                    ) : (
                      <>
                        <button onClick={updateUser} className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800">
                          Сохранить
                        </button>
                        <button onClick={deleteUser} className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
                          Удалить
                        </button>
                      </>
                    )}

                    <button onClick={resetUserDraft} className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
                      Сброс
                    </button>
                  </div>

                  <div className="text-xs text-slate-500">
                    Новые пользователи без явно выбранной роли получают роль <span className="font-mono">user</span>.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {status ? <div className="mt-4 text-sm text-slate-600">{status}</div> : null}
      </div>
    </div>
  );
}

export default function AdminClient() {
  const build = formatBuildLabel();
  const [tab, setTab] = useState<Tab>('pages');
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [activePageId, setActivePageId] = useState<string>('');
  const [activeBlockId, setActiveBlockId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [me, setMe] = useState<MeUser | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setStatus('Проверка доступа…');

        const meData = await fetchJSON<{
          authenticated?: boolean;
          isAdmin?: boolean;
          redirect?: string;
          user?: MeUser | null;
        }>('/api/auth/me', {
          cache: 'no-store',
          credentials: 'include'
        });

        if (!alive) return;

        if (!meData?.authenticated) {
          window.location.assign('/login?next=/admin');
          return;
        }

        if (!meData?.isAdmin) {
          window.location.assign('/profile');
          return;
        }

        setMe((meData.user || null) as MeUser | null);

        setStatus('Загрузка конфигурации…');
        const c = await fetchConfig();

        if (!alive) return;

        setConfig(c);
        setActivePageId(c.pages[0]?.id ?? '');
        setStatus('');
      } catch (e) {
        if (!alive) return;
        setStatus(String(e));
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const activePage: PageDoc | null = useMemo(() => {
    if (!config) return null;
    return config.pages.find((p) => p.id === activePageId) ?? null;
  }, [config, activePageId]);

  const activeBlock: BlockInstance | null = useMemo(() => {
    if (!activePage) return null;
    return activePage.blocks.find((b) => b.id === activeBlockId) ?? null;
  }, [activePage, activeBlockId]);

  function updatePage(patch: Partial<PageDoc>) {
    if (!config || !activePage) return;
    const pages = config.pages.map((p) => (p.id === activePage.id ? { ...p, ...patch } : p));
    setConfig({ ...config, pages });
  }

  function updateBlock(blockId: string, patch: Partial<BlockInstance>) {
    if (!config || !activePage) return;
    const pages = config.pages.map((p) => {
      if (p.id !== activePage.id) return p;
      return {
        ...p,
        blocks: p.blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b))
      };
    });
    setConfig({ ...config, pages });
  }

  function addBlock(type: string) {
    if (!activePage || !config) return;
    const def = BLOCK_DEFINITIONS.find((d) => d.type === type);
    if (!def) return;
    const newBlock: BlockInstance = {
      id: uid('b'),
      type: def.type as any,
      props: { ...def.defaultProps },
      isEnabled: true
    };
    updatePage({ blocks: [...activePage.blocks, newBlock] });
    setActiveBlockId(newBlock.id);
  }

  function removeBlock(blockId: string) {
    if (!activePage) return;
    updatePage({ blocks: activePage.blocks.filter((b) => b.id !== blockId) });
    if (activeBlockId === blockId) setActiveBlockId('');
  }

  function moveBlock(blockId: string, dir: -1 | 1) {
    if (!activePage) return;
    const idx = activePage.blocks.findIndex((b) => b.id === blockId);
    if (idx < 0) return;
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= activePage.blocks.length) return;
    const copy = [...activePage.blocks];
    const [item] = copy.splice(idx, 1);
    copy.splice(nextIdx, 0, item);
    updatePage({ blocks: copy });
  }

  async function onSave() {
    if (!config) return;
    try {
      setStatus('Сохраняю…');
      await saveConfig(config);
      setStatus('Сохранено ✅');
      setTimeout(() => setStatus(''), 1500);
    } catch (e) {
      const msg = String(e);
      if (msg.includes('forbidden')) {
        setStatus('Ошибка сохранения: недостаточно прав для изменения siteConfig (нужны admin:access или site:write).');
      } else {
        setStatus(`Ошибка сохранения: ${msg}`);
      }
    }
  }

  function addPage() {
    if (!config) return;
    const p: PageDoc = {
      id: uid('p'),
      title: 'Новая страница',
      slug: 'new-page',
      isPublished: false,
      blocks: []
    };
    setConfig({ ...config, pages: [...config.pages, p] });
    setActivePageId(p.id);
    setActiveBlockId('');
  }

  function removePage(pageId: string) {
    if (!config) return;
    const pages = config.pages.filter((p) => p.id !== pageId);
    setConfig({ ...config, pages });
    if (activePageId === pageId) {
      setActivePageId(pages[0]?.id ?? '');
      setActiveBlockId('');
    }
  }

  if (!config) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-slate-600">Загрузка админки…</div>
      </div>
    );
  }

  const blockDefs = BLOCK_DEFINITIONS;
  const activeDef = activeBlock ? blockDefs.find((d) => d.type === activeBlock.type) : null;

  const showSecurity = can(me, 'roles:manage') || can(me, 'users:manage');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="aicar-container h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-bold">AICar Admin</div>
            <div className="text-xs text-slate-500">{APP_VERSION_INFO.gitMessage || 'Tilda-like builder (demo)'}</div>
            <div className="text-xs text-slate-400">{build}</div>
          </div>
          <div className="flex items-center gap-2">
            {me ? (
              <div className="hidden md:block text-xs text-slate-500">{me.email}</div>
            ) : null}
            <Link href="/logout?next=/" className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
              Выйти
            </Link>
            <button onClick={onSave} className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800">
              Сохранить
            </button>
            <Link href={activePage?.slug ? `/${activePage.slug}` : '/'} className="rounded-xl border px-4 py-2 text-sm hover:bg-slate-50">
              Открыть страницу
            </Link>
          </div>
        </div>
      </div>

      <div className="aicar-container py-4">
        <div className="flex gap-2 flex-wrap">
          <button
            className={cls('rounded-xl px-3 py-2 text-sm', tab === 'pages' ? 'bg-white border shadow-sm' : 'text-slate-600')}
            onClick={() => setTab('pages')}
          >
            Страницы
          </button>
          <button
            className={cls('rounded-xl px-3 py-2 text-sm', tab === 'site' ? 'bg-white border shadow-sm' : 'text-slate-600')}
            onClick={() => setTab('site')}
          >
            Сайт (Nav/Theme/Footer)
          </button>
          {showSecurity ? (
            <button
              className={cls('rounded-xl px-3 py-2 text-sm', tab === 'security' ? 'bg-white border shadow-sm' : 'text-slate-600')}
              onClick={() => setTab('security')}
            >
              Безопасность (RBAC)
            </button>
          ) : null}
          {status ? <div className="ml-auto text-sm text-slate-600 self-center">{status}</div> : null}
        </div>

        {tab === 'security' ? (
          <div className="mt-4">
            <SecurityTab me={me} />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Sidebar */}
            <aside className="lg:col-span-3">
              {tab === 'pages' ? (
                <div className="rounded-2xl border bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Страницы</div>
                    <button onClick={addPage} className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50">
                      + Добавить
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {config.pages.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActivePageId(p.id);
                          setActiveBlockId('');
                        }}
                        className={cls(
                          'w-full text-left rounded-xl border px-3 py-2',
                          p.id === activePageId ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{p.title}</div>
                            <div className="text-xs text-slate-500 truncate">/{p.slug || ''}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cls('text-xs', p.isPublished ? 'text-emerald-600' : 'text-slate-400')}>
                              {p.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {activePage ? (
                    <div className="mt-4 border-t pt-3">
                      <div className="text-sm font-semibold">Свойства</div>
                      <div className="mt-2 space-y-2">
                        <Field label="Title">
                          <input
                            className="w-full rounded-xl border px-3 py-2"
                            value={activePage.title}
                            onChange={(e) => updatePage({ title: e.target.value })}
                          />
                        </Field>
                        <Field label="Slug">
                          <input
                            className="w-full rounded-xl border px-3 py-2"
                            value={activePage.slug}
                            onChange={(e) => updatePage({ slug: e.target.value.replace(/\s+/g, '-') })}
                          />
                        </Field>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={activePage.isPublished}
                            onChange={(e) => updatePage({ isPublished: e.target.checked })}
                          />
                          Published
                        </label>
                        <button
                          onClick={() => removePage(activePage.id)}
                          className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                        >
                          Удалить страницу
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border bg-white p-3 shadow-sm">
                  <div className="text-sm font-semibold">Сайт</div>
                
                  <div className="mt-2 space-y-2">
                    <Field label="Brand name">
                      <input
                        className="w-full rounded-xl border px-3 py-2"
                        value={config.theme.brandName}
                        onChange={(e) => setConfig({ ...config, theme: { ...config.theme, brandName: e.target.value } })}
                      />
                    </Field>
                
                    <Field label="Footer note">
                      <input
                        className="w-full rounded-xl border px-3 py-2"
                        value={config.footer.note}
                        onChange={(e) => setConfig({ ...config, footer: { ...config.footer, note: e.target.value } })}
                      />
                    </Field>
                
                    {/* Navigation */} 
                    <div className="mt-4 border-t pt-3">
                      <div className="text-sm font-semibold">Навигация (группы)</div>
                      <div className="mt-2 space-y-3">
                        {(config.nav.items ?? []).map((it, idx) => (
                          <div key={(it.href ?? it.label) + idx} className="rounded-xl border p-3">
                            <div className="flex gap-2">
                              <input
                                className="flex-1 rounded-lg border px-2 py-2 text-sm"
                                placeholder="Label"
                                value={it.label}
                                onChange={(e) => {
                                  const items = [...config.nav.items];
                                  items[idx] = { ...items[idx], label: e.target.value };
                                  setConfig({ ...config, nav: { ...config.nav, items } });
                                }}
                              />
                              <input
                                className="flex-1 rounded-lg border px-2 py-2 text-sm"
                                placeholder="/path"
                                value={it.href ?? ''}
                                onChange={(e) => {
                                  const items = [...config.nav.items];
                                  items[idx] = { ...items[idx], href: e.target.value };
                                  setConfig({ ...config, nav: { ...config.nav, items } });
                                }}
                              />
                            </div>
                
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50"
                                onClick={() => {
                                  const items = [...config.nav.items];
                                  const nextIdx = Math.max(0, idx - 1);
                                  const [m] = items.splice(idx, 1);
                                  items.splice(nextIdx, 0, m);
                                  setConfig({ ...config, nav: { ...config.nav, items } });
                                }}
                              >
                                ↑
                              </button>
                              <button
                                className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50"
                                onClick={() => {
                                  const items = [...config.nav.items];
                                  const nextIdx = Math.min(items.length - 1, idx + 1);
                                  const [m] = items.splice(idx, 1);
                                  items.splice(nextIdx, 0, m);
                                  setConfig({ ...config, nav: { ...config.nav, items } });
                                }}
                              >
                                ↓
                              </button>
                              <button
                                className="ml-auto rounded-lg border px-2 py-1 text-xs hover:bg-slate-50"
                                onClick={() => {
                                  const items = config.nav.items.filter((_, i) => i !== idx);
                                  setConfig({ ...config, nav: { ...config.nav, items } });
                                }}
                              >
                                ✕ Удалить
                              </button>
                            </div>
                
                            {/* Children */} 
                            <div className="mt-3 rounded-xl bg-slate-50 p-2">
                              <div className="text-xs font-semibold text-slate-600">Подменю</div>
                              <div className="mt-2 space-y-2">
                                {((it.children as any[]) ?? []).map((c, cIdx) => (
                                  <div key={(c.href ?? c.label) + cIdx} className="flex gap-2">
                                    <input
                                      className="flex-1 rounded-lg border px-2 py-2 text-xs"
                                      placeholder="Label"
                                      value={c.label ?? ''}
                                      onChange={(e) => {
                                        const items = [...config.nav.items];
                                        const children = [...(((items[idx] as any).children ?? []) as any[])];
                                        children[cIdx] = { ...children[cIdx], label: e.target.value };
                                        (items[idx] as any).children = children;
                                        setConfig({ ...config, nav: { ...config.nav, items } });
                                      }}
                                    />
                                    <input
                                      className="flex-1 rounded-lg border px-2 py-2 text-xs"
                                      placeholder="/path"
                                      value={c.href ?? ''}
                                      onChange={(e) => {
                                        const items = [...config.nav.items];
                                        const children = [...(((items[idx] as any).children ?? []) as any[])];
                                        children[cIdx] = { ...children[cIdx], href: e.target.value };
                                        (items[idx] as any).children = children;
                                        setConfig({ ...config, nav: { ...config.nav, items } });
                                      }}
                                    />
                                    <button
                                      className="rounded-lg border px-2 text-xs hover:bg-white"
                                      onClick={() => {
                                        const items = [...config.nav.items];
                                        const children = (((items[idx] as any).children ?? []) as any[]).filter((_, j) => j !== cIdx);
                                        (items[idx] as any).children = children;
                                        setConfig({ ...config, nav: { ...config.nav, items } });
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                
                                <button
                                  className="rounded-lg border px-2 py-1 text-xs hover:bg-white"
                                  onClick={() => {
                                    const items = [...config.nav.items];
                                    const children = [ ...(((items[idx] as any).children ?? []) as any[]) ];
                                    children.push({ label: 'Пункт', href: '/' });
                                    (items[idx] as any).children = children;
                                    // Ensure href exists for group; keep current or use first child
                                    (items[idx] as any).href = (items[idx] as any).href || children[0].href;
                                    setConfig({ ...config, nav: { ...config.nav, items } });
                                  }}
                                >
                                  + Добавить пункт
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                
                        <button
                          className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                          onClick={() => {
                            const items = [...config.nav.items, { label: 'Новый пункт', href: '/', children: [] as any[] } as any];
                            setConfig({ ...config, nav: { ...config.nav, items } });
                          }}
                        >
                          + Добавить пункт меню
                        </button>
                      </div>
                    </div>
                
                    {/* Footer */} 
                    <div className="mt-4 border-t pt-3">
                      <div className="text-sm font-semibold">Футер (группы)</div>
                      <div className="mt-2 space-y-3">
                        {((config.footer.groups as any[]) ?? []).map((g, gIdx) => (
                          <div key={g.title + gIdx} className="rounded-xl border p-3">
                            <input
                              className="w-full rounded-lg border px-2 py-2 text-sm"
                              placeholder="Название группы"
                              value={g.title ?? ''}
                              onChange={(e) => {
                                const groups = [ ...(((config.footer as any).groups ?? []) as any[]) ];
                                groups[gIdx] = { ...groups[gIdx], title: e.target.value };
                                setConfig({ ...config, footer: { ...config.footer, groups } as any });
                              }}
                            />
                
                            <div className="mt-2 space-y-2">
                              {((g.links as any[]) ?? []).map((l, lIdx) => (
                                <div key={(l.href ?? l.label) + lIdx} className="flex gap-2">
                                  <input
                                    className="flex-1 rounded-lg border px-2 py-2 text-xs"
                                    placeholder="Label"
                                    value={l.label ?? ''}
                                    onChange={(e) => {
                                      const groups = [ ...(((config.footer as any).groups ?? []) as any[]) ];
                                      const links = [ ...(((groups[gIdx] as any).links ?? []) as any[]) ];
                                      links[lIdx] = { ...links[lIdx], label: e.target.value };
                                      (groups[gIdx] as any).links = links;
                                      setConfig({ ...config, footer: { ...config.footer, groups } as any });
                                    }}
                                  />
                                  <input
                                    className="flex-1 rounded-lg border px-2 py-2 text-xs"
                                    placeholder="/path"
                                    value={l.href ?? ''}
                                    onChange={(e) => {
                                      const groups = [ ...(((config.footer as any).groups ?? []) as any[]) ];
                                      const links = [ ...(((groups[gIdx] as any).links ?? []) as any[]) ];
                                      links[lIdx] = { ...links[lIdx], href: e.target.value };
                                      (groups[gIdx] as any).links = links;
                                      setConfig({ ...config, footer: { ...config.footer, groups } as any });
                                    }}
                                  />
                                  <button
                                    className="rounded-lg border px-2 text-xs hover:bg-white"
                                    onClick={() => {
                                      const groups = [ ...(((config.footer as any).groups ?? []) as any[]) ];
                                      const links = (((groups[gIdx] as any).links ?? []) as any[]).filter((_, j) => j !== lIdx);
                                      (groups[gIdx] as any).links = links;
                                      setConfig({ ...config, footer: { ...config.footer, groups } as any });
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                
                              <button
                                className="rounded-lg border px-2 py-1 text-xs hover:bg-white"
                                onClick={() => {
                                  const groups = [ ...(((config.footer as any).groups ?? []) as any[]) ];
                                  const links = [ ...(((groups[gIdx] as any).links ?? []) as any[]) ];
                                  links.push({ label: 'Ссылка', href: '/' });
                                  (groups[gIdx] as any).links = links;
                                  setConfig({ ...config, footer: { ...config.footer, groups } as any });
                                }}
                              >
                                + Добавить ссылку
                              </button>
                
                              <button
                                className="rounded-lg border px-2 py-1 text-xs hover:bg-white"
                                onClick={() => {
                                  const groups = (((config.footer as any).groups ?? []) as any[]).filter((_, j) => j !== gIdx);
                                  setConfig({ ...config, footer: { ...config.footer, groups } as any });
                                }}
                              >
                                ✕ Удалить группу
                              </button>
                            </div>
                          </div>
                        ))}
                
                        <button
                          className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                          onClick={() => {
                            const groups = [ ...(((config.footer as any).groups ?? []) as any[]) ];
                            groups.push({ title: 'Новая группа', links: [] as any[] });
                            setConfig({ ...config, footer: { ...config.footer, groups } as any });
                          }}
                        >
                          + Добавить группу футера
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </aside>

            {/* Main */}
            <section className="lg:col-span-6">
              {activePage ? (
                <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                  <div className="border-b px-4 py-3 flex items-center justify-between">
                    <div className="text-sm font-semibold">Блоки</div>
                    <div className="flex gap-2">
                      <select
                        className="rounded-xl border px-3 py-2 text-sm"
                        onChange={(e) => {
                          if (e.target.value) addBlock(e.target.value);
                          e.currentTarget.selectedIndex = 0;
                        }}
                      >
                        <option value="">+ Добавить блок…</option>
                        {blockDefs.map((d) => (
                          <option key={d.type} value={d.type}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {activePage.blocks.length === 0 ? (
                      <div className="text-sm text-slate-600">На странице пока нет блоков.</div>
                    ) : null}

                    {activePage.blocks.map((b) => (
                      <div
                        key={b.id}
                        className={cls(
                          'rounded-2xl border p-3',
                          b.id === activeBlockId ? 'bg-slate-50 border-slate-300' : 'bg-white'
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <button
                            className="text-left flex items-center gap-2"
                            onClick={() => setActiveBlockId(b.id)}
                          >
                            <BlockBadge type={b.type} />
                            <span className="text-xs text-slate-500">{b.id}</span>
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50"
                              onClick={() => moveBlock(b.id, -1)}
                            >
                              ↑
                            </button>
                            <button
                              className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50"
                              onClick={() => moveBlock(b.id, 1)}
                            >
                              ↓
                            </button>
                            <label className="text-xs text-slate-600 flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={b.isEnabled}
                                onChange={(e) => updateBlock(b.id, { isEnabled: e.target.checked })}
                              />
                              Enabled
                            </label>
                            <button
                              className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50"
                              onClick={() => removeBlock(b.id)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 rounded-xl border bg-white overflow-hidden">
                          <BlockRenderer block={b} config={config!} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            {/* Inspector */}
            <aside className="lg:col-span-3">
              <div className="rounded-2xl border bg-white p-3 shadow-sm">
                <div className="text-sm font-semibold">Инспектор</div>
                {activeBlock && activeDef ? (
                  <div className="mt-3 space-y-2">
                    {activeDef.fields.map((f) => {
                      const key = f.key;
                      const value = (activeBlock.props as any)[key];

                      if (f.type === 'text' || f.type === 'url') {
                        return (
                          <Field key={key} label={f.label}>
                            <input
                              type={f.type === 'url' ? 'url' : 'text'}
                              placeholder={f.placeholder ?? ''}
                              className="w-full rounded-xl border px-3 py-2"
                              value={value ?? ''}
                              onChange={(e) =>
                                updateBlock(activeBlock.id, {
                                  props: { ...activeBlock.props, [key]: e.target.value }
                                })
                              }
                            />
                          </Field>
                        );
                      }

                      if (f.type === 'textarea') {
                        return (
                          <Field key={key} label={f.label}>
                            <textarea
                              placeholder={f.placeholder ?? ''}
                              className="w-full rounded-xl border px-3 py-2"
                              rows={4}
                              value={value ?? ''}
                              onChange={(e) =>
                                updateBlock(activeBlock.id, {
                                  props: { ...activeBlock.props, [key]: e.target.value }
                                })
                              }
                            />
                          </Field>
                        );
                      }

                      if (f.type === 'number') {
                        return (
                          <Field key={key} label={f.label}>
                            <input
                              type="number"
                              min={f.min}
                              max={f.max}
                              className="w-full rounded-xl border px-3 py-2"
                              value={value ?? 0}
                              onChange={(e) =>
                                updateBlock(activeBlock.id, {
                                  props: { ...activeBlock.props, [key]: Number(e.target.value) }
                                })
                              }
                            />
                          </Field>
                        );
                      }

                      if (f.type === 'boolean') {
                        return (
                          <label key={key} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={Boolean(value)}
                              onChange={(e) =>
                                updateBlock(activeBlock.id, {
                                  props: { ...activeBlock.props, [key]: e.target.checked }
                                })
                              }
                            />
                            {f.label}
                          </label>
                        );
                      }

                      if (f.type === 'image') {
                        return (
                          <Field key={key} label={f.label}>
                            <input
                              type="file"
                              accept="image/*"
                              className="w-full text-sm"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => {
                                  updateBlock(activeBlock.id, {
                                    props: { ...activeBlock.props, [key]: String(reader.result) }
                                  });
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                            <div className="mt-2 text-xs text-slate-500">(мок‑загрузка: хранится в JSON как data:URL)</div>
                          </Field>
                        );
                      }

                      return null;
                    })}

                    <div className="mt-3 rounded-xl border bg-slate-50 p-2">
                      <div className="text-xs font-medium text-slate-600">Props JSON</div>
                      <pre className="mt-1 text-xs overflow-auto">{JSON.stringify(activeBlock.props, null, 2)}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-slate-600">Выберите блок слева.</div>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
