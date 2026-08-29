import { randomUUID } from "node:crypto";
import { asNumber, asString, db } from "./db";

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

export async function getMenusForHousehold(householdId: string) {
  const result = await db.execute({
    sql: `
      SELECT id, name
      FROM menus
      WHERE household_id = ?
      ORDER BY created_at, name COLLATE NOCASE
    `,
    args: [householdId],
  });

  return result.rows.map((row) => mapMenu(row as Record<string, unknown>));
}

export async function getMenu(id: string, householdId: string) {
  const result = await db.execute({
    sql: "SELECT id, name FROM menus WHERE id = ? AND household_id = ?",
    args: [id, householdId],
  });

  const row = result.rows[0];
  return row ? mapMenu(row as Record<string, unknown>) : undefined;
}

export async function createMenu(name: string, householdId: string) {
  const menu = {
    id: randomUUID(),
    name: name.trim(),
  };

  await db.execute({
    sql: "INSERT INTO menus (id, name, household_id) VALUES (?, ?, ?)",
    args: [menu.id, menu.name, householdId],
  });

  return menu;
}

export async function deleteMenu(id: string, householdId: string) {
  const menuCount = await db.execute({
    sql: "SELECT COUNT(*) AS count FROM menus WHERE household_id = ?",
    args: [householdId],
  });
  if (asNumber(menuCount.rows[0]?.count) <= 1) {
    throw new Error("No se puede eliminar el unico menu.");
  }

  const result = await db.execute({
    sql: "DELETE FROM menus WHERE id = ? AND household_id = ?",
    args: [id, householdId],
  });

  if (result.rowsAffected === 0) {
    throw new Error("El menu no es valido.");
  }
}
