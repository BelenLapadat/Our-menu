import { randomUUID } from "node:crypto";
import { asNumber, asString, db } from "./db";

export type Recipe = {
  id: string;
  title: string;
  description: string;
  notes: string;
  rating: number;
};

function mapRecipe(row: Record<string, unknown>): Recipe {
  return {
    id: asString(row.id),
    title: asString(row.title),
    description: asString(row.description),
    notes: asString(row.notes),
    rating: asNumber(row.rating),
  };
}

export async function getRecipes() {
  const result = await db.execute(
    "SELECT id, title, description, notes, rating FROM recipes WHERE deleted_at IS NULL",
  );

  return result.rows
    .map((row) => mapRecipe(row as Record<string, unknown>))
    .sort((first, second) =>
      first.title.localeCompare(second.title, "es", { sensitivity: "base" }),
    );
}

export async function getRecipe(id: string) {
  const result = await db.execute({
    sql: "SELECT id, title, description, notes, rating FROM recipes WHERE id = ? AND deleted_at IS NULL",
    args: [id],
  });

  const row = result.rows[0];
  return row ? mapRecipe(row as Record<string, unknown>) : undefined;
}

export async function createRecipe(recipe: Omit<Recipe, "id" | "rating">) {
  await db.execute({
    sql: "INSERT INTO recipes (id, title, description, notes, rating) VALUES (?, ?, ?, ?, 0)",
    args: [randomUUID(), recipe.title, recipe.description, recipe.notes],
  });
}

export async function updateRecipe(recipe: Recipe) {
  await db.execute({
    sql: "UPDATE recipes SET title = ?, description = ?, notes = ?, rating = ? WHERE id = ?",
    args: [
      recipe.title,
      recipe.description,
      recipe.notes,
      recipe.rating,
      recipe.id,
    ],
  });
}

export async function updateRecipeRating(id: string, rating: number) {
  await db.execute({
    sql: "UPDATE recipes SET rating = ? WHERE id = ? AND deleted_at IS NULL",
    args: [rating, id],
  });
}

export async function getBestRatedRecipes() {
  const result = await db.execute(`
    SELECT id, title, rating
    FROM recipes
    WHERE deleted_at IS NULL AND rating BETWEEN 1 AND 5
    ORDER BY rating DESC, title COLLATE NOCASE
    LIMIT 5
  `);

  return result.rows.map((row) => ({
    id: asString(row.id),
    title: asString(row.title),
    rating: asNumber(row.rating),
  }));
}

export async function deleteRecipe(id: string) {
  await db.execute({
    sql: "UPDATE recipes SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [id],
  });
}
