import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import { Platform } from "react-native";

import { schemaStatements } from "./schema";
import { seedItems, seedStoryCards } from "./seed";
import { nowIso, toJson } from "./utils";

type SqlValue = string | number | null;

type GlobalDbState = {
  dbPromise: Promise<SQLiteDatabase> | null;
  initPromise: Promise<void> | null;
  dbName?: string;
  hasCloseHandler?: boolean;
};

const globalState = globalThis as typeof globalThis & {
  __sappyDbState?: GlobalDbState;
};

const state =
  globalState.__sappyDbState ??
  (globalState.__sappyDbState = { dbPromise: null, initPromise: null });

const BASE_DB_NAME = "sappy.db";
const WEB_DB_KEY = "sappy-web-db-name";
const TARGET_SCHEMA_VERSION = 2;

function generateWebDbName() {
  const unique =
    globalThis.crypto && "randomUUID" in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  return `sappy-web-${unique}.db`;
}

function getWebStorage() {
  const storageRef = globalThis as typeof globalThis & {
    sessionStorage?: Storage;
  };
  return storageRef.sessionStorage;
}

function getStoredWebDbName() {
  const storage = getWebStorage();
  if (!storage) {
    return null;
  }
  try {
    return storage.getItem(WEB_DB_KEY);
  } catch {
    return null;
  }
}

function setStoredWebDbName(name: string) {
  const storage = getWebStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(WEB_DB_KEY, name);
  } catch {
    // Ignore storage errors.
  }
}

function resolveDatabaseName() {
  if (state.dbName) {
    return state.dbName;
  }
  if (Platform.OS !== "web") {
    state.dbName = BASE_DB_NAME;
    return state.dbName;
  }

  const stored = getStoredWebDbName();
  if (stored) {
    state.dbName = stored;
    return stored;
  }

  const name = generateWebDbName();
  state.dbName = name;
  setStoredWebDbName(name);
  return name;
}

function isAccessHandleError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }
  const message =
    "message" in error ? String((error as { message?: unknown }).message) : "";
  return (
    message.includes("createSyncAccessHandle") ||
    message.includes("NoModificationAllowedError")
  );
}

function registerWebCloseHandler() {
  if (Platform.OS !== "web" || state.hasCloseHandler) {
    return;
  }
  state.hasCloseHandler = true;
  if (typeof window === "undefined") {
    return;
  }
  const closeDb = () => {
    const current = state.dbPromise;
    state.dbPromise = null;
    state.initPromise = null;
    current?.then((db) => db.closeAsync()).catch(() => {});
  };
  window.addEventListener("pagehide", closeDb);
  window.addEventListener("beforeunload", closeDb);
}

async function openDatabaseWithFallback() {
  const name = resolveDatabaseName();
  try {
    return await openDatabaseAsync(name);
  } catch (error) {
    if (Platform.OS === "web" && isAccessHandleError(error)) {
      const fallbackName = generateWebDbName();
      state.dbName = fallbackName;
      setStoredWebDbName(fallbackName);
      return openDatabaseAsync(fallbackName);
    }
    throw error;
  }
}

async function getDb() {
  if (!state.dbPromise) {
    registerWebCloseHandler();
    state.dbPromise = openDatabaseWithFallback().catch((error) => {
      state.dbPromise = null;
      throw error;
    });
  }
  return state.dbPromise;
}

async function execRaw(sql: string) {
  const db = await getDb();
  return db.execAsync(sql);
}

async function runRaw(sql: string, params: SqlValue[] = []) {
  const db = await getDb();
  return db.runAsync(sql, ...params);
}

async function getFirstRaw<T>(sql: string, params: SqlValue[] = []) {
  const db = await getDb();
  return db.getFirstAsync<T>(sql, ...params);
}

async function seedIfEmpty() {
  const itemCountRow = await getFirstRaw<{ count: number }>(
    "select count(*) as count from items"
  );
  const itemCount = itemCountRow?.count ?? 0;

  if (itemCount === 0) {
    for (const item of seedItems) {
      await runRaw(
        `insert into items (id, sku, name, description, category, price_petals, metadata, created_at)
         values (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.sku,
          item.name,
          item.description ?? null,
          item.category,
          item.pricePetals,
          toJson(item.metadata),
          nowIso(),
        ]
      );
    }
  } else {
    for (const item of seedItems) {
      const existing = await getFirstRaw<{ count: number }>(
        "select count(*) as count from items where sku = ?",
        [item.sku]
      );
      if ((existing?.count ?? 0) > 0) {
        continue;
      }
      await runRaw(
        `insert into items (id, sku, name, description, category, price_petals, metadata, created_at)
         values (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.sku,
          item.name,
          item.description ?? null,
          item.category,
          item.pricePetals,
          toJson(item.metadata),
          nowIso(),
        ]
      );
    }
  }

  const cardCountRow = await getFirstRaw<{ count: number }>(
    "select count(*) as count from story_cards"
  );
  const cardCount = cardCountRow?.count ?? 0;

  if (cardCount === 0) {
    for (const card of seedStoryCards) {
      await runRaw(
        `insert into story_cards
         (id, title, body, choice_a_text, choice_b_text, choice_a_trait_deltas, choice_b_trait_deltas, rarity, created_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          card.id,
          card.title,
          card.body,
          card.choiceAText,
          card.choiceBText,
          toJson(card.choiceATraitDeltas),
          toJson(card.choiceBTraitDeltas),
          card.rarity,
          nowIso(),
        ]
      );
    }
  } else {
    for (const card of seedStoryCards) {
      const existing = await getFirstRaw<{ count: number }>(
        "select count(*) as count from story_cards where id = ?",
        [card.id]
      );
      if ((existing?.count ?? 0) > 0) {
        continue;
      }
      await runRaw(
        `insert into story_cards
         (id, title, body, choice_a_text, choice_b_text, choice_a_trait_deltas, choice_b_trait_deltas, rarity, created_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          card.id,
          card.title,
          card.body,
          card.choiceAText,
          card.choiceBText,
          toJson(card.choiceATraitDeltas),
          toJson(card.choiceBTraitDeltas),
          card.rarity,
          nowIso(),
        ]
      );
    }
  }
}

export async function ensureLocalDb() {
  if (!state.initPromise) {
    state.initPromise = (async () => {
      await execRaw("PRAGMA foreign_keys = ON;");
      await execRaw(
        "create table if not exists meta (key text primary key not null, value text not null)"
      );

      const versionRow = await getFirstRaw<{ value: string }>(
        "select value from meta where key = ?",
        ["schema_version"]
      );
      let version = versionRow ? Number(versionRow.value) : 0;

      if (version < 1) {
        for (const statement of schemaStatements) {
          await execRaw(statement);
        }
        await runRaw(
          "insert into meta (key, value) values (?, ?) on conflict(key) do update set value = excluded.value",
          ["schema_version", String(TARGET_SCHEMA_VERSION)]
        );
        version = TARGET_SCHEMA_VERSION;
      }

      if (version < TARGET_SCHEMA_VERSION) {
        for (const statement of schemaStatements) {
          await execRaw(statement);
        }
        await runRaw(
          "insert into meta (key, value) values (?, ?) on conflict(key) do update set value = excluded.value",
          ["schema_version", String(TARGET_SCHEMA_VERSION)]
        );
        version = TARGET_SCHEMA_VERSION;
      }

      await seedIfEmpty();
    })().catch((error) => {
      state.initPromise = null;
      throw error;
    });
  }

  return state.initPromise;
}

export async function executeSql(sql: string, params: SqlValue[] = []) {
  await ensureLocalDb();
  return runRaw(sql, params);
}

export async function getAll<T>(sql: string, params: SqlValue[] = []) {
  await ensureLocalDb();
  const db = await getDb();
  return db.getAllAsync<T>(sql, ...params);
}

export async function getFirst<T>(sql: string, params: SqlValue[] = []) {
  await ensureLocalDb();
  const db = await getDb();
  return db.getFirstAsync<T>(sql, ...params);
}

export async function clearLocalData() {
  await ensureLocalDb();

  const tables = [
    "companions",
    "goals",
    "goal_completions",
    "checkins",
    "activity_sessions",
    "quests",
    "rewards_ledger",
    "user_items",
    "bloom_runs",
    "story_card_instances",
    "friends",
    "support_notes",
  ];

  for (const table of tables) {
    await runRaw(`delete from ${table}`);
  }

  await runRaw("delete from meta where key = ?", ["pause_mode"]);
  await runRaw("delete from meta where key = ?", ["friend_code"]);
  await seedIfEmpty();
}
