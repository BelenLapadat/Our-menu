"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, StickyNote } from "lucide-react";
import type { CalendarDay } from "@/lib/dates";
import { dateFromKey, dateKey } from "@/lib/dates";
import type { Meal } from "@/lib/meals";
import type { Recipe } from "@/lib/recipes";
import MealForm from "./meal-form";
import DeleteMealDialog from "./delete-meal-dialog";
import MealList from "./meal-list";
import {
  findBestNotedDay,
  getAdjacentNotedDay,
} from "./notes-filter";
import WeekDaySelector from "./week-day-selector";
import WeekHeader from "./week-header";

const CALENDAR_REFRESH_MS = 25_000;

const dayFormatter = new Intl.DateTimeFormat("es", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function buildCalendarUrl(date: string, notesFilterActive: boolean) {
  const params = new URLSearchParams({ date });
  if (notesFilterActive) {
    params.set("notes", "1");
  }
  return `/calendario?${params.toString()}`;
}

export default function CalendarView({
  days,
  today,
  initialSelectedDay,
  initialNotesFilter = false,
  recipes,
  meals,
  notedDates,
}: {
  days: CalendarDay[];
  today: string;
  initialSelectedDay: string;
  initialNotesFilter?: boolean;
  recipes: Recipe[];
  meals: Meal[];
  notedDates: string[];
}) {
  const router = useRouter();
  const notedDateSet = new Set(notedDates);
  const [selectedDay, setSelectedDay] = useState(initialSelectedDay);
  const [notesFilterActive, setNotesFilterActive] = useState(initialNotesFilter);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [mealToEdit, setMealToEdit] = useState<Meal | null>(null);
  const [mealToDelete, setMealToDelete] = useState<Meal | null>(null);
  const selectedIndex = days.findIndex((day) => day.key === selectedDay);
  const notedDayIndex = notedDates.indexOf(selectedDay);
  const selectedDate = dateFromKey(selectedDay);
  const selectedMeals = meals.filter((meal) => meal.date === selectedDay);
  const selectedDayHasNote = notedDateSet.has(selectedDay);
  const isModalOpen =
    isMealModalOpen || mealToEdit !== null || mealToDelete !== null;

  useEffect(() => {
    if (isModalOpen) {
      return;
    }

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, CALENDAR_REFRESH_MS);

    return () => window.clearInterval(intervalId);
  }, [isModalOpen, router]);

  useEffect(() => {
    function handleFocus() {
      if (!isModalOpen) {
        router.refresh();
      }
    }

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isModalOpen, router]);

  useEffect(() => {
    if (!initialNotesFilter || notedDates.includes(initialSelectedDay)) {
      return;
    }

    const bestDay = findBestNotedDay(initialSelectedDay, notedDates, days);
    if (!bestDay) {
      return;
    }

    if (days.some((day) => day.key === bestDay)) {
      setSelectedDay(bestDay);
      return;
    }

    router.replace(buildCalendarUrl(bestDay, true));
  }, [days, initialNotesFilter, initialSelectedDay, notedDates, router]);

  function navigateToDay(day: string, withNotesFilter = notesFilterActive) {
    if (days.some((weekDay) => weekDay.key === day)) {
      setSelectedDay(day);
      return;
    }

    router.push(buildCalendarUrl(day, withNotesFilter));
  }

  function navigateWeek(offset: number) {
    const targetDate = dateFromKey(days[0].key);
    targetDate.setDate(targetDate.getDate() + offset * 7);
    router.push(buildCalendarUrl(dateKey(targetDate), notesFilterActive));
  }

  function toggleNotesFilter() {
    if (notesFilterActive) {
      setNotesFilterActive(false);
      router.replace(buildCalendarUrl(selectedDay, false));
      return;
    }

    const bestDay = findBestNotedDay(selectedDay, notedDates, days) ?? selectedDay;
    setNotesFilterActive(true);

    if (days.some((day) => day.key === bestDay)) {
      setSelectedDay(bestDay);
      router.replace(buildCalendarUrl(bestDay, true));
      return;
    }

    router.push(buildCalendarUrl(bestDay, true));
  }

  function goToPreviousDay() {
    if (notesFilterActive) {
      const previousDay = getAdjacentNotedDay(selectedDay, notedDates, -1);
      if (previousDay) {
        navigateToDay(previousDay);
      }
      return;
    }

    if (selectedIndex > 0) {
      setSelectedDay(days[selectedIndex - 1].key);
    }
  }

  function goToNextDay() {
    if (notesFilterActive) {
      const nextDay = getAdjacentNotedDay(selectedDay, notedDates, 1);
      if (nextDay) {
        navigateToDay(nextDay);
      }
      return;
    }

    if (selectedIndex < days.length - 1) {
      setSelectedDay(days[selectedIndex + 1].key);
    }
  }

  const canGoToPreviousDay = notesFilterActive
    ? notedDayIndex > 0
    : selectedIndex > 0;
  const canGoToNextDay = notesFilterActive
    ? notedDayIndex >= 0 && notedDayIndex < notedDates.length - 1
    : selectedIndex < days.length - 1;

  return (
    <main className="flex-1 bg-zinc-50 px-6 py-16 dark:bg-black sm:px-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <WeekHeader
          weekLabel={`Semana del ${dateFromKey(days[0].key).toLocaleDateString("es", { day: "numeric", month: "long" })} al ${dateFromKey(days[6].key).toLocaleDateString("es", { day: "numeric", month: "long" })}`}
          onPreviousWeek={() => navigateWeek(-1)}
          onNextWeek={() => navigateWeek(1)}
        />

        <section aria-label="Dias de la semana" className="flex flex-col gap-4">
          <div className="flex justify-end">
            <button
              type="button"
              aria-pressed={notesFilterActive}
              disabled={notedDates.length === 0}
              onClick={toggleNotesFilter}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:cursor-not-allowed disabled:opacity-40 dark:focus-visible:outline-zinc-50 ${
                notesFilterActive
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                  : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
              }`}
            >
              <StickyNote aria-hidden="true" size={16} />
              Dias con notas
            </button>
          </div>

          <WeekDaySelector
            days={days}
            today={today}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            notesFilterActive={notesFilterActive}
            notedDates={notedDateSet}
          />

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            {notesFilterActive && !selectedDayHasNote ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                {notedDates.length === 0
                  ? "Todavia no hay comidas con notas."
                  : "Selecciona un dia con notas para ver sus comidas."}
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    aria-label="Dia anterior"
                    disabled={!canGoToPreviousDay}
                    onClick={goToPreviousDay}
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
                          if (notesFilterActive && !notedDateSet.has(today)) {
                            return;
                          }

                          if (days.some((day) => day.key === today)) {
                            setSelectedDay(today);
                          } else {
                            router.push(`/calendario?date=${today}`);
                          }
                        }}
                        disabled={notesFilterActive && !notedDateSet.has(today)}
                        className="mt-2 rounded-full px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
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
                    disabled={!canGoToNextDay}
                    onClick={goToNextDay}
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
              </>
            )}
          </div>
        </section>
      </div>

      {isMealModalOpen && (
        <MealForm
          date={selectedDay}
          recipes={recipes}
          onCancel={() => setIsMealModalOpen(false)}
        />
      )}
      {mealToEdit && (
        <MealForm
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
