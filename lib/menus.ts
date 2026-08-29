import { randomUUID } from "node:crypto";
import { asString, db } from "./db";

export type Menu = {
  id: string;
  name: string;
};

function mapMenu(row: Record<string, unknown>): Menu {
  return {
    id: asString(row.id),
    name: asString(row.name),
  };
}

export async function getMenus() {
  const result = await db.execute(
    "SELECT id, name FROM menus ORDER BY created_at, name COLLATE NOCASE",
  );

  return result.rows.map((row) => mapMenu(row as Record<string, unknown>));
}

export async function getMenu(id: string) {
  const result = await db.execute({
    sql: "SELECT id, name FROM menus WHERE id = ?",
    args: [id],
  });

  const row = result.rows[0];
  return row ? mapMenu(row as Record<string, unknown>) : undefined;
}

export async function createMenu(name: string) {
  const menu = {
    id: randomUUID(),
    name: name.trim(),
  };

  await db.execute({
    sql: "INSERT INTO menus (id, name) VALUES (?, ?)",
    args: [menu.id, menu.name],
  });

  return menu;
}

export async function deleteMenu(id: string) {
  const menuCount = await db.execute("SELECT COUNT(*) AS count FROM menus");
  if (Number(menuCount.rows[0]?.count ?? 0) <= 1) {
    throw new Error("No se puede eliminar el unico menu.");
  }

  await db.execute({
    sql: "DELETE FROM menus WHERE id = ?",
    args: [id],
  });
}
