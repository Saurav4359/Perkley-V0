# Perkley

Performance-based creator marketing platform — Turborepo monorepo.

## Structure

```
.
├── apps/
│   ├── web/                    # Next.js marketing site (frontend)
│   └── api/                    # Hono API server (backend)
├── packages/
│   ├── typescript-config/      # Shared TS configs
│   ├── validations/            # Shared Zod schemas
│   ├── database/               # Supabase client
│   └── email/                  # Transactional email helpers
├── AGENTS.md
├── CLAUDE.md
└── Idea.md
```

Shared logic lives in `packages/*`. Apps import workspace packages (e.g. `@perkley/validations`) — no duplicated backend code.

## Getting started

```bash
bun install
bun run dev
```

Or run individually:

```bash
bun run dev --filter=web   # http://localhost:3000
bun run dev --filter=api   # http://localhost:3001
```

Turbo builds workspace packages before apps (`dependsOn: ["^build"]`).

```bash
bun run build   # packages → apps
bun run lint    # typecheck + eslint
```

## Apps

| App | Path | Description |
|-----|------|-------------|
| web | `apps/web` | Marketing landing page (Next.js) |
| api | `apps/api` | Backend API (Bun + Hono) |

## Packages

| Package | Purpose |
|---------|---------|
| `@perkley/typescript-config` | Base, Next.js, Bun, and library TS configs |
| `@perkley/validations` | Zod schemas and shared input transforms |
| `@perkley/database` | Supabase admin client |
| `@perkley/email` | SMTP email helpers |

See [apps/web/README.md](./apps/web/README.md) and [apps/api/README.md](./apps/api/README.md) for app-specific setup.
