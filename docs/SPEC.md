> NOTE: `docs/UPDATED_SPEC.md` is the current source of truth. This document is legacy.

# Sappy — Codex-Optimized Spec (React Native + Supabase)

This document is formatted to be **easy for Codex to implement**: clear constraints, stepwise phases, explicit file paths, stubs, and acceptance criteria.  
Target: **React Native (Expo) + TypeScript + Supabase (Postgres/RLS) + RevenueCat**.

---

## 0) Codex Operating Instructions (READ FIRST)

### Primary goals
1. Implement MVP end-to-end with clean architecture and strong typing.
2. Ship a calm/pastel UI with theming (“Palettes”).
3. Keep the build **IP-safe**: do not copy any competitor UI/microcopy; use original naming and flows from this doc.

### Hard constraints
- Language: **TypeScript** everywhere.
- Frontend: **Expo React Native** (no native modules unless necessary).
- Backend: **Supabase Postgres + RLS**.
- Server validation for: purchases, bloom completion, currency balance.
- No hidden complexity: prioritize correctness, readability, and incremental delivery.

### Deliverable style
- Work in **phases**. Each phase should be a PR-sized change.
- Each phase must include:
  - code + migrations (if needed)
  - a short README update
  - tests for critical pure logic (reward/quest/schedule)
- Use feature flags where helpful (`ENABLE_SUBSCRIPTIONS`, `ENABLE_FRIENDS`).

---

## 1) Product Summary

**Sappy** is a pastel self-care companion app. Users complete tiny actions (check-ins, goals, calming activities) to fill a **Charge meter**, then trigger a **Bloom** moment that yields a **Story Card**, traits, and rewards (**Petals** currency + occasional **Stickers**). Users spend Petals in a shop for customization and unlockable **Palettes** (themes).

---

## 2) UX & IA (Distinct)

Bottom tabs (MVP):
- **Today**: charge meter, check-in CTA, goals list, quick actions
- **Care**: activity library (Breathe, Focus, Sound, Reflect, First Aid)
- **Bloom**: companion home + story album + shop entry
- **Friends**: friend codes + support notes (Phase 8)
- **Me**: insights, history, settings, subscriptions

Tone: warm, brief, non-clinical. Avoid shame language.

---

## 3) Tech Stack (Pinned Versions Suggestion)

### Frontend
- Expo SDK (current stable at implementation time)
- react-native, react-navigation
- Zustand (local state)
- @tanstack/react-query (server state)
- react-hook-form + zod
- NativeWind **or** Tamagui (pick one; default: NativeWind)
- expo-notifications, expo-av

### Backend
- Supabase (Postgres, Auth, Storage, Edge Functions)
- Row Level Security (RLS) enforced on all user-scoped tables

### Payments
- RevenueCat (react-native-purchases)

### Analytics
- PostHog (optional in MVP; stub interface in code)

---

## 4) Repo Layout (EXPLICIT)

```
sappy/
  apps/
    mobile/                 # Expo RN app
  packages/
    shared/                 # zod schemas, types, utilities
  supabase/
    migrations/             # SQL migrations (timestamped)
    seed/                   # seed data scripts (items, story_cards)
    functions/              # edge functions
  docs/
    SPEC.md                 # this file
```

---

## 5) Data Model (MVP) — Tables & Fields

> Codex: implement as SQL migrations + RLS policies. Use UUID PKs. Use `local_date` (date) alongside `created_at` for streaks.

Tables:
- `companions` (1:1 with user)
- `goals`, `goal_completions`
- `checkins`
- `activity_sessions`
- `quests`
- `rewards_ledger`
- `items`, `user_items`
- `bloom_runs`
- `story_cards`, `story_card_instances`
- `friends`, `support_messages` (Phase 8)

See the previous design doc for field lists; **this doc focuses on implementation steps + stubs**.

---

## 6) Critical Domain Rules

### 6.1 Reward Pipeline (single source of truth)
All rewards must flow through one module and be recorded in `rewards_ledger`.

Default mapping (tunable via config):
- checkin: +10 charge, +2 petals
- goal_complete: +8 charge, +3 petals
- activity_complete: +6 charge, +2 petals
- quest_claim: +0 charge, +10 petals
- bloom_complete: spend charge; +petals; sticker chance

### 6.2 Charge
- `companions.charge` in [0,100]
- Completing actions increments charge; Bloom spends charge (typically resets to 0)

### 6.3 Bloom
- Allowed only if charge >= threshold (e.g. 60)
- Bloom generates:
  - a `bloom_runs` row
  - a selected `story_card` and `story_card_instance`
- Choice A/B applies trait deltas server-side.

### 6.4 Currency & Purchases
- Petals balance computed from ledger or stored cached value.
- All purchases validated server-side:
  - ensure balance sufficient
  - create negative ledger entry
  - add `user_items` row

### 6.5 Quests
- 3 daily quests generated per `local_date`
- Progress updated via event hooks (client-side) + persisted in `quests.progress`
- Claim creates ledger entry (server validated)

---

## 7) UI Style System (Pastel + Calm)

### Design tokens (implement in `packages/shared/src/theme.ts`)
- `paletteId` selects:
  - background gradient (2-3 colors)
  - primary accent
  - card background
  - text primary/secondary
  - chip bg
  - companion base + aura

Component guidelines:
- Rounded corners: 16–24
- Soft shadows (low opacity)
- Minimal animations: slow pulse, gentle scale (avoid bouncy)

---

## 8) App Screens (MVP) — Explicit List

### Today Tab
- `TodayScreen`
  - ChargeMeter
  - CheckInCTA
  - GoalsList (due today)
  - QuickActionsRow (Start Breathe / Focus / Reflect)

### Care Tab
- `CareScreen` (categories + list)
- `ActivityBreatheScreen`
- `ActivityFocusScreen`
- `ActivitySoundScreen`
- `ActivityReflectScreen`
- `ActivityFirstAidScreen`

### Bloom Tab
- `BloomHomeScreen` (companion + “Bloom Now”)
- `StoryCardScreen` (choice + optional reflection)
- `BloomAlbumScreen` (list of collected story cards)
- `ShopScreen`
- `InventoryScreen`

### Friends Tab (Phase 8)
- `FriendsScreen`
- `AddFriendScreen`
- `SupportInboxScreen`
- `SendSupportScreen`

### Me Tab
- `InsightsScreen` (mood trend)
- `HistoryScreen` (calendar/list)
- `SettingsScreen`
- `SubscriptionScreen` (paywall)

---

## 9) Backend Edge Functions (MVP)

Implement in `supabase/functions/`:

### 9.1 `bloom_start`
**POST** `/bloom/start`
- Input: `{ local_date: string }`
- Validations:
  - user auth required
  - companion exists
  - charge >= threshold
- Output:
  - created `bloom_run`
  - selected `story_card_instance` (includes story card data)

### 9.2 `bloom_complete`
**POST** `/bloom/complete`
- Input: `{ bloom_run_id: string, choice: "a"|"b", reflection_text?: string }`
- Validations:
  - bloom_run belongs to user and not completed
- Effects:
  - apply trait deltas
  - spend charge
  - write rewards ledger entry
  - update bloom_run complete + petals earned + optional sticker award
- Output: updated companion + ledger delta + instance id

### 9.3 `purchase_item`
**POST** `/shop/purchase`
- Input: `{ item_id: string }`
- Validations:
  - balance sufficient
  - item exists
- Effects:
  - ledger negative petals entry
  - user_items insert
- Output: new balance + owned item

> Codex: include strict input validation and clear error codes.

---

## 10) Frontend Architecture — Modules & Services

### 10.1 Services (singletons)
- `services/supabaseClient.ts`
- `services/rewards.ts`
- `services/quests.ts`
- `services/notifications.ts`
- `services/subscription.ts`
- `services/analytics.ts`

### 10.2 Shared types/schemas
`packages/shared/src/`
- `types.ts`
- `schemas.ts` (zod)
- `theme.ts`

### 10.3 React Query keys
- `companion`
- `todaySummary`
- `goals`
- `checkins`
- `quests`
- `inventory`
- `shopItems`

---

## 11) Codex Implementation Plan (PHASED)

Each phase: implement + run tests + update docs.  
**Do not start a later phase until earlier acceptance criteria pass.**

### Phase 0 — Bootstrap (Week 1)
**Tasks**
1. Create repo layout.
2. Init Expo RN app in `apps/mobile`.
3. Setup TS strict, ESLint, Prettier.
4. Add React Navigation with 5 tabs.
5. Add NativeWind (or Tamagui) + base UI components.
6. Add Supabase client and auth scaffolding (anonymous sign-in).
7. Add Zustand store skeleton + React Query provider.

**Acceptance**
- App runs on iOS/Android simulator.
- Tabs render with placeholder screens.
- Supabase connection configured via env.

---

### Phase 1 — Supabase Schema + RLS (Week 1–2)
**Tasks**
1. Create migrations for core tables (companions, goals, checkins, sessions, quests, ledger, items, etc.).
2. Add RLS policies:
   - `select/insert/update/delete` only where `user_id = auth.uid()`.
3. Seed data:
   - base `items` set
   - base `story_cards` set

**Acceptance**
- `supabase db reset` works locally.
- RLS blocks cross-user reads/writes.
- Seed script populates items/story_cards.

---

### Phase 2 — Onboarding + Today Baseline (Week 2)
**Tasks**
1. Onboarding flow screens:
   - intention → palette → starter goals → notifications prompt
2. Create companion row and starter goals on completion.
3. Today screen v1:
   - charge meter
   - list of today goals
   - check-in CTA

**Acceptance**
- New user completes onboarding and sees Today with 3 goals.
- Companion exists with selected palette and charge=0.

---

### Phase 3 — Check-ins + Rewards (Week 3)
**Tasks**
1. Check-in modal screen with zod validation.
2. Insert `checkins` row with `local_date`.
3. Call reward pipeline: write `rewards_ledger`, increment companion charge.
4. Insights basic chart (last 14 days mood).

**Acceptance**
- Submitting check-in increases charge and petals balance.
- Insights shows mood history.

---

### Phase 4 — Goals + Completion (Week 4)
**Tasks**
1. Goal CRUD (create/edit/archive).
2. Due-today logic by schedule.
3. Goal completion inserts `goal_completions` (prevent duplicates per local_date).
4. Reward pipeline triggers on completion.

**Acceptance**
- Completing a goal increases petals and charge.
- Duplicate completion for same goal/day is prevented.

---

### Phase 5 — Care Activities (Week 5)
**Tasks**
1. Care library screen.
2. Implement:
   - Breathe timer
   - Focus timer
   - Sound playback + timer
   - Reflect prompt + save note
   - First Aid step flow
3. Save `activity_sessions`, apply rewards.

**Acceptance**
- Completing each activity records a session and grants rewards.

---

### Phase 6 — Bloom System (Week 6)
**Tasks**
1. BloomHome with “Bloom Now” gating.
2. Implement edge functions `bloom_start` and `bloom_complete`.
3. StoryCard screen:
   - show story card
   - choose option A/B
   - optional reflection text
4. Trait deltas + charge spend + reward applied server-side.

**Acceptance**
- Bloom only possible when charge >= threshold.
- Completing bloom creates instance, updates traits, spends charge, and grants petals.

---

### Phase 7 — Shop + Inventory (Week 7)
**Tasks**
1. Shop listing from `items`.
2. Purchase flow calls `purchase_item` edge function.
3. Inventory list and equip.
4. Persist equipped items to `companions.equipped_item_ids` (jsonb).

**Acceptance**
- Purchase deducts petals and grants item.
- Equip updates companion view.

---

### Phase 8 — Quests (Week 8)
**Tasks**
1. Daily quest generator on app open (client) + optional server helper.
2. Quest progress updates from app events (checkin/goal/activity/bloom).
3. Claim quest awards petals (server validated recommended).

**Acceptance**
- 3 daily quests appear.
- Progress increments on relevant actions.
- Claim grants petals and marks quest claimed.

---

### Phase 9 — Friends + Support Notes (Week 9)
**Tasks**
1. Friend code: display + add friend by code.
2. Send support note (category + optional message).
3. Inbox list with read receipts.
4. Optional push notification on receive.

**Acceptance**
- Users can add friends and exchange support notes.

---

### Phase 10 — Subscriptions + Safety + Polish (Week 10)
**Tasks**
1. RevenueCat integration with `Sappy Plus`.
2. Gating:
   - extra palettes, sticker packs, prompt decks
3. Safety:
   - crisis resources screen
   - Pause Mode toggle (simplifies UI)
4. Performance pass + QA checklist.
5. Release pipeline with EAS.

**Acceptance**
- Plus status reliably gates premium content.
- Pause Mode reduces pressure and hides quests/streak prompts.
- Build is releasable.

---

## 12) Code Stubs (Copy into files)

### 12.1 `packages/shared/src/types.ts`
```ts
export type Mood = 1 | 2 | 3 | 4 | 5;

export type ActivityType =
  | "breathe"
  | "focus"
  | "sound"
  | "reflect"
  | "first_aid";

export type RewardEvent =
  | { type: "checkin"; checkinId: string }
  | { type: "goal_complete"; goalId: string; completionId: string }
  | { type: "activity_complete"; sessionId: string; activityType: ActivityType }
  | { type: "quest_claim"; questId: string }
  | { type: "bloom_complete"; bloomRunId: string };
```

### 12.2 `apps/mobile/src/services/rewards.ts`
```ts
import { RewardEvent } from "@sappy/shared/types";

export type RewardResult = {
  chargeDelta: number;
  petalsDelta: number;
  stickerAwardItemId?: string;
};

export function computeRewards(event: RewardEvent): RewardResult {
  switch (event.type) {
    case "checkin":
      return { chargeDelta: 10, petalsDelta: 2 };
    case "goal_complete":
      return { chargeDelta: 8, petalsDelta: 3 };
    case "activity_complete":
      return { chargeDelta: 6, petalsDelta: 2 };
    case "quest_claim":
      return { chargeDelta: 0, petalsDelta: 10 };
    case "bloom_complete":
      return { chargeDelta: 0, petalsDelta: 12 }; // server may override
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}
```

### 12.3 `apps/mobile/src/services/quests.ts`
```ts
export type QuestTemplate =
  | { type: "checkin_1"; target: 1 }
  | { type: "goals_3"; target: 3 }
  | { type: "activity_1"; target: 1 };

export function generateDailyQuests(seed: string): QuestTemplate[] {
  // Deterministic-ish rotation based on date seed
  return [
    { type: "checkin_1", target: 1 },
    { type: "goals_3", target: 3 },
    { type: "activity_1", target: 1 },
  ];
}
```

---

## 13) Acceptance Test Checklist (Manual)

- [ ] Onboarding completes, creates companion + starter goals  
- [ ] Check-in increments charge + petals  
- [ ] Goal completion prevents duplicates, grants rewards  
- [ ] All Care activities record sessions and grant rewards  
- [ ] Bloom gating works; bloom creates instance, applies traits, spends charge  
- [ ] Shop purchase deducts petals and grants item  
- [ ] Inventory equip updates companion  
- [ ] Quests generate daily; progress updates; claim works  
- [ ] Friends messages send/receive (Phase 9)  
- [ ] Subscription gating works (Phase 10)  
- [ ] Pause Mode simplifies UI and removes pressure cues  

---

## 14) Codex Prompt Template (Use This When You Run Codex)

Paste this before asking Codex to implement:

> You are implementing **Sappy** from `docs/SPEC.md`.  
> Follow phases strictly. Use TypeScript, Expo React Native, Supabase with RLS, and RevenueCat.  
> Create PR-sized changes per phase. Include migrations + seeds + tests.  
> Keep the UI pastel and calm via the theming tokens.  
> Do not copy any competitor UI/microcopy; use original names from the spec.

---

## 15) Next Step

Codex: start with **Phase 0**, then **Phase 1** (schema + RLS).  
When Phase 1 is complete, ensure `supabase db reset` succeeds and RLS blocks cross-user access.
