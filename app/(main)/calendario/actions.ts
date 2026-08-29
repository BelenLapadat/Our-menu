"use server";

import { redirect } from "next/navigation";
import { getActiveMenu } from "@/lib/active-menu";
import {
  createMeal,
  deleteMeal as removeMeal,
  updateMeal as saveMeal,
} from "@/lib/meals";
import { validateMealInput } from "@/lib/meal-validation";
import { revalidateAfterMealChange } from "@/lib/revalidate";
import { getRecipes } from "@/lib/recipes";
import { requireUserWithHousehold } from "@/lib/session";

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
  redirect(`/calendario?date=${encodeURIComponent(date)}`);
}

export async function updateMeal(formData: FormData) {
  const { household } = await requireUserWithHousehold();
  const activeMenu = await getActiveMenu(household.id);
  const availableRecipeIds = new Set(
    (await getRecipes(household.id)).map((recipe) => recipe.id),
  );
  const { id, date, recipeIds, effects } = validateMealInput(
    formData,
    availableRecipeIds,
    true,
  );

  await saveMeal(id!, activeMenu.id, recipeIds, effects);
  revalidateAfterMealChange();
  redirect(`/calendario?date=${encodeURIComponent(date)}`);
}

export async function deleteMeal(formData: FormData) {
  const { household } = await requireUserWithHousehold();
  const activeMenu = await getActiveMenu(household.id);
  const id = String(formData.get("id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();

  if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("La comida no es valida.");
  }

  await removeMeal(id, activeMenu.id);
  revalidateAfterMealChange();
  redirect(`/calendario?date=${encodeURIComponent(date)}&mealDeleted=1`);
}
