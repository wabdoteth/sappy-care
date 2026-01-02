# sappy-care

Scaffold for the Sappy self-care app (Expo + TypeScript, local-first data layer).

## Structure
- apps/mobile: Expo app
- packages/shared: shared types, schemas, and theme tokens
- supabase: backend scaffolding (Phase 9+)
- docs/UPDATED_SPEC.md: product and implementation spec (current)
- docs/SPEC.md: legacy spec (pre local-first)

## Getting started
1. cd apps/mobile
2. cp .env.example .env
3. keep EXPO_PUBLIC_USE_BACKEND=false for local-first mode
4. npm install
5. npm run start

## Supabase (Phase 9+)
- Set EXPO_PUBLIC_USE_BACKEND=true once backend work starts
- Provide EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
- Migrations live in `supabase/migrations`
- Seed data lives in `supabase/seed` and is loaded by `supabase/seed.sql`
- Run `supabase db reset` to apply migrations and seed data (requires Supabase CLI)

## Dev scripts
- npm run lint
- npm run format
- npm run test

## Notes
- RepoProvider switches between local and backend repos via EXPO_PUBLIC_USE_BACKEND.
- Local mode uses expo-sqlite and seeds items/story cards on first boot.
- Metro resolves @sappy/shared to packages/shared/src for local imports.
