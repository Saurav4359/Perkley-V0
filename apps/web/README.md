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
- `bun run build:web` — production build (alias for `--filter=web`)
- `bun run build --filter=web` — production build
- `bun run start --filter=web` — production server
- `bun run lint --filter=web` — ESLint

## Deploying to Vercel

Set the Vercel project **Root Directory** to `apps/web` (not the monorepo root). Install and build must run from the workspace root so Bun can resolve workspaces:

| Setting | Value |
|---------|--------|
| Install Command | `cd ../.. && bun install` |
| Build Command | `cd ../.. && bun run build --filter=web` |
| Output Directory | `.next` |

Enable **Include source files outside of the Root Directory in the Build Step** for the shared TypeScript config in `packages/typescript-config/`.

See [`vercel.json`](./vercel.json) and the root [README](../../README.md#deploying-to-vercel) for the full checklist.
