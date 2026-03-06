# AICar Demo Builder (Tilda-like) + RBAC

Это рабочий демо-проект:
- публичный сайт рендерит страницы из JSON-конфига,
- админка позволяет собирать страницы из блоков (как «Тильда», block-based),
- добавлена авторизация и управление ролями/пользователями (RBAC) — хранится в Upstash (для демо).

## Запуск локально

```bash
npm install
npm run dev
```

Открыть:
- Сайт: http://localhost:3000
- Вход: http://localhost:3000/login
- Админка: http://localhost:3000/admin (после входа)

## Хранилище (Upstash)

> Для деплоя на платформы с read-only FS (например, Vercel) нужен внешний storage.
> В демо встроен **Upstash Redis adapter**: если заданы переменные `UPSTASH_REDIS_REST_URL` и `UPSTASH_REDIS_REST_TOKEN`, конфиг сайта и RBAC будут храниться в Redis.

### Переменные окружения (обязательно для Vercel)

- `UPSTASH_REDIS_REST_URL` — URL из Upstash (REST)
- `UPSTASH_REDIS_REST_TOKEN` — токен из Upstash (REST)

Опционально:
- `AICAR_SITE_CONFIG_KEY` — ключ для конфига сайта (по умолчанию `aicar:siteConfig`)
- `AICAR_AUTH_ROLES_KEY` — ключ для ролей (по умолчанию `aicar:auth:roles`)
- `AICAR_AUTH_USERS_KEY` — ключ для пользователей (по умолчанию `aicar:auth:users`)

## Авторизация и RBAC

- Кнопка в шапке: **Войти** / **Выйти**.
- `/admin` и `/api/admin/*` защищены middleware.
- RBAC управляется в админке во вкладке **Безопасность (RBAC)**.

### Важно: секрет для сессий

Нужно задать:
- `AICAR_AUTH_SECRET` (или `AUTH_SECRET`) — случайная длинная строка.

На Vercel: Settings → Environment Variables.

### Bootstrap супер-админа (один раз)

Супер-админ создаётся через скрипт, который записывает пользователя и системную роль в Upstash.

**Windows PowerShell пример:**

```powershell
$env:UPSTASH_REDIS_REST_URL="https://..."
$env:UPSTASH_REDIS_REST_TOKEN="..."
$env:AICAR_AUTH_SECRET="<random-long-secret>"

npm run bootstrap:superadmin -- --email "admin@aicar.local" --password "StrongPass123" --name "Super Admin"
```

После этого:
- зайдите на `/login` и войдите под указанными данными,
- откройте `/admin`.

## Мок загрузки медиа

В редакторе блока `Hero` есть поле «Фон (мок‑загрузка)» — картинка сохраняется как data:URL прямо в JSON-конфиге.

## Версионирование

- Версия приложения берётся из `package.json` и автоматически прокидывается в клиент/сервер через `next.config.mjs`.
- Версия отображается в футере публичного сайта и в шапке админки.
- Проверить можно через `GET /api/version`.

## Первичная настройка без локального Node.js

Если у вас нет Node.js/npm на компьютере, можно создать первого супер‑админа прямо на Vercel:

1) В Vercel → Project → Settings → Environment Variables добавьте:
- `AICAR_AUTH_SECRET` (случайная длинная строка)
- `AICAR_BOOTSTRAP_TOKEN` (любой длинный токен)
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (из Upstash)

2) Сделайте redeploy (или просто push любого коммита).

3) Откройте: `https://<ваш-домен>/setup?t=<AICAR_BOOTSTRAP_TOKEN>`

4) Создайте супер‑админа и перейдите в `/admin`.

После настройки рекомендуется сменить или удалить `AICAR_BOOTSTRAP_TOKEN`.
