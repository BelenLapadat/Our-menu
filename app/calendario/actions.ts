"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createMeal,
  deleteMeal as removeMeal,
  updateMeal as saveMeal,
} from "@/lib/meals";
import { validateMealInput } from "@/lib/meal-validation";
import { getRecipes } from "@/lib/recipes";

export async function addMeal(formData: FormData) {
  const availableRecipeIds = new Set(getRecipes().map((recipe) => recipe.id));
  const { date, recipeIds, rating, effects } = validateMealInput(
    formData,
    availableRecipeIds,
  );

  createMeal(date, recipeIds, rating, effects);
  revalidatePath("/calendario");
  redirect(`/calendario?date=${encodeURIComponent(date)}`);
}

export async function updateMeal(formData: FormData) {
  const availableRecipeIds = new Set(getRecipes().map((recipe) => recipe.id));
  const { id, date, recipeIds, rating, effects } = validateMealInput(
    formData,
    availableRecipeIds,
    true,
  );

  saveMeal(id!, recipeIds, rating, effects);
  revalidatePath("/calendario");
  redirect(`/calendario?date=${encodeURIComponent(date)}`);
}

export async function deleteMeal(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();

  if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("La comida no es valida.");
  }

  removeMeal(id);
  revalidatePath("/calendario");
  redirect(`/calendario?date=${encodeURIComponent(date)}&mealDeleted=1`);
}
