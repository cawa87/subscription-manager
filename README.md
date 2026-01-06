# IT Knowledge Digest

A self-hosted tool to keep up with IT/dev news with less reading:

- Collects items from configured sources (MVP: RSS/Atom)
- Stores everything in SQLite
- Provides a mobile-friendly web dashboard (Nuxt + Vuetify)
- Generates AI summaries (OpenAI-compatible API)
- Builds a daily digest (in-app, optional Telegram delivery)

## Stack

- Backend: NestJS + GraphQL (Apollo)
- Frontend: Nuxt + Vuetify
- DB: SQLite (via Drizzle ORM + migrations)
- Scheduler: NestJS Schedule (cron)

## Repo layout

- `apps/api`: NestJS GraphQL API
- `apps/web`: Nuxt dashboard

## Requirements

- Node.js 20+
- pnpm 10+

## Environment variables

### API (`apps/api`)

- `DB_FILE`: path to SQLite file (default: `./.data/app.db`)

AI (optional, required for `summarizeItem`):
- `AI_API_KEY`
- `AI_BASE_URL` (optional, default: `https://api.openai.com/v1`)
- `AI_MODEL` (optional, default: `gpt-4o-mini`)

Telegram (optional, to send the digest):
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

### Web (`apps/web`)

- `NUXT_PUBLIC_GRAPHQL_ENDPOINT` (default: `http://localhost:3001/graphql`)

## Run with pnpm (recommended for dev)

Install deps:

```bash
pnpm install
```

Start API (GraphQL on `http://localhost:3000/graphql`):

```bash
DB_FILE=./.data/app.db pnpm --filter api dev
```

Start Web (UI on `http://localhost:3000`):

```bash
NUXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:3001/graphql pnpm --filter web dev
```

## Run with Docker Compose

```bash
docker compose up --build
```

The compose setup publishes:

- Web: `http://localhost:3000`
- API: `http://localhost:3001/graphql`

SQLite is stored in a named volume (`sqlite_data`).

## GraphQL quick checks

Ping:

```bash
curl -s -X POST http://localhost:3001/graphql \
  -H 'content-type: application/json' \
  --data '{"query":"query{ping}"}'
```

Create DEV feed source:

```bash
curl -s -X POST http://localhost:3001/graphql \
  -H 'content-type: application/json' \
  --data '{"query":"mutation($input: CreateSourceInput!){createSource(input:$input){id name url}}","variables":{"input":{"name":"Dev.to","url":"https://dev.to/feed","type":"rss","enabled":true,"fetchIntervalMinutes":60,"category":"General","contentType":"Community posts (Wide net)"}}}'
```

Fetch now:

```bash
curl -s -X POST http://localhost:3001/graphql \
  -H 'content-type: application/json' \
  --data '{"query":"mutation($id:ID!){fetchSourceNow(sourceId:$id)}","variables":{"id":"REPLACE_WITH_SOURCE_ID"}}'
```

Run today digest:

```bash
curl -s -X POST http://localhost:3001/graphql \
  -H 'content-type: application/json' \
  --data '{"query":"mutation{runDailyDigest{date title summary}}"}'
```

## Notes

- Migrations are generated in `apps/api/drizzle` and are applied automatically when the API starts.
- If `AI_API_KEY` is not set, `summarizeItem` will return an error and the UI will show it.


