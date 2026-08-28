import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const databasePath = process.env.DATABASE_PATH
  ? resolve(process.env.DATABASE_PATH)
  : join(process.cwd(), "data", "menu.db");

mkdirSync(dirname(databasePath), { recursive: true });

const globalForDatabase = globalThis as typeof globalThis & {
  database?: Database.Database;
};

let isNewInstance = false;
let dbInstance = globalForDatabase.database;

if (!dbInstance) {
  // 1. Add timeout: 5000 to prevent SQLITE_BUSY errors during concurrent Server Actions
  dbInstance = new Database(databasePath, { timeout: 5000 });
  isNewInstance = true;

  if (process.env.NODE_ENV !== "production") {
    globalForDatabase.database = dbInstance;
  }
}

export const db = dbInstance;

// 2. Wrap all PRAGMAs and Schema migrations inside the isNewInstance block.
// This prevents redundant schema scans and ALTER table checks on every Next.js hot-reload.
if (isNewInstance) {
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      deleted_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      meal_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS meal_recipes (
      meal_id TEXT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
      recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      PRIMARY KEY (meal_id, recipe_id)
    );
  `);

  // Run dynamic migration checks only once
  const mealColumns = db
    .prepare<[], { name: string }>("PRAGMA table_info(meals)")
    .all();

  if (!mealColumns.some((column) => column.name === "rating")) {
    db.exec("ALTER TABLE meals ADD COLUMN rating INTEGER NOT NULL DEFAULT 0");
  }

  if (!mealColumns.some((column) => column.name === "effects")) {
    db.exec("ALTER TABLE meals ADD COLUMN effects TEXT NOT NULL DEFAULT ''");
  }

  const recipeColumns = db
    .prepare<[], { name: string }>("PRAGMA table_info(recipes)")
    .all();

  if (!recipeColumns.some((column) => column.name === "deleted_at")) {
    db.exec("ALTER TABLE recipes ADD COLUMN deleted_at TEXT");
  }
}
