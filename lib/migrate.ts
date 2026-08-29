import { randomUUID } from "node:crypto";
import { asNumber, asString, db } from "./db";

const DEFAULT_MENU_NAME = "Mi menú";

async function tableHasColumn(table: string, column: string) {
  const result = await db.execute(`PRAGMA table_info(${table})`);
  return result.rows.some((row) => asString(row.name) === column);
}

async function tableExists(table: string) {
  const result = await db.execute({
    sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
    args: [table],
  });
  return result.rows.length > 0;
}

async function createDefaultMenu() {
  const menuId = randomUUID();
  await db.execute({
    sql: "INSERT INTO menus (id, name) VALUES (?, ?)",
    args: [menuId, DEFAULT_MENU_NAME],
  });
  return menuId;
}

export async function migrateToMultiMenu() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS menus (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const mealsExist = await tableExists("meals");
  if (!mealsExist) {
    return;
  }

  const mealsHaveMenuId = await tableHasColumn("meals", "menu_id");
  if (mealsHaveMenuId) {
    return;
  }

  await db.execute(
    "ALTER TABLE meals ADD COLUMN menu_id TEXT REFERENCES menus(id) ON DELETE CASCADE",
  );

  const menuCount = await db.execute("SELECT COUNT(*) AS count FROM menus");
  let defaultMenuId: string;

  if (asNumber(menuCount.rows[0]?.count) === 0) {
    defaultMenuId = await createDefaultMenu();
  } else {
    const firstMenu = await db.execute(
      "SELECT id FROM menus ORDER BY created_at LIMIT 1",
    );
    defaultMenuId = asString(firstMenu.rows[0]?.id);
  }

  await db.execute({
    sql: "UPDATE meals SET menu_id = ? WHERE menu_id IS NULL",
    args: [defaultMenuId],
  });
}

export async function migrateSharedRecipes() {
  if (!(await tableExists("recipes"))) {
    return;
  }

  if (!(await tableHasColumn("recipes", "menu_id"))) {
    return;
  }

  await db.execute("PRAGMA foreign_keys = OFF");

  await db.batch(
    [
      {
        sql: `
          CREATE TABLE recipes_shared (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            notes TEXT NOT NULL DEFAULT '',
            deleted_at TEXT,
            rating INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `,
      },
      {
        sql: `
          INSERT INTO recipes_shared (id, title, description, notes, deleted_at, rating, created_at)
          SELECT id, title, description, notes, deleted_at, rating, created_at
          FROM recipes
        `,
      },
      { sql: "DROP TABLE recipes" },
      { sql: "ALTER TABLE recipes_shared RENAME TO recipes" },
    ],
    "write",
  );

  await db.execute("PRAGMA foreign_keys = ON");
}

export async function migrateUsers() {
  if (!(await tableExists("users"))) {
    await db.execute(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        google_sub TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        name TEXT NOT NULL DEFAULT '',
        image TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_login_at TEXT
      )
    `);
    return;
  }

  const hasGoogleSub = await tableHasColumn("users", "google_sub");
  if (hasGoogleSub) {
    return;
  }

  await db.execute("DROP TABLE users");
  await db.execute(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      google_sub TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      image TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login_at TEXT
    )
  `);
}
