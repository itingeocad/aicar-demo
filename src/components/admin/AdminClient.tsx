'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BLOCK_DEFINITIONS } from '@/components/blocks/BlockRegistry';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { Footer, TopNav } from '@/components/SiteChrome';
import { SiteConfig, PageDoc, BlockInstance } from '@/lib/site/types';
import { uid } from '@/lib/site/utils';

type Tab = 'pages' | 'site';

function cls(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(' ');
}

async function fetchConfig(): Promise<SiteConfig> {
  const res = await fetch('/api/site-config', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load config');
  return (await res.json()) as SiteConfig;
}

async function saveConfig(config: SiteConfig): Promise<void> {
  const res = await fetch('/api/site-config', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error('Failed to save config');
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
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

export default function AdminClient() {
  const [tab, setTab] = useState<Tab>('pages');
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [activePageId, setActivePageId] = useState<string>('');
  const [activeBlockId, setActiveBlockId] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    fetchConfig()
      .then((c) => {
        setConfig(c);
        setActivePageId(c.pages[0]?.id ?? '');
      })
      .catch((e) => setStatus(String(e)));
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
      setStatus(`Ошибка сохранения: ${String(e)}`);
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="aicar-container h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-bold">AICar Admin</div>
            <div className="text-xs text-slate-500">Tilda-like builder (demo)</div>
          </div>
          <div className="flex items-center gap-2">
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
        <div className="flex gap-2">
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
          {status ? <div className="ml-auto text-sm text-slate-600 self-center">{status}</div> : null}
        </div>

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
                      <Field label="Название">
                        <input
                          className="w-full rounded-xl border px-3 py-2"
                          value={activePage.title}
                          onChange={(e) => updatePage({ title: e.target.value })}
                        />
                      </Field>
                      <Field label="Slug (без /)">
                        <input
                          className="w-full rounded-xl border px-3 py-2"
                          value={activePage.slug}
                          onChange={(e) => updatePage({ slug: e.target.value.replace(/^\/+/, '') })}
                        />
                      </Field>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={activePage.isPublished}
                          onChange={(e) => updatePage({ isPublished: e.target.checked })}
                        />
                        Опубликована
                      </label>
                      <button
                        onClick={() => removePage(activePage.id)}
                        className="w-full rounded-xl border px-3 py-2 text-sm text-red-600 hover:bg-red-50"
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
                <div className="mt-3 space-y-3">
                  <Field label="Brand name">
                    <input
                      className="w-full rounded-xl border px-3 py-2"
                      value={config.theme.brandName}
                      onChange={(e) => setConfig({ ...config, theme: { ...config.theme, brandName: e.target.value } })}
                    />
                  </Field>
                  <Field label="Nav items (формат: Label|/path, по строкам)">
                    <textarea
                      className="w-full rounded-xl border px-3 py-2 min-h-[120px]"
                      value={config.nav.items.map((i) => `${i.label}|${i.href}`).join('\n')}
                      onChange={(e) => {
                        const items = e.target.value
                          .split('\n')
                          .map((l) => l.trim())
                          .filter(Boolean)
                          .map((l) => {
                            const [label, href] = l.split('|');
                            return { label: (label ?? '').trim(), href: (href ?? '').trim() };
                          })
                          .filter((x) => x.label && x.href);
                        setConfig({ ...config, nav: { items } });
                      }}
                    />
                  </Field>
                  <Field label="Footer note">
                    <input
                      className="w-full rounded-xl border px-3 py-2"
                      value={config.footer.note}
                      onChange={(e) => setConfig({ ...config, footer: { ...config.footer, note: e.target.value } })}
                    />
                  </Field>
                </div>
              </div>
            )}
          </aside>

          {/* Middle: Blocks */}
          <section className="lg:col-span-4">
            <div className="rounded-2xl border bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Блоки страницы</div>
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-lg border px-2 py-1 text-sm"
                    defaultValue=""
                    onChange={(e) => {
                      if (!e.target.value) return;
                      addBlock(e.target.value);
                      e.currentTarget.value = '';
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

              {!activePage ? (
                <div className="mt-4 text-sm text-slate-600">Выбери страницу слева.</div>
              ) : activePage.blocks.length === 0 ? (
                <div className="mt-4 text-sm text-slate-600">Нет блоков. Добавь первый блок.</div>
              ) : (
                <div className="mt-3 space-y-2">
                  {activePage.blocks.map((b) => (
                    <div
                      key={b.id}
                      className={cls(
                        'rounded-xl border p-3',
                        b.id === activeBlockId ? 'bg-slate-50' : 'bg-white'
                      )}
                    >
                      <button className="w-full text-left" onClick={() => setActiveBlockId(b.id)}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <BlockBadge type={b.type} />
                            <span className="text-xs text-slate-500">{b.id}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              className="rounded-lg border px-2 py-1 text-xs hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlock(b.id, -1);
                              }}
                              title="Вверх"
                            >
                              ↑
                            </button>
                            <button
                              className="rounded-lg border px-2 py-1 text-xs hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlock(b.id, 1);
                              }}
                              title="Вниз"
                            >
                              ↓
                            </button>
                            <button
                              className="rounded-lg border px-2 py-1 text-xs hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateBlock(b.id, { isEnabled: b.isEnabled === false ? true : false });
                              }}
                              title="Вкл/выкл"
                            >
                              {b.isEnabled === false ? 'Off' : 'On'}
                            </button>
                            <button
                              className="rounded-lg border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeBlock(b.id);
                              }}
                              title="Удалить"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Block editor */}
            <div className="mt-4 rounded-2xl border bg-white p-3 shadow-sm">
              <div className="text-sm font-semibold">Свойства блока</div>
              {!activeBlock || !activeDef ? (
                <div className="mt-3 text-sm text-slate-600">Выбери блок для редактирования.</div>
              ) : (
                <div className="mt-3 space-y-3">
                  {activeDef.fields.map((f) => {
                    const value = (activeBlock.props as any)[f.key];

                    if (f.type === 'textarea') {
                      return (
                        <Field key={f.key} label={f.label}>
                          <textarea
                            className="w-full rounded-xl border px-3 py-2 min-h-[90px]"
                            value={String(value ?? '')}
                            onChange={(e) => updateBlock(activeBlock.id, { props: { ...activeBlock.props, [f.key]: e.target.value } })}
                          />
                        </Field>
                      );
                    }

                    if (f.type === 'number') {
                      return (
                        <Field key={f.key} label={f.label}>
                          <input
                            type="number"
                            min={f.min}
                            max={f.max}
                            className="w-full rounded-xl border px-3 py-2"
                            value={Number(value ?? 0)}
                            onChange={(e) => updateBlock(activeBlock.id, { props: { ...activeBlock.props, [f.key]: Number(e.target.value) } })}
                          />
                        </Field>
                      );
                    }

                    if (f.type === 'boolean') {
                      return (
                        <label key={f.key} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(e) => updateBlock(activeBlock.id, { props: { ...activeBlock.props, [f.key]: e.target.checked } })}
                          />
                          {f.label}
                        </label>
                      );
                    }

                    if (f.type === 'image') {
                      return (
                        <Field key={f.key} label={f.label}>
                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => {
                                  const dataUrl = String(reader.result ?? '');
                                  updateBlock(activeBlock.id, { props: { ...activeBlock.props, [f.key]: dataUrl } });
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                            {value ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={String(value)} alt="preview" className="h-12 w-20 rounded-lg border object-cover" />
                            ) : (
                              <div className="text-xs text-slate-500">нет</div>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">Это мок-загрузка: картинка хранится прямо в JSON (data:URL).</div>
                        </Field>
                      );
                    }

                    // text/url default
                    return (
                      <Field key={f.key} label={f.label}>
                        <input
                          className="w-full rounded-xl border px-3 py-2"
                          value={String(value ?? '')}
                          onChange={(e) => updateBlock(activeBlock.id, { props: { ...activeBlock.props, [f.key]: e.target.value } })}
                        />
                      </Field>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Right: Preview */}
          <section className="lg:col-span-5">
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="border-b px-3 py-2 flex items-center justify-between">
                <div className="text-sm font-semibold">Превью</div>
                <div className="text-xs text-slate-500">Обновляется мгновенно</div>
              </div>
              <div className="max-h-[calc(100vh-170px)] overflow-auto">
                {/* Render a “fake” page frame */}
                <TopNav config={config} />
                <main>
                  {activePage?.blocks.map((b) => (
                    <BlockRenderer
                      key={b.id}
                      block={b}
                      config={config}
                      ctx={activePage.slug === 'cars/[id]' ? { carId: config.demoData.cars[0]?.id } : undefined}
                    />
                  ))}
                </main>
                <Footer config={config} />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border bg-white p-3 shadow-sm">
              <div className="text-sm font-semibold">Экспорт / импорт</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'aicar-site-config.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Скачать JSON
                </button>
                <label className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                  Загрузить JSON
                  <input
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        try {
                          const next = JSON.parse(String(reader.result ?? '')) as SiteConfig;
                          setConfig(next);
                          setStatus('Импортировано ✅');
                          setTimeout(() => setStatus(''), 1500);
                        } catch {
                          setStatus('Ошибка импорта JSON');
                        }
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Для демо удобно: можно быстро перенести настройки между машинами/окружениями.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
