# Perkley Web

Marketing landing page for Perkley — performance-based creator marketing.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Framer Motion

## Getting started

From the **monorepo root**:

```bash
bun install
bun run dev --filter=web
```

Open [http://localhost:3000](http://localhost:3000).

Backend API lives in [`apps/api`](../api/README.md).

## Scripts

From the monorepo root:

- `bun run dev --filter=web` — development server
- `bun run build --filter=web` — production build
- `bun run start --filter=web` — production server
- `bun run lint --filter=web` — ESLint
