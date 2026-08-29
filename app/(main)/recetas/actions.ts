"use server";

import { redirect } from "next/navigation";
import {
  createRecipe,
  deleteRecipe as removeRecipe,
  updateRecipe as saveRecipe,
  updateRecipeRating,
} from "@/lib/recipes";
import { revalidateAfterRecipeChange } from "@/lib/revalidate";
import { requireUserWithHousehold } from "@/lib/session";

export async function addRecipe(formData: FormData) {
  const { household } = await requireUserWithHousehold();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!title || !description) {
    throw new Error("El titulo y la descripcion son obligatorios.");
  }

  await createRecipe({ title, description, notes }, household.id);
  revalidateAfterRecipeChange();
  redirect("/recetas");
}

export async function deleteRecipe(formData: FormData) {
  const { household } = await requireUserWithHousehold();
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("La receta no es valida.");
  }

  await removeRecipe(id, household.id);
  revalidateAfterRecipeChange();
  redirect("/recetas?deleted=1");
}

export async function updateRecipe(formData: FormData) {
  const { household } = await requireUserWithHousehold();
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const rating = Number(formData.get("rating"));

  if (!id || !title || !description) {
    throw new Error("El titulo y la descripcion son obligatorios.");
  }

  if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
    throw new Error("La valoracion no es valida.");
  }

  await saveRecipe({ id, title, description, notes, rating }, household.id);
  revalidateAfterRecipeChange();
  redirect("/recetas");
}

export async function rateRecipe(formData: FormData) {
  const { household } = await requireUserWithHousehold();
  const id = String(formData.get("id") ?? "").trim();
  const rating = Number(formData.get("rating"));

  if (!id || !Number.isInteger(rating) || rating < 0 || rating > 5) {
    throw new Error("La valoracion no es valida.");
  }

  await updateRecipeRating(id, rating, household.id);
  revalidateAfterRecipeChange();
}
