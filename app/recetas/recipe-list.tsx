"use client";

import { useDeferredValue, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Pencil, Search, Trash2 } from "lucide-react";
import type { Recipe } from "@/lib/recipes";
import { deleteRecipe } from "./actions";

export default function RecipeList({
  recipes,
  initialRecipeId,
}: {
  recipes: Recipe[];
  initialRecipeId?: string;
}) {
  const searchParams = useSearchParams();
  const requestedRecipeId = searchParams.get("recipe") ?? initialRecipeId ?? null;
  const [openRecipeOverride, setOpenRecipeOverride] = useState<{
    queryId: string | null;
    recipeId: string | null;
  } | null>(null);
  const openRecipe =
    openRecipeOverride?.queryId === requestedRecipeId
      ? openRecipeOverride.recipeId
      : requestedRecipeId;
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const normalizedSearchTerm = deferredSearchTerm
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const filteredRecipes = recipes.filter((recipe) => {
    const searchableText = `${recipe.title} ${recipe.description}`
      .toLocaleLowerCase("es")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return searchableText.includes(normalizedSearchTerm);
  });

  return (
    <div className="flex flex-col gap-4">
      <label className="relative block">
        <Search
          aria-hidden="true"
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <span className="sr-only">Buscar por titulo o descripcion</span>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar por titulo o descripcion"
          className="w-full rounded-lg border border-zinc-300 bg-white py-3 pl-10 pr-4 text-zinc-950 outline-none placeholder:text-zinc-500 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-50"
        />
      </label>

      <div className="flex flex-col divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {filteredRecipes.map((recipe) => {
          const isOpen = openRecipe === recipe.id;

          return (
            <div
              key={recipe.id}
              className="px-5 py-4 first:rounded-t-2xl last:rounded-b-2xl"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${recipe.id}-details`}
                aria-label={`${isOpen ? "Ocultar" : "Mostrar"} descripcion de ${recipe.title}`}
                onClick={() =>
                  setOpenRecipeOverride({
                    queryId: requestedRecipeId,
                    recipeId: isOpen ? null : recipe.id,
                  })
                }
                className="flex w-full items-center justify-start gap-3 rounded-lg px-2 py-1 text-left text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-50"
              >
                <span
                  aria-hidden="true"
                  className={`text-lg leading-none transition-transform ${isOpen ? "rotate-90" : "rotate-0"}`}
                >
                  &gt;
                </span>
                <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
                  {recipe.title}
                </h2>
              </button>

              {isOpen && (
                <div
                  id={`${recipe.id}-details`}
                  className="mt-3 flex gap-4 pl-9"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {recipe.description}
                    </p>
                    {recipe.notes && (
                      <>
                        <h3 className="mt-4 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                          Notas
                        </h3>
                        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                          {recipe.notes}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex shrink-0 items-start gap-2">
                    <Link
                      href={`/recetas/editar/${recipe.id}`}
                      aria-label={`Editar ${recipe.title}`}
                      title="Editar receta"
                      className="flex size-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
                    >
                      <Pencil aria-hidden="true" size={17} />
                    </Link>
                    <button
                      type="button"
                      aria-label={`Borrar ${recipe.title}`}
                      title="Borrar receta"
                      onClick={() => setRecipeToDelete(recipe)}
                      className="flex size-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 dark:focus-visible:outline-red-400"
                    >
                      <Trash2 aria-hidden="true" size={17} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filteredRecipes.length === 0 && (
          <p className="px-5 py-8 text-center text-zinc-500">
            No encontramos recetas con esa busqueda.
          </p>
        )}
        {recipeToDelete && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-recipe-title"
            className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-6"
          >
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
              <h2
                id="delete-recipe-title"
                className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
              >
                Estas seguro que queres borrar esta receta
              </h2>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRecipeToDelete(null)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-50"
                >
                  Cancelar
                </button>
                <form action={deleteRecipe}>
                  <input type="hidden" name="id" value={recipeToDelete.id} />
                  <button
                    type="submit"
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    Borrar
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
