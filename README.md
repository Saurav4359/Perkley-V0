# Perkley

Performance-based creator marketing platform — waitlist landing page.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Framer Motion
- Zod + React Hook Form
- Supabase
- Nodemailer

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `SMTP_HOST` | SMTP host for confirmation emails |
| `SMTP_PORT` | SMTP port (587 or 465) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From address (optional) |

## Supabase setup

Run the migration in `supabase/migrations/001_waitlist.sql` in the Supabase SQL editor (or via CLI).

The `waitlist` table stores brand and creator signups with a unique constraint on `(email, role)`.

## API

`POST /api/waitlist`

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

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint
