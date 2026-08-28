import Link from "next/link";
import DeletionNotice from "@/app/components/deletion-notice";
import RecipeList from "./recipe-list";
import { getRecipes } from "@/lib/recipes";

export const dynamic = "force-dynamic";

export default async function RecetasPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; recipe?: string }>;
}) {
  const recipes = getRecipes();
  const { deleted, recipe: selectedRecipeId } = await searchParams;

  return (
    <main className="flex-1 bg-zinc-50 px-6 py-16 dark:bg-black sm:px-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-zinc-500">
              Nuestro Menusito
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Recetas
            </h1>
          </div>
          <Link
            href="/recetas/crear"
            aria-label="Crear receta"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-2xl font-light text-white transition-colors hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:outline-white"
          >
            +
          </Link>
        </header>

        {deleted === "1" && <DeletionNotice />}

        <RecipeList
          key={selectedRecipeId ?? "recipes"}
          recipes={recipes}
          initialRecipeId={selectedRecipeId}
        />
      </div>
    </main>
  );
}
