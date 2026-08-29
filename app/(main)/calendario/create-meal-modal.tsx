"use client";

import MealForm from "./meal-form";
import type { Recipe } from "@/lib/recipes";

export default function CreateMealModal({
  date,
  recipes,
  onCancel,
}: {
  date: string;
  recipes: Recipe[];
  onCancel: () => void;
}) {
  return <MealForm date={date} recipes={recipes} onCancel={onCancel} />;
}
