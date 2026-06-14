# Perkley API

Backend API for Perkley. Routes are thin — business logic lives in shared workspace packages.

## Stack

- Bun + Hono (this app)
- `@perkley/validations` — Zod schemas
- `@perkley/database` — Supabase client
- `@perkley/email` — confirmation emails

## Getting started

From the **monorepo root**:

```bash
bun install
cp apps/api/.env.example apps/api/.env
bun run dev --filter=api
```

The API runs at [http://localhost:3001](http://localhost:3001).

## Environment variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default `3001`) |
| `CORS_ORIGIN` | Allowed frontend origin (default `http://localhost:3000`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `SMTP_HOST` | SMTP host for confirmation emails |
| `SMTP_PORT` | SMTP port (587 or 465) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From address (optional) |

## Supabase setup

Run the migration in `supabase/migrations/001_waitlist.sql` in the Supabase SQL editor (or via CLI).

## Endpoints

### `GET /health`

Health check.

### `POST /api/waitlist`

**Brand payload**

```json
{
  "role": "brand",
  "name": "Jane Doe",
  "email": "jane@company.com",
  "company": "Acme Inc"
}
```

**Creator payload**

```json
{
  "role": "creator",
  "name": "Alex Creator",
  "email": "alex@email.com",
  "instagram": "alexcreates",
  "niche": "Fitness",
  "followers": "5k – 25k"
}
```

## Scripts

From the monorepo root:

- `bun run dev --filter=api` — development server with hot reload
- `bun run build --filter=api` — bundle to `dist/`
- `bun run start --filter=api` — production server
- `bun run lint --filter=api` — TypeScript check
