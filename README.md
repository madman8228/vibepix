# nextpic

Minimal Next.js bootstrap scaffold for the story-avatar generator MVP.

## Bootstrap Status

This repository currently includes:

- A minimal Next.js App Router shell in `src/app/layout.tsx`
- TypeScript, PostCSS, and Tailwind CSS v4 wiring
- Placeholder-safe test and Prisma commands so the bootstrap scripts run cleanly
- A minimal Prisma schema/config ready for later application models

This repository intentionally does not include yet:

- Product pages or feature routes
- API endpoints
- A real application data model or real seed data
- End-to-end coverage for user flows

## Scripts

- `npm run dev` starts the local development server.
- `npm run build` creates the production build.
- `npm run start` runs the production server.
- `npm run test` runs the bootstrap Vitest smoke test.
- `npm run test:e2e` runs Playwright and exits cleanly when no E2E specs exist yet.
- `npm run db:push` validates the Prisma setup and creates the local bootstrap SQLite database file.
- `npm run db:seed` runs a no-op bootstrap seed script.

## Notes

Tailwind is wired through PostCSS using the Tailwind v4 plugin, but the app shell intentionally stays minimal and does not ship any product UI yet.
