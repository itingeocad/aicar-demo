# AICar Demo Builder (Tilda-like)

Это рабочий демо-проект: сайт рендерит страницы из JSON-конфига, а админка позволяет собирать страницы из блоков (как «Тильда», но block-based).

## Запуск

```bash
npm install
npm run dev
```

Открыть:
- Сайт: http://localhost:3000
- Админка: http://localhost:3000/admin

## Как устроено хранение

- Конфиг сайта хранится в `.tmp/site-config.json` (создаётся при первом сохранении из админки).
- Если файла нет, берётся дефолтный конфиг `src/lib/site/defaultConfig.ts`.

> Для деплоя на платформы с read-only FS (например, Vercel/Netlify) нужен внешний storage.
> В демо уже встроен **Upstash Redis adapter**: если заданы переменные `UPSTASH_REDIS_REST_URL` и `UPSTASH_REDIS_REST_TOKEN`, конфиг будет читаться/сохраняться в Redis.

### Переменные окружения (для хостинга)

- `UPSTASH_REDIS_REST_URL` — URL из Upstash (REST)
- `UPSTASH_REDIS_REST_TOKEN` — токен из Upstash (REST)
- `AICAR_SITE_CONFIG_KEY` — ключ (опционально), по умолчанию `aicar:siteConfig`

## Мок загрузки медиа

В редакторе блока `Hero` есть поле «Фон (мок-загрузка)» — картинка сохраняется как data:URL прямо в JSON-конфиге.

## Версионирование

- Версия приложения берётся из `package.json` и автоматически прокидывается в клиент/сервер через `next.config.mjs`.
- Версия отображается в футере публичного сайта и в шапке админки.
- Проверить можно также через `GET /api/version`.
