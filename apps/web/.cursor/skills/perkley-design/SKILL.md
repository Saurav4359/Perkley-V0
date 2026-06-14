---
name: perkley-design
description: Design and UI work for the Perkley marketing landing page. Use when styling pages, updating layout, choosing colors or typography, polishing components, adding motion, or matching the Elegant design system. Read DESIGN.md and app/globals.css before changing visuals.
---

# Perkley marketing design

## When to use

- Landing page layout, hero, sections, or footer
- Colors, typography, spacing, radius, or dark mode
- shadcn/ui component styling or composition
- Framer Motion animation on marketing sections

## Source of truth (read first)

1. **`DESIGN.md`** — Elegant preset: palette, type scale, spacing, rounded corners, style foundations
2. **`app/globals.css`** — Live CSS variables and Perkley brand tokens (`--brand`, `--brand-muted`, semantic shadcn vars)
3. **`app/layout.tsx`** — Fonts: Geist Sans, Geist Mono, Instrument Serif (display/headings)

If `DESIGN.md` and `globals.css` disagree, **keep Perkley brand orange** (`--brand: #fe6c37`) unless the user explicitly asks to switch to the Elegant blue palette.

## Component stack

Use the **shadcn** skill for all UI work:

- Project uses `base-nova` style, `@/components/ui/*`, Tailwind v4, Lucide icons
- Prefer semantic tokens: `bg-background`, `text-muted-foreground`, `bg-brand`, not raw hex in JSX
- Run from `apps/web/`: `npx shadcn@latest info`, `npx shadcn@latest docs <component>`

## Motion

- Use **Framer Motion** (`framer-motion`) — already used in `components/landing/motion.tsx`
- Reuse shared variants from `components/landing/motion.tsx` before inventing new ones
- Respect `prefers-reduced-motion` for accessibility

## Design tokens (Elegant / DESIGN.md)

| Token | Value |
|-------|-------|
| Primary | `#3B82F6` |
| Secondary | `#8B5CF6` |
| Text | `#111827` |
| Surface | `#FFFFFF` |
| Type scale | 14 / 16 / 18 / 24 / 32 / 40 |
| Spacing scale | 4 / 8 / 12 / 16 / 24 / 32 |
| Radius sm / md | 4px / 8px |

Map these through CSS variables in `globals.css` when applying theme changes — do not hardcode in components.

## Workflow

1. Read `DESIGN.md` and `app/globals.css`
2. Inspect existing section in `components/landing/` for patterns
3. Use shadcn components + semantic Tailwind classes
4. Add motion via shared landing motion helpers
5. Verify responsive layout and contrast on hero and key sections

## Do not

- Introduce new font families without updating `layout.tsx` and `@theme inline`
- Use `space-x-*` / `space-y-*` (use `flex` + `gap-*`)
- Override shadcn component colors with arbitrary Tailwind color classes
- Add GSAP unless the user explicitly requests it (project standard is Framer Motion)
