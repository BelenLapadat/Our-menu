import { randomUUID } from "node:crypto";
import { db } from "./db";

export type Meal = {
  id: string;
  date: string;
  recipeIds: string[];
  recipeTitles: string[];
  rating: number;
  effects: string;
};

export type RecipeSelectionStat = {
  recipeId: string;
  title: string;
  selections: number;
};

export type RatedMealStat = {
  id: string;
  date: string;
  recipeTitles: string[];
  rating: number;
};

type MealRecipeRow = {
  id: string;
  meal_date: string;
  recipe_id: string;
  recipe_title: string;
  rating: number;
  effects: string;
};

type RecipeSelectionRow = {
  recipe_id: string;
  recipe_title: string;
  selections: number;
};

type RatedMealRow = {
  id: string;
  meal_date: string;
  recipe_titles: string;
  rating: number;
};

const mealQueries = {
  list: db.prepare<{ startDate: string; endDate: string; today: string }, MealRecipeRow>(`
    SELECT meals.id, meals.meal_date, meals.rating, meals.effects, recipes.id AS recipe_id, recipes.title AS recipe_title
    FROM meals
    JOIN meal_recipes ON meal_recipes.meal_id = meals.id
    JOIN recipes ON recipes.id = meal_recipes.recipe_id
    WHERE meals.meal_date BETWEEN @startDate AND @endDate
      AND (meals.meal_date < @today OR recipes.deleted_at IS NULL)
    ORDER BY meals.meal_date, meals.created_at, meal_recipes.rowid
  `),
  insertMeal: db.prepare<{ id: string; date: string; rating: number; effects: string }, unknown>(
    "INSERT INTO meals (id, meal_date, rating, effects) VALUES (@id, @date, @rating, @effects)",
  ),
  insertRecipe: db.prepare<{ mealId: string; recipeId: string }, unknown>(
    "INSERT INTO meal_recipes (meal_id, recipe_id) VALUES (@mealId, @recipeId)",
  ),
  delete: db.prepare<string, unknown>("DELETE FROM meals WHERE id = ?"),
  deleteRecipes: db.prepare<string, unknown>(
    "DELETE FROM meal_recipes WHERE meal_id = ?",
  ),
  updateReview: db.prepare<{ id: string; rating: number; effects: string }, unknown>(
    "UPDATE meals SET rating = @rating, effects = @effects WHERE id = @id",
  ),
  mostSelected: db.prepare<{ startDate: string; endDate: string }, RecipeSelectionRow>(`
    SELECT recipes.id AS recipe_id, recipes.title AS recipe_title, COUNT(*) AS selections
    FROM meal_recipes
    JOIN meals ON meals.id = meal_recipes.meal_id
    JOIN recipes ON recipes.id = meal_recipes.recipe_id
    WHERE meals.meal_date BETWEEN @startDate AND @endDate
    GROUP BY recipes.id, recipes.title
    ORDER BY selections DESC, recipes.title COLLATE NOCASE
    LIMIT 5
  `),
  bestRated: db.prepare<{ startDate: string; endDate: string }, RatedMealRow>(`
    SELECT meals.id, meals.meal_date, GROUP_CONCAT(recipes.title, ' + ') AS recipe_titles, meals.rating
    FROM meals
    JOIN meal_recipes ON meal_recipes.meal_id = meals.id
    JOIN recipes ON recipes.id = meal_recipes.recipe_id
    WHERE meals.meal_date BETWEEN @startDate AND @endDate AND meals.rating BETWEEN 1 AND 5
    GROUP BY meals.id, meals.meal_date, meals.rating
    ORDER BY meals.rating DESC, meals.meal_date DESC
    LIMIT 5
  `),
};

export function getMealsBetween(startDate: string, endDate: string, today: string) {
  const groupedMeals = new Map<string, Meal>();

  for (const row of mealQueries.list.all({ startDate, endDate, today })) {
    const meal = groupedMeals.get(row.id) ?? {
      id: row.id,
      date: row.meal_date,
      recipeIds: [],
      recipeTitles: [],
      rating: row.rating,
      effects: row.effects,
    };

    meal.recipeIds.push(row.recipe_id);
    meal.recipeTitles.push(row.recipe_title);
    groupedMeals.set(row.id, meal);
  }

  return Array.from(groupedMeals.values());
}

export function getMostSelectedRecipes(startDate: string, endDate: string) {
  return mealQueries.mostSelected.all({ startDate, endDate }).map((row) => ({
    recipeId: row.recipe_id,
    title: row.recipe_title,
    selections: row.selections,
  }));
}

export function getBestRatedMeals(startDate: string, endDate: string) {
  return mealQueries.bestRated.all({ startDate, endDate }).map((row) => ({
    id: row.id,
    date: row.meal_date,
    recipeTitles: row.recipe_titles.split(" + "),
    rating: row.rating,
  }));
}

export function createMeal(
  date: string,
  recipeIds: string[],
  rating: number,
  effects: string,
) {
  const mealId = randomUUID();
  const saveMeal = db.transaction(() => {
    mealQueries.insertMeal.run({ id: mealId, date, rating, effects });
    for (const recipeId of recipeIds) {
      mealQueries.insertRecipe.run({ mealId, recipeId });
    }
  });

  saveMeal();
}

export function updateMeal(
  id: string,
  recipeIds: string[],
  rating: number,
  effects: string,
) {
  const saveMeal = db.transaction(() => {
    mealQueries.deleteRecipes.run(id);
    for (const recipeId of recipeIds) {
      mealQueries.insertRecipe.run({ mealId: id, recipeId });
    }
    mealQueries.updateReview.run({ id, rating, effects });
  });

  saveMeal();
}

export function deleteMeal(id: string) {
  mealQueries.delete.run(id);
}
