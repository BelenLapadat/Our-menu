import { randomUUID } from "node:crypto";
import { db } from "./db";

export type Recipe = {
  id: string;
  title: string;
  description: string;
  notes: string;
};

const initialRecipes: Omit<Recipe, "id">[] = [
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

const recipeQueries = {
  count: db.prepare<[], { count: number }>(
    "SELECT COUNT(*) as count FROM recipes",
  ),
  list: db.prepare<[], Recipe>(
    "SELECT id, title, description, notes FROM recipes WHERE deleted_at IS NULL",
  ),
  get: db.prepare<string, Recipe>(
    "SELECT id, title, description, notes FROM recipes WHERE id = ? AND deleted_at IS NULL",
  ),
  insert: db.prepare<Recipe, unknown>(
    "INSERT INTO recipes (id, title, description, notes) VALUES (@id, @title, @description, @notes)",
  ),
  update: db.prepare<Recipe, unknown>(
    "UPDATE recipes SET title = @title, description = @description, notes = @notes WHERE id = @id",
  ),
  softDelete: db.prepare<string, unknown>(
    "UPDATE recipes SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
  ),
};

if (recipeQueries.count.get()?.count === 0) {
  const seedRecipes = db.transaction(() => {
    for (const recipe of initialRecipes) {
      recipeQueries.insert.run({ ...recipe, id: randomUUID() });
    }
  });

  seedRecipes();
}

export function getRecipes() {
  return recipeQueries.list
    .all()
    .sort((first, second) =>
      first.title.localeCompare(second.title, "es", { sensitivity: "base" }),
    );
}

export function getRecipe(id: string) {
  return recipeQueries.get.get(id);
}

export function createRecipe(recipe: Omit<Recipe, "id">) {
  recipeQueries.insert.run({ ...recipe, id: randomUUID() });
}

export function updateRecipe(recipe: Recipe) {
  recipeQueries.update.run(recipe);
}

export function deleteRecipe(id: string) {
  recipeQueries.softDelete.run(id);
}
