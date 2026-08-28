import { revalidatePath } from "next/cache";

export function revalidateAfterMealChange() {
  revalidatePath("/calendario");
  revalidatePath("/");
}

export function revalidateAfterRecipeChange() {
  revalidatePath("/recetas");
  revalidatePath("/calendario");
  revalidatePath("/");
}
