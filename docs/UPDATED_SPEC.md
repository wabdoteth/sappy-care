# Sappy — Codex-Optimized Spec (Frontend-First, Backend Last)

This version is structured so **Codex builds the full React Native app first** using a local/mock data layer, and **adds Supabase backend + server validation near the end**.  
Target: **React Native (Expo) + TypeScript** initially; backend integration later with **Supabase + RLS + Edge Functions + RevenueCat**.

---

## 0) Codex Operating Instructions (READ FIRST)

### Primary goals
1. Build an MVP that runs end-to-end **offline/local first** with deterministic behavior.
2. Keep architecture clean so swapping data layer to Supabase is straightforward.
3. Only add backend/server after UX flows are stable.

### Hard constraints
- Language: **TypeScript** everywhere.
- Frontend: **Expo React Native** (no native modules unless necessary).
- Data layer must be abstracted behind interfaces so it can switch from `LocalRepo` → `SupabaseRepo`.
- When backend is added, all purchases/bloom completion/currency logic becomes **server-validated**.

### Deliverable style
- Work in **phases** (PR-sized).
- Each phase includes:
  - code + docs updates
  - tests for core logic (reward/quest/schedule)
- Feature flags: `USE_BACKEND=false` by default until Phase 9.

---

## 1) Product Summary

**Sappy** is a pastel self-care companion app. Users complete tiny actions (check-ins, goals, calming activities) to fill a **Charge meter**, then trigger a **Bloom** moment that yields a **Story Card**, traits, and rewards (**Petals** currency + occasional **Stickers**). Users spend Petals in a shop for customization and unlockable **Palettes** (themes).

---

## 2) UX & IA (Distinct)

Bottom tabs (MVP):
- **Today**: charge meter, check-in CTA, goals list, quick actions
- **Care**: activity library (Breathe, Focus, Sound, Reflect, First Aid)
- **Bloom**: companion home + story album + shop entry
- **Friends**: friend codes + support notes (later)
- **Me**: insights, history, settings, subscriptions (later)

Tone: warm, brief, non-clinical. Avoid shame language.

---

## 3) Tech Stack (Pinned Decisions)

### Frontend (Phase 0–8)
- Expo SDK (current stable)
- react-navigation (tabs + stacks)
- Zustand (local app state)
- React Query (optional; can still use with local repos)
- react-hook-form + zod
- NativeWind (default) or Tamagui
- expo-notifications (later)
- expo-av (soundscapes)

### Backend (Phase 9–10)
- Supabase (Postgres, Auth, Storage, Edge Functions)
- RLS on all user-scoped tables
- RevenueCat for subscriptions

---

## 4) Repo Layout (EXPLICIT)

```
sappy/
  apps/
    mobile/                      # Expo RN app
  packages/
    shared/                      # types, zod schemas, theme tokens
  docs/
    UPDATED_SPEC.md              # this file
  supabase/                      # created in Phase 9
    migrations/
    seed/
    functions/
```

---

## 5) Architecture: Data Layer Abstraction (KEY)

Everything that touches persistence goes through **repositories** so we can build UI first.

### 5.1 Interfaces (packages/shared)
- `IUserRepo`
- `ICompanionRepo`
- `IGoalsRepo`
- `ICheckinRepo`
- `IActivityRepo`
- `IQuestsRepo`
- `IRewardsRepo`
- `IShopRepo`
- `IFriendsRepo` (later)

### 5.2 Implementations
- `LocalRepo/*` (Phase 1–8): uses **SQLite** (expo-sqlite) or **MMKV/AsyncStorage** (choose SQLite recommended)
- `SupabaseRepo/*` (Phase 9–10)

> Codex: implement a `RepoProvider` that selects `LocalRepo` vs `SupabaseRepo` via `USE_BACKEND`.

---

## 6) Critical Domain Rules (Same Logic Now, Server Later)

### 6.1 Reward Pipeline (single source of truth)
All rewards flow through `computeRewards(event)` and are recorded in a **ledger**.

Default mapping:
- checkin: +10 charge, +2 petals
- goal_complete: +8 charge, +3 petals
- activity_complete: +6 charge, +2 petals
- quest_claim: +0 charge, +10 petals
- bloom_complete: spend charge; +petals; sticker chance

### 6.2 Charge
- Charge in [0,100]
- Bloom requires charge >= threshold (e.g. 60)
- Bloom spends charge (reset to 0 in local; later server-validated)

### 6.3 Quests
- 3 daily quests generated per `local_date`
- Progress updates via event hooks and persisted
- Claim grants petals

### 6.4 Purchases
- Local mode: compute balance from ledger, allow purchase, record negative ledger + owned item
- Backend mode: server validation

---

## 7) UI Style System (Pastel + Calm)

Implement tokens in `packages/shared/src/theme.ts`:
- palettes: background gradients, accent, card bg, text, chips, companion base/aura
- rounded corners: 16–24
- gentle motion only

---

## 8) App Screens (MVP) — Explicit List

### Today
- `TodayScreen` (ChargeMeter, CheckInCTA, GoalsList, QuickActionsRow)

### Care
- `CareScreen`
- `ActivityBreatheScreen`
- `ActivityFocusScreen`
- `ActivitySoundScreen`
- `ActivityReflectScreen`
- `ActivityFirstAidScreen`

### Bloom
- `BloomHomeScreen`
- `StoryCardScreen`
- `BloomAlbumScreen`
- `ShopScreen`
- `InventoryScreen`

### Me
- `InsightsScreen`
- `HistoryScreen`
- `SettingsScreen`

### Friends (later)
- `FriendsScreen`
- `AddFriendScreen`
- `SupportInboxScreen`
- `SendSupportScreen`

---

## 9) Frontend-First Implementation Plan (PHASED)

### Phase 0 — Bootstrap UI Shell (Week 1)
**Tasks**
1. Init Expo RN app in `apps/mobile` with TypeScript.
2. Setup TS strict, ESLint/Prettier.
3. Navigation: Tabs + stacks.
4. Design system: Button/Card/Text/Chip/Modal/Slider.
5. Theme tokens + palette switching (local only).

**Acceptance**
- App runs and shows tabs with themed placeholder screens.
- Palette switch updates UI globally.

---

### Phase 1 — Local Database + Repos (Week 1–2)
**Tasks**
1. Choose local storage:
   - Preferred: `expo-sqlite` with a light wrapper.
2. Create local schema tables:
   - companions, goals, goal_completions, checkins, activity_sessions, quests, rewards_ledger, items, user_items, story_cards, story_card_instances
3. Implement `LocalRepo/*` to CRUD these entities.
4. Seed local DB with:
   - items (shop)
   - story_cards (deck)

**Acceptance**
- App boots, initializes local DB, and seeds if empty.
- Repos can create/read/update companion and goals.

---

### Phase 2 — Onboarding + Today Baseline (Week 2)
**Tasks**
1. Onboarding flow:
   - intention → palette → starter goals → finish
2. On completion:
   - create companion
   - create 3 starter goals
   - generate daily quests for today
3. Today screen:
   - charge meter
   - goals due today
   - check-in CTA

**Acceptance**
- Fresh install → onboarding → Today with 3 goals and charge=0.

---

### Phase 3 — Check-ins + Insights (Week 3)
**Tasks**
1. Check-in modal (mood slider 1–5, tags, note).
2. Save checkin with `local_date`.
3. Apply rewards:
   - ledger entry (+petals)
   - companion charge increment
4. Insights:
   - mood trend (last 14 local days)
   - simple history list

**Acceptance**
- Check-in updates charge/petals immediately.
- Insights reflects entries.

---

### Phase 4 — Goals + Completion (Week 4)
**Tasks**
1. Goal CRUD (create/edit/archive).
2. Due-today logic (schedule).
3. Goal completion:
   - insert completion (dedupe by goal_id + local_date)
   - apply rewards (+charge +petals)

**Acceptance**
- Completing a goal increases charge and petals.
- Duplicate completion prevented.

---

### Phase 5 — Care Activities (Week 5)
**Tasks**
1. Care library UI.
2. Implement each activity:
   - Breathe timer
   - Focus timer
   - Sound playback + timer
   - Reflect prompts + save text (store as a `reflection` record or reuse `activity_sessions.note`)
   - First Aid step flow
3. Save sessions + apply rewards.

**Acceptance**
- Completing each activity records a session and rewards.

---

### Phase 6 — Bloom (Local Mode) (Week 6)
**Tasks**
1. BloomHome:
   - show companion + charge
   - enable “Bloom Now” only when charge >= threshold
2. Bloom start:
   - create `bloom_run`
   - select story card (local deterministic random based on date seed)
   - create `story_card_instance`
3. StoryCard screen:
   - choose A/B
   - optional reflection
4. Apply effects locally:
   - trait deltas
   - spend charge (reset to 0)
   - ledger reward (+petals, sticker chance)
   - mark bloom_run completed

**Acceptance**
- Bloom works end-to-end offline with consistent behavior.
- Story cards saved to album.

---

### Phase 7 — Shop + Inventory (Local Mode) (Week 7)
**Tasks**
1. Shop listing from `items`.
2. Purchase:
   - compute balance from ledger
   - if sufficient, create negative ledger entry, add `user_items`
3. Inventory:
   - equip/unequip items
4. Companion view reflects equipped items.

**Acceptance**
- Purchases persist and balance changes correctly.
- Equip persists and updates companion.

---

### Phase 8 — Quests + Settings + Polish (Local Mode) (Week 8)
**Tasks**
1. Daily quest generation on app open (if missing for local_date).
2. Progress updates via event hooks (checkin, goal, activity, bloom).
3. Claim quest:
   - mark claimed
   - ledger reward
4. Settings:
   - export data (JSON)
   - delete/reset local data
   - Pause Mode toggle (local)
5. UI polish + accessibility pass.

**Acceptance**
- Quests appear daily, progress updates, claim works.
- Export/reset works.
- Pause Mode reduces pressure cues.

---

## 10) Backend/Server Integration (END)

### Phase 9 — Supabase Setup + Migration from Local (Week 9)
**Tasks**
1. Create `supabase/` folder with migrations that mirror local schema.
2. Enable Supabase Auth (anonymous + optional email/phone later).
3. Apply RLS policies for all user-scoped tables.
4. Implement `SupabaseRepo/*` that conforms to the same interfaces as `LocalRepo/*`.
5. Build a **migration flow**:
   - export local data to JSON
   - import into Supabase on first sign-in (one-time)
6. Add `USE_BACKEND` toggle:
   - when enabled, app uses Supabase repos and syncs state.

**Acceptance**
- A user can opt into backend mode and see their local data in Supabase.
- RLS prevents cross-user access.

---

### Phase 10 — Edge Functions + Server Validation + Subscriptions (Week 10)
**Tasks**
1. Implement Edge Functions:
   - `POST /bloom/start`
   - `POST /bloom/complete`
   - `POST /shop/purchase`
   - (optional) `POST /quests/claim`
2. Update app flows to call functions when `USE_BACKEND=true`.
3. Add RevenueCat subscriptions:
   - store `plus_status` in user profile table
   - gate premium palettes/packs
4. Notifications (optional):
   - scheduled reminders for goals/check-ins (client)
5. Hardening:
   - handle offline with queued writes (optional)
   - reconcile local cache with server

**Acceptance**
- Bloom, purchases, quest claims are validated server-side.
- Plus gating works.
- App still works in local mode when backend disabled.

---

## 11) Code Stubs (Copy into files)

### 11.1 `packages/shared/src/types.ts`
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

### 11.2 `apps/mobile/src/data/RepoProvider.tsx`
```ts
import React, { createContext, useContext, useMemo } from "react";
import { createLocalRepos } from "./local/createLocalRepos";
import { createSupabaseRepos } from "./supabase/createSupabaseRepos";

const RepoContext = createContext<any>(null);

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const useBackend = process.env.EXPO_PUBLIC_USE_BACKEND === "true";
  const repos = useMemo(
    () => (useBackend ? createSupabaseRepos() : createLocalRepos()),
    [useBackend]
  );
  return <RepoContext.Provider value={repos}>{children}</RepoContext.Provider>;
}

export function useRepos<T = any>(): T {
  return useContext(RepoContext);
}
```

### 11.3 `apps/mobile/src/services/rewards.ts`
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
      return { chargeDelta: 0, petalsDelta: 12 };
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}
```

---

## 12) Acceptance Test Checklist (Manual)

Local mode:
- [ ] Onboarding completes, creates companion + starter goals
- [ ] Check-in increments charge + petals
- [ ] Goal completion prevents duplicates, grants rewards
- [ ] Activities record sessions and grant rewards
- [ ] Bloom gating works; bloom applies traits and spends charge
- [ ] Shop purchase deducts petals and grants item
- [ ] Inventory equip updates companion
- [ ] Quests generate daily; progress updates; claim works
- [ ] Export/reset works
- [ ] Pause Mode reduces pressure cues

Backend mode (Phase 9–10):
- [ ] Local → Supabase migration imports data correctly
- [ ] RLS blocks cross-user access
- [ ] Bloom/purchase validated server-side
- [ ] Plus gating works

---

## 13) Codex Prompt Template

> Implement Sappy from `docs/UPDATED_SPEC.md` using a **frontend-first approach**.  
> Build all features using `LocalRepo` first (SQLite).  
> Only in Phase 9–10 add Supabase migrations, RLS, Edge Functions, and RevenueCat, and swap repos via `USE_BACKEND`.  
> Keep UI pastel and calm with theme tokens.  
> Use original naming and flows from the spec.

---

## 14) Next Step

Codex: start with **Phase 0**, then **Phase 1 (Local DB + Repos)**.  
Do not begin Supabase work until Phase 9.
