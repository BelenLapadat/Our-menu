"use client";

import MealForm from "./meal-form";
import type { Meal } from "@/lib/meals";
import type { Recipe } from "@/lib/recipes";

export default function EditMealModal({
  date,
  meal,
  recipes,
  onCancel,
}: {
  date: string;
  meal: Meal;
  recipes: Recipe[];
  onCancel: () => void;
}) {
  return (
    <MealForm
      date={date}
      meal={meal}
      recipes={recipes}
      onCancel={onCancel}
    />
  );
}
