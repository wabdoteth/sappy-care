export const schemaStatements = [
  `create table if not exists companions (
    id text primary key not null,
    palette_id text not null,
    charge integer not null default 0,
    petals_balance integer not null default 0,
    traits text not null default '{}',
    equipped_item_ids text not null default '[]',
    created_at text not null,
    updated_at text not null,
    constraint companions_charge_range check (charge >= 0 and charge <= 100)
  );`,
  `create table if not exists goals (
    id text primary key not null,
    title text not null,
    details text,
    schedule text not null default '{}',
    is_archived integer not null default 0,
    created_at text not null,
    updated_at text not null,
    constraint goals_archived_bool check (is_archived in (0, 1))
  );`,
  `create table if not exists goal_completions (
    id text primary key not null,
    goal_id text not null references goals(id) on delete cascade,
    local_date text not null,
    created_at text not null,
    constraint goal_completions_unique unique (goal_id, local_date)
  );`,
  `create table if not exists checkins (
    id text primary key not null,
    local_date text not null,
    mood integer not null,
    note text,
    created_at text not null,
    constraint checkins_mood_range check (mood >= 1 and mood <= 5)
  );`,
  `create table if not exists activity_sessions (
    id text primary key not null,
    activity_type text not null,
    local_date text not null,
    duration_seconds integer,
    note text,
    metadata text not null default '{}',
    created_at text not null,
    constraint activity_sessions_type check (activity_type in ('breathe', 'focus', 'sound', 'reflect', 'first_aid'))
  );`,
  `create table if not exists quests (
    id text primary key not null,
    local_date text not null,
    quest_type text not null,
    target integer not null,
    progress integer not null default 0,
    reward_petals integer not null default 0,
    is_claimed integer not null default 0,
    claimed_at text,
    created_at text not null,
    constraint quests_progress_nonnegative check (progress >= 0),
    constraint quests_target_positive check (target > 0),
    constraint quests_claimed_bool check (is_claimed in (0, 1)),
    constraint quests_unique unique (local_date, quest_type)
  );`,
  `create table if not exists rewards_ledger (
    id text primary key not null,
    event_type text not null,
    source_type text,
    source_id text,
    charge_delta integer not null default 0,
    petals_delta integer not null default 0,
    created_at text not null
  );`,
  `create table if not exists items (
    id text primary key not null,
    sku text not null unique,
    name text not null,
    description text,
    category text not null,
    price_petals integer not null default 0,
    metadata text not null default '{}',
    created_at text not null,
    constraint items_price_nonnegative check (price_petals >= 0)
  );`,
  `create table if not exists user_items (
    id text primary key not null,
    item_id text not null references items(id) on delete cascade,
    acquired_at text not null,
    metadata text not null default '{}',
    constraint user_items_unique unique (item_id)
  );`,
  `create table if not exists story_cards (
    id text primary key not null,
    title text not null,
    body text not null,
    choice_a_text text not null,
    choice_b_text text not null,
    choice_a_trait_deltas text not null default '{}',
    choice_b_trait_deltas text not null default '{}',
    rarity text not null default 'common',
    created_at text not null
  );`,
  `create table if not exists bloom_runs (
    id text primary key not null,
    local_date text not null,
    started_at text not null,
    completed_at text,
    is_completed integer not null default 0,
    choice text,
    story_card_id text references story_cards(id),
    petals_awarded integer not null default 0,
    sticker_item_id text references items(id),
    created_at text not null,
    constraint bloom_choice check (choice in ('a', 'b') or choice is null),
    constraint bloom_completed_bool check (is_completed in (0, 1))
  );`,
  `create table if not exists story_card_instances (
    id text primary key not null,
    story_card_id text not null references story_cards(id) on delete cascade,
    bloom_run_id text references bloom_runs(id) on delete set null,
    choice text,
    reflection_text text,
    created_at text not null,
    constraint story_card_instances_choice check (choice in ('a', 'b') or choice is null)
  );`,
  `create table if not exists friends (
    id text primary key not null,
    friend_code text not null unique,
    display_name text not null,
    created_at text not null
  );`,
  `create table if not exists support_notes (
    id text primary key not null,
    friend_id text references friends(id) on delete set null,
    direction text not null,
    message text not null,
    created_at text not null,
    constraint support_notes_direction check (direction in ('incoming', 'outgoing'))
  );`,
  `create index if not exists goals_created_at_idx on goals (created_at);`,
  `create index if not exists checkins_local_date_idx on checkins (local_date);`,
  `create index if not exists activity_sessions_local_date_idx on activity_sessions (local_date);`,
  `create index if not exists quests_local_date_idx on quests (local_date);`,
  `create index if not exists rewards_ledger_created_at_idx on rewards_ledger (created_at);`,
  `create index if not exists items_sku_idx on items (sku);`,
  `create index if not exists story_cards_rarity_idx on story_cards (rarity);`,
  `create index if not exists friends_created_at_idx on friends (created_at);`,
  `create index if not exists support_notes_created_at_idx on support_notes (created_at);`,
];
