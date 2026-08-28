import { randomUUID } from "node:crypto";
import { asNumber, asString, db } from "./db";

export type Meal = {
  id: string;
  date: string;
  recipeIds: string[];
  recipeTitles: string[];
  effects: string;
};

type MealRecipeRow = {
  id: string;
  meal_date: string;
  recipe_id: string;
  recipe_title: string;
  effects: string;
};

function mapMealRecipeRow(row: Record<string, unknown>): MealRecipeRow {
  return {
    id: asString(row.id),
    meal_date: asString(row.meal_date),
    recipe_id: asString(row.recipe_id),
    recipe_title: asString(row.recipe_title),
    effects: asString(row.effects),
  };
}

export async function getMealsBetween(
  startDate: string,
  endDate: string,
  today: string,
) {
  const result = await db.execute({
    sql: `
      SELECT meals.id, meals.meal_date, meals.effects, recipes.id AS recipe_id, recipes.title AS recipe_title
      FROM meals
      JOIN meal_recipes ON meal_recipes.meal_id = meals.id
      JOIN recipes ON recipes.id = meal_recipes.recipe_id
      WHERE meals.meal_date BETWEEN ? AND ?
        AND (meals.meal_date < ? OR recipes.deleted_at IS NULL)
      ORDER BY meals.meal_date, meals.created_at, meal_recipes.rowid
    `,
    args: [startDate, endDate, today],
  });

  const groupedMeals = new Map<string, Meal>();

  for (const row of result.rows.map((item) =>
    mapMealRecipeRow(item as Record<string, unknown>),
  )) {
    const meal = groupedMeals.get(row.id) ?? {
      id: row.id,
      date: row.meal_date,
      recipeIds: [],
      recipeTitles: [],
      effects: row.effects,
    };

    meal.recipeIds.push(row.recipe_id);
    meal.recipeTitles.push(row.recipe_title);
    groupedMeals.set(row.id, meal);
  }

  return Array.from(groupedMeals.values());
}

export async function getMostSelectedRecipes(startDate: string, endDate: string) {
  const result = await db.execute({
    sql: `
      SELECT recipes.id AS recipe_id, recipes.title AS recipe_title, COUNT(*) AS selections
      FROM meal_recipes
      JOIN meals ON meals.id = meal_recipes.meal_id
      JOIN recipes ON recipes.id = meal_recipes.recipe_id
      WHERE meals.meal_date BETWEEN ? AND ?
      GROUP BY recipes.id, recipes.title
      ORDER BY selections DESC, recipes.title COLLATE NOCASE
      LIMIT 5
    `,
    args: [startDate, endDate],
  });

  return result.rows.map((row) => ({
    recipeId: asString(row.recipe_id),
    title: asString(row.recipe_title),
    selections: asNumber(row.selections),
  }));
}

export async function createMeal(
  date: string,
  recipeIds: string[],
  effects: string,
) {
  const mealId = randomUUID();

  await db.batch(
    [
      {
        sql: "INSERT INTO meals (id, meal_date, effects) VALUES (?, ?, ?)",
        args: [mealId, date, effects],
      },
      ...recipeIds.map((recipeId) => ({
        sql: "INSERT INTO meal_recipes (meal_id, recipe_id) VALUES (?, ?)",
        args: [mealId, recipeId],
      })),
    ],
    "write",
  );
}

export async function updateMeal(
  id: string,
  recipeIds: string[],
  effects: string,
) {
  await db.execute({
    sql: "DELETE FROM meal_recipes WHERE meal_id = ?",
    args: [id],
  });

  await db.batch(
    [
      ...recipeIds.map((recipeId) => ({
        sql: "INSERT INTO meal_recipes (meal_id, recipe_id) VALUES (?, ?)",
        args: [id, recipeId],
      })),
      {
        sql: "UPDATE meals SET effects = ? WHERE id = ?",
        args: [effects, id],
      },
    ],
    "write",
  );
}

export async function deleteMeal(id: string) {
  await db.execute({
    sql: "DELETE FROM meals WHERE id = ?",
    args: [id],
  });
}
