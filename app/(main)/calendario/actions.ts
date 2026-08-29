"use server";

import { redirect } from "next/navigation";
import { getActiveMenu } from "@/lib/active-menu";
import {
  createMeal,
  deleteMeal as removeMeal,
  MealConflictError,
  updateMeal as saveMeal,
} from "@/lib/meals";
import { validateMealInput } from "@/lib/meal-validation";
import { revalidateAfterMealChange } from "@/lib/revalidate";
import { getRecipes } from "@/lib/recipes";
import { requireUserWithHousehold } from "@/lib/session";

function redirectToCalendar(date: string, params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams({ date, ...params });
  redirect(`/calendario?${searchParams.toString()}`);
}

export async function addMeal(formData: FormData) {
  const { household } = await requireUserWithHousehold();
  const activeMenu = await getActiveMenu(household.id);
  const availableRecipeIds = new Set(
    (await getRecipes(household.id)).map((recipe) => recipe.id),
  );
  const { date, recipeIds, effects } = validateMealInput(
    formData,
    availableRecipeIds,
  );

  await createMeal(activeMenu.id, date, recipeIds, effects);
  revalidateAfterMealChange();
  redirectToCalendar(date);
}

export async function updateMeal(formData: FormData) {
  const { household } = await requireUserWithHousehold();
  const activeMenu = await getActiveMenu(household.id);
  const availableRecipeIds = new Set(
    (await getRecipes(household.id)).map((recipe) => recipe.id),
  );
  const { id, date, recipeIds, effects, updatedAt } = validateMealInput(
    formData,
    availableRecipeIds,
    true,
  );

  try {
    await saveMeal(id!, activeMenu.id, recipeIds, effects, updatedAt!);
  } catch (error) {
    if (error instanceof MealConflictError) {
      redirectToCalendar(date, { mealConflict: "1" });
    }

    throw error;
  }

  revalidateAfterMealChange();
  redirectToCalendar(date);
}

export async function deleteMeal(formData: FormData) {
  const { household } = await requireUserWithHousehold();
  const activeMenu = await getActiveMenu(household.id);
  const id = String(formData.get("id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const updatedAt = String(formData.get("updatedAt") ?? "").trim();

  if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !updatedAt) {
    throw new Error("La comida no es valida.");
  }

  try {
    await removeMeal(id, activeMenu.id, updatedAt);
  } catch (error) {
    if (error instanceof MealConflictError) {
      redirectToCalendar(date, { mealConflict: "1" });
    }

    throw error;
  }

  revalidateAfterMealChange();
  redirectToCalendar(date, { mealDeleted: "1" });
}
