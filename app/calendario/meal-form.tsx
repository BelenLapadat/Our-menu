"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Star, X } from "lucide-react";
import type { Meal } from "@/lib/meals";
import type { Recipe } from "@/lib/recipes";
import { addMeal, updateMeal } from "./actions";

const dayFormatter = new Intl.DateTimeFormat("es", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function normalize(value: string) {
  return value
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function MealForm({
  date,
  recipes,
  meal,
  onCancel,
}: {
  date: string;
  recipes: Recipe[];
  meal?: Meal;
  onCancel: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>(
    meal?.recipeIds ?? [],
  );
  const [rating, setRating] = useState(meal?.rating ?? 0);
  const [effects, setEffects] = useState(meal?.effects ?? "");
  const [isRecipeListOpen, setIsRecipeListOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const normalizedSearchTerm = normalize(searchTerm.trim());
  const matchingRecipes = recipes.filter((recipe) =>
    normalize(recipe.title).includes(normalizedSearchTerm),
  );

  useEffect(() => {
    function handleOutsideClick(event: PointerEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsRecipeListOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, []);

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsRecipeListOpen(false);
    }
  }

  function selectRecipe(recipe: Recipe) {
    setSelectedRecipeIds((currentIds) =>
      currentIds.includes(recipe.id) ? currentIds : [...currentIds, recipe.id],
    );
    setSearchTerm("");
    setIsRecipeListOpen(false);
  }

  function removeRecipe(recipeId: string) {
    setSelectedRecipeIds((currentIds) =>
      currentIds.filter((id) => id !== recipeId),
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="meal-modal-title"
        className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="meal-modal-title"
              className="text-xl font-semibold text-zinc-950 dark:text-zinc-50"
            >
              {meal ? "Editar comida" : "Añadir comida"}
            </h2>
            <p className="mt-1 text-sm capitalize text-zinc-500">
              {dayFormatter.format(dateFromKey(date))}
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onCancel}
            className="flex size-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <form
          action={meal ? updateMeal : addMeal}
          className="mt-6 flex flex-col gap-5"
        >
          {meal && <input type="hidden" name="id" value={meal.id} />}
          <input type="hidden" name="date" value={date} />
          <input
            type="hidden"
            name="recipeIds"
            value={JSON.stringify(selectedRecipeIds)}
          />
          <input type="hidden" name="rating" value={rating} />
          <div>
            <label
              htmlFor="recipe-search"
              className="text-sm font-medium text-zinc-950 dark:text-zinc-50"
            >
              Recetas
            </label>
            <div ref={searchContainerRef} className="relative mt-2">
              <Search
                aria-hidden="true"
                size={17}
                className="pointer-events-none absolute left-3 top-3 text-zinc-500"
              />
              <input
                id="recipe-search"
                type="search"
                value={searchTerm}
                onFocus={() => setIsRecipeListOpen(true)}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setIsRecipeListOpen(true);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Buscar recetas..."
                className="w-full rounded-lg border border-zinc-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50"
              />
              {isRecipeListOpen && (
                <div className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
                  {matchingRecipes.map((recipe) => {
                    const isSelected = selectedRecipeIds.includes(recipe.id);
                    return (
                      <button
                        key={recipe.id}
                        type="button"
                        onClick={() => selectRecipe(recipe)}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${isSelected ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}
                      >
                        {recipe.title}
                        {isSelected && <span aria-hidden="true">✓</span>}
                      </button>
                    );
                  })}
                  {matchingRecipes.length === 0 && (
                    <p className="px-3 py-4 text-sm text-zinc-500">
                      No encontramos recetas.
                    </p>
                  )}
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              {selectedRecipeIds.length} receta
              {selectedRecipeIds.length === 1 ? "" : "s"} seleccionada
              {selectedRecipeIds.length === 1 ? "" : "s"}
            </p>
            {selectedRecipeIds.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {selectedRecipeIds.map((recipeId) => {
                  const recipe = recipes.find((item) => item.id === recipeId);

                  if (!recipe) {
                    return null;
                  }

                  return (
                    <div
                      key={recipe.id}
                      className="flex items-center justify-between gap-3 rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                    >
                      <span>{recipe.title}</span>
                      <button
                        type="button"
                        aria-label={`Quitar ${recipe.title}`}
                        title="Quitar receta"
                        onClick={() => removeRecipe(recipe.id)}
                        className="flex size-7 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
                      >
                        <X aria-hidden="true" size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
              Valoracion (opcional)
            </p>
            <div
              className="mt-2 flex gap-1"
              role="radiogroup"
              aria-label="Valoracion de la comida"
            >
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={`${value} de 5 estrellas`}
                    onClick={() => setRating(value)}
                    className="rounded-md p-1 text-amber-400 transition-colors hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:hover:bg-amber-950"
                  >
                    <Star
                      aria-hidden="true"
                      size={24}
                      className={
                        value <= rating
                          ? "fill-current"
                          : "text-zinc-300 dark:text-zinc-700"
                      }
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-950 dark:text-zinc-50">
            Efectos observados (opcional)
            <textarea
              name="effects"
              rows={3}
              value={effects}
              onChange={(event) => setEffects(event.target.value)}
              placeholder="¿Qué efectos notaste?"
              className="resize-y rounded-lg border border-zinc-300 px-3 py-2 font-normal outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50"
            />
          </label>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={selectedRecipeIds.length === 0}
              className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:outline-white"
            >
              {meal ? "Guardar cambios" : "Guardar comida"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
