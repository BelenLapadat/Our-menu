"use server";

import { redirect } from "next/navigation";
import {
  createMeal,
  deleteMeal as removeMeal,
  updateMeal as saveMeal,
} from "@/lib/meals";
import { validateMealInput } from "@/lib/meal-validation";
import { revalidateAfterMealChange } from "@/lib/revalidate";
import { getRecipes } from "@/lib/recipes";

export async function addMeal(formData: FormData) {
  const availableRecipeIds = new Set(
    (await getRecipes()).map((recipe) => recipe.id),
  );
  const { date, recipeIds, effects } = validateMealInput(
    formData,
    availableRecipeIds,
  );

  await createMeal(date, recipeIds, effects);
  revalidateAfterMealChange();
  redirect(`/calendario?date=${encodeURIComponent(date)}`);
}

export async function updateMeal(formData: FormData) {
  const availableRecipeIds = new Set(
    (await getRecipes()).map((recipe) => recipe.id),
  );
  const { id, date, recipeIds, effects } = validateMealInput(
    formData,
    availableRecipeIds,
    true,
  );

  await saveMeal(id!, recipeIds, effects);
  revalidateAfterMealChange();
  redirect(`/calendario?date=${encodeURIComponent(date)}`);
}

export async function deleteMeal(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();

  if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("La comida no es valida.");
  }

  await removeMeal(id);
  revalidateAfterMealChange();
  redirect(`/calendario?date=${encodeURIComponent(date)}&mealDeleted=1`);
}
