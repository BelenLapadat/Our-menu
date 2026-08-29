import { randomUUID } from "node:crypto";
import { asNumber, db } from "./db";
import { createMenu } from "./menus";

const initialRecipes = [
  {
    title: "Pasta con tomate",
    description:
      "Una receta sencilla de pasta con salsa de tomate casera, ajo y albahaca.",
    notes: "",
  },
  {
    title: "Tortilla de patatas",
    description:
      "Tortilla tradicional preparada con patatas, huevos y cebolla pochada.",
    notes: "",
  },
  {
    title: "Ensalada de garbanzos",
    description:
      "Ensalada fresca de garbanzos, tomate, pepino y un aliño ligero de limón.",
    notes: "",
  },
];

export async function seedIfEmpty() {
  const result = await db.execute("SELECT COUNT(*) AS count FROM recipes");
  const count = asNumber(result.rows[0]?.count);

  if (count > 0) {
    return;
  }

  const menuCount = await db.execute("SELECT COUNT(*) AS count FROM menus");
  if (asNumber(menuCount.rows[0]?.count) === 0) {
    await createMenu("Mi menú");
  }

  await db.batch(
    initialRecipes.map((recipe) => ({
      sql: "INSERT INTO recipes (id, title, description, notes, rating) VALUES (?, ?, ?, ?, 0)",
      args: [randomUUID(), recipe.title, recipe.description, recipe.notes],
    })),
    "write",
  );
}
