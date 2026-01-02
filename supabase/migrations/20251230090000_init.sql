create extension if not exists "pgcrypto";

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  description text,
  category text not null,
  price_petals integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint items_price_nonnegative check (price_petals >= 0)
);

create table if not exists public.story_cards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  choice_a_text text not null,
  choice_b_text text not null,
  choice_a_trait_deltas jsonb not null default '{}'::jsonb,
  choice_b_trait_deltas jsonb not null default '{}'::jsonb,
  rarity text not null default 'common',
  created_at timestamptz not null default now()
);

create table if not exists public.companions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  palette_id text not null default 'sky',
  charge integer not null default 0,
  petals_balance integer not null default 0,
  traits jsonb not null default '{}'::jsonb,
  equipped_item_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companions_charge_range check (charge >= 0 and charge <= 100),
  constraint companions_user_unique unique (user_id)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  details text,
  schedule jsonb not null default '{}'::jsonb,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goal_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  local_date date not null,
  created_at timestamptz not null default now(),
  constraint goal_completions_unique unique (user_id, goal_id, local_date)
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  mood smallint not null,
  note text,
  created_at timestamptz not null default now(),
  constraint checkins_mood_range check (mood >= 1 and mood <= 5)
);

create table if not exists public.activity_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null,
  local_date date not null,
  duration_seconds integer,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint activity_sessions_type check (activity_type in ('breathe', 'focus', 'sound', 'reflect', 'first_aid'))
);

create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  quest_type text not null,
  target integer not null,
  progress integer not null default 0,
  reward_petals integer not null default 0,
  is_claimed boolean not null default false,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint quests_progress_nonnegative check (progress >= 0),
  constraint quests_target_positive check (target > 0),
  constraint quests_unique unique (user_id, local_date, quest_type)
);

create table if not exists public.rewards_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  source_type text,
  source_id uuid,
  charge_delta integer not null default 0,
  petals_delta integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.bloom_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  is_completed boolean not null default false,
  choice text,
  story_card_id uuid references public.story_cards(id),
  petals_awarded integer not null default 0,
  sticker_item_id uuid references public.items(id),
  created_at timestamptz not null default now(),
  constraint bloom_choice check (choice in ('a', 'b'))
);

create table if not exists public.story_card_instances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  story_card_id uuid not null references public.story_cards(id) on delete cascade,
  bloom_run_id uuid references public.bloom_runs(id) on delete set null,
  choice text,
  reflection_text text,
  created_at timestamptz not null default now(),
  constraint story_card_instances_choice check (choice in ('a', 'b'))
);

create table if not exists public.user_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  acquired_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint user_items_unique unique (user_id, item_id)
);

create index if not exists goals_user_id_idx on public.goals (user_id);
create index if not exists goal_completions_user_date_idx on public.goal_completions (user_id, local_date);
create index if not exists checkins_user_date_idx on public.checkins (user_id, local_date);
create index if not exists activity_sessions_user_date_idx on public.activity_sessions (user_id, local_date);
create index if not exists quests_user_date_idx on public.quests (user_id, local_date);
create index if not exists rewards_ledger_user_created_idx on public.rewards_ledger (user_id, created_at desc);
create index if not exists user_items_user_id_idx on public.user_items (user_id);
create index if not exists bloom_runs_user_date_idx on public.bloom_runs (user_id, local_date);
create index if not exists story_card_instances_user_id_idx on public.story_card_instances (user_id);

alter table public.items enable row level security;
alter table public.story_cards enable row level security;
alter table public.companions enable row level security;
alter table public.goals enable row level security;
alter table public.goal_completions enable row level security;
alter table public.checkins enable row level security;
alter table public.activity_sessions enable row level security;
alter table public.quests enable row level security;
alter table public.rewards_ledger enable row level security;
alter table public.bloom_runs enable row level security;
alter table public.story_card_instances enable row level security;
alter table public.user_items enable row level security;

create policy "Items are readable by authenticated users" on public.items
  for select using (auth.role() = 'authenticated');

create policy "Story cards are readable by authenticated users" on public.story_cards
  for select using (auth.role() = 'authenticated');

create policy "Users can manage own companions" on public.companions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own goals" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own goal completions" on public.goal_completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own checkins" on public.checkins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own activity sessions" on public.activity_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own quests" on public.quests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own rewards ledger" on public.rewards_ledger
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own bloom runs" on public.bloom_runs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own story card instances" on public.story_card_instances
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own items" on public.user_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
