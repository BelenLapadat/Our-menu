"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarDay } from "@/lib/dates";
import { dateFromKey, dateKey } from "@/lib/dates";
import type { Meal } from "@/lib/meals";
import type { Recipe } from "@/lib/recipes";
import CreateMealModal from "./create-meal-modal";
import DeleteMealDialog from "./delete-meal-dialog";
import EditMealModal from "./edit-meal-modal";
import MealList from "./meal-list";
import WeekDaySelector from "./week-day-selector";
import WeekHeader from "./week-header";

const dayFormatter = new Intl.DateTimeFormat("es", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default function CalendarView({
  days,
  today,
  initialSelectedDay,
  recipes,
  meals,
}: {
  days: CalendarDay[];
  today: string;
  initialSelectedDay: string;
  recipes: Recipe[];
  meals: Meal[];
}) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(initialSelectedDay);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [mealToEdit, setMealToEdit] = useState<Meal | null>(null);
  const [mealToDelete, setMealToDelete] = useState<Meal | null>(null);
  const selectedIndex = days.findIndex((day) => day.key === selectedDay);
  const selectedDate = dateFromKey(selectedDay);
  const selectedMeals = meals.filter((meal) => meal.date === selectedDay);

  function navigateWeek(offset: number) {
    const targetDate = dateFromKey(days[0].key);
    targetDate.setDate(targetDate.getDate() + offset * 7);
    router.push(`/calendario?date=${dateKey(targetDate)}`);
  }

  return (
    <main className="flex-1 bg-zinc-50 px-6 py-16 dark:bg-black sm:px-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <WeekHeader
          weekLabel={`Semana del ${dateFromKey(days[0].key).toLocaleDateString("es", { day: "numeric", month: "long" })} al ${dateFromKey(days[6].key).toLocaleDateString("es", { day: "numeric", month: "long" })}`}
          onPreviousWeek={() => navigateWeek(-1)}
          onNextWeek={() => navigateWeek(1)}
        />

        <section aria-label="Dias de la semana" className="flex flex-col gap-4">
          <WeekDaySelector
            days={days}
            today={today}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
          />

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                aria-label="Dia anterior"
                disabled={selectedIndex <= 0}
                onClick={() => setSelectedDay(days[selectedIndex - 1].key)}
                className="flex size-10 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
              >
                <ChevronLeft aria-hidden="true" size={20} />
              </button>
              <div className="text-center">
                <p className="text-sm font-medium capitalize text-zinc-500">
                  {dayFormatter.format(selectedDate)}
                </p>
                {selectedDay !== today && (
                  <button
                    type="button"
                    onClick={() => {
                      if (days.some((day) => day.key === today)) {
                        setSelectedDay(today);
                      } else {
                        router.push(`/calendario?date=${today}`);
                      }
                    }}
                    className="mt-2 rounded-full px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
                  >
                    Volver a hoy
                  </button>
                )}
                {selectedMeals.length === 0 && (
                  <p className="mt-1 text-zinc-400">Sin comidas planificadas</p>
                )}
              </div>
              <button
                type="button"
                aria-label="Dia siguiente"
                disabled={selectedIndex >= days.length - 1}
                onClick={() => setSelectedDay(days[selectedIndex + 1].key)}
                className="flex size-10 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
              >
                <ChevronRight aria-hidden="true" size={20} />
              </button>
            </div>

            <MealList
              meals={selectedMeals}
              recipes={recipes}
              onAddMeal={() => setIsMealModalOpen(true)}
              onEditMeal={setMealToEdit}
              onDeleteMeal={setMealToDelete}
            />
          </div>
        </section>
      </div>

      {isMealModalOpen && (
        <CreateMealModal
          date={selectedDay}
          recipes={recipes}
          onCancel={() => setIsMealModalOpen(false)}
        />
      )}
      {mealToEdit && (
        <EditMealModal
          date={selectedDay}
          recipes={recipes}
          meal={mealToEdit}
          onCancel={() => setMealToEdit(null)}
        />
      )}
      {mealToDelete && (
        <DeleteMealDialog
          meal={mealToDelete}
          date={selectedDay}
          onCancel={() => setMealToDelete(null)}
        />
      )}
    </main>
  );
}

