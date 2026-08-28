"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createRecipe,
  deleteRecipe as removeRecipe,
  updateRecipe as saveRecipe,
} from "@/lib/recipes";

export async function addRecipe(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!title || !description) {
    throw new Error("El titulo y la descripcion son obligatorios.");
  }

  createRecipe({ title, description, notes });
  revalidatePath("/recetas");
  redirect("/recetas");
}

export async function deleteRecipe(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("La receta no es valida.");
  }

  removeRecipe(id);
  revalidatePath("/recetas");
  redirect("/recetas?deleted=1");
}

export async function updateRecipe(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id || !title || !description) {
    throw new Error("El titulo y la descripcion son obligatorios.");
  }

  saveRecipe({ id, title, description, notes });
  revalidatePath("/recetas");
  redirect("/recetas");
}
