"use client";

import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Meal } from "@/lib/meals";
import type { Recipe } from "@/lib/recipes";

type MealListProps = {
  meals: Meal[];
  recipes: Recipe[];
  onAddMeal: () => void;
  onEditMeal: (meal: Meal) => void;
  onDeleteMeal: (meal: Meal) => void;
};

export default function MealList({
  meals,
  recipes,
  onAddMeal,
  onEditMeal,
  onDeleteMeal,
}: MealListProps) {
  return (
    <>
      <button
        type="button"
        onClick={onAddMeal}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-950 hover:bg-zinc-50 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-50 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
      >
        <Plus aria-hidden="true" size={17} />
        Añadir comida
      </button>

      {meals.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="flex items-center justify-between gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900"
            >
              <ul className="min-w-0 flex-1 list-none text-sm font-medium text-zinc-950 dark:text-zinc-50">
                {meal.recipeTitles.map((title, index) => {
                  const recipeId = meal.recipeIds[index];
                  const isRecipeAvailable = recipes.some(
                    (recipe) => recipe.id === recipeId,
                  );

                  return (
                    <li key={`${meal.id}-${recipeId}`}>
                      {isRecipeAvailable ? (
                        <Link
                          href={`/recetas?recipe=${encodeURIComponent(recipeId)}`}
                          className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-zinc-50"
                        >
                          {title}
                        </Link>
                      ) : (
                        title
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {meal.effects && (
                  <p className="max-w-40 text-right text-xs text-zinc-500">
                    {meal.effects}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  aria-label="Editar comida"
                  title="Editar comida"
                  onClick={() => onEditMeal(meal)}
                  className="flex size-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
                >
                  <Pencil aria-hidden="true" size={17} />
                </button>
                <button
                  type="button"
                  aria-label="Borrar comida"
                  title="Borrar comida"
                  onClick={() => onDeleteMeal(meal)}
                  className="flex size-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 dark:focus-visible:outline-red-400"
                >
                  <Trash2 aria-hidden="true" size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
