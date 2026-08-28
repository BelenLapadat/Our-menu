export type ValidatedMealInput = {
  id?: string;
  date: string;
  recipeIds: string[];
  rating: number;
  effects: string;
};

export function validateMealInput(
  formData: FormData,
  availableRecipeIds: Set<string>,
  requireId = false,
): ValidatedMealInput {
  const id = String(formData.get("id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const rating = Number(formData.get("rating"));
  const effects = String(formData.get("effects") ?? "").trim();
  const rawRecipeIds = String(formData.get("recipeIds") ?? "[]");

  let recipeIds: unknown;
  try {
    recipeIds = JSON.parse(rawRecipeIds);
  } catch {
    throw new Error("Los datos de la comida no son validos.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(recipeIds)) {
    throw new Error("Los datos de la comida no son validos.");
  }

  if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
    throw new Error("La valoracion no es valida.");
  }

  const validRecipeIds = recipeIds.filter(
    (recipeId): recipeId is string =>
      typeof recipeId === "string" && availableRecipeIds.has(recipeId),
  );

  if (validRecipeIds.length === 0) {
    throw new Error("Selecciona al menos una receta.");
  }

  if (requireId && !id) {
    throw new Error("La comida no es valida.");
  }

  return { id: id || undefined, date, recipeIds: validRecipeIds, rating, effects };
}
