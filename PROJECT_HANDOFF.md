# PROJECT_HANDOFF.md

## Project
AICar — demo auto portal with:
- homepage by prototype
- AIClips
- AIChat
- search
- news
- Tilda-like admin builder
- auth / registration
- RBAC with `super_admin` and `user`
- site config stored in Upstash Redis

## Stack
- Next.js 14.2.x App Router
- TypeScript
- Tailwind
- Vercel
- Upstash Redis REST
- Node 20.x

## Repository
- GitHub: `itingeocad/aicar-demo`

## Main routes
- `/`
- `/search`
- `/aichat`
- `/aiclips`
- `/news`
- `/login`
- `/register`
- `/profile`
- `/admin`
- `/api/version`

## Important env vars
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `AICAR_SESSION_SECRET`

## Current confirmed version
Last confirmed `/api/version`:
```json
{"name":"AICar","version":"0.1.192","gitSha":"1139877","buildTime":"2026-03-19T11:51:47.231Z"}