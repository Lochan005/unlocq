# credx monorepo

Uses **pnpm** workspaces and **Turborepo**. Install dependencies only with **pnpm** (see [pnpm installation](https://pnpm.io/installation)).

## Setup

From the repository root:

```bash
pnpm install
```

## Common commands

| Goal | Command |
|------|---------|
| Web app (`credx`) dev | `pnpm --filter credx dev` |
| All packages dev (turbo) | `pnpm dev` |
| Build web app | `pnpm turbo build --filter=credx` |
| Typecheck | `pnpm typecheck` |
| Lint | `pnpm lint` |

## Layout

- `apps/credx` — Next.js app (deployed to Vercel with `pnpm install` + `pnpm turbo build --filter=credx`)
- `apps/mobile` — Expo app
- `packages/shared` — `@credx/shared`

Do not run `npm install` or `yarn` in workspace packages; use **pnpm** at the root so `pnpm-lock.yaml` stays the single source of truth.
