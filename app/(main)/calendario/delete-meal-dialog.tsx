"use client";

import type { Meal } from "@/lib/meals";
import { deleteMeal } from "./actions";

type DeleteMealDialogProps = {
  meal: Meal;
  date: string;
  onCancel: () => void;
};

export default function DeleteMealDialog({
  meal,
  date,
  onCancel,
}: DeleteMealDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-meal-title"
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2
          id="delete-meal-title"
          className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
        >
          Estas seguro que queres borrar esta comida
        </h2>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-50"
          >
            Cancelar
          </button>
          <form action={deleteMeal}>
            <input type="hidden" name="id" value={meal.id} />
            <input type="hidden" name="date" value={date} />
            <input type="hidden" name="updatedAt" value={meal.updatedAt} />
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
  );
}
