"use client";

import type { Dispatch, SetStateAction } from "react";
import type { CalendarDay } from "@/lib/dates";
import { dateFromKey } from "@/lib/dates";

const shortDayFormatter = new Intl.DateTimeFormat("es", { weekday: "short" });

type WeekDaySelectorProps = {
  days: CalendarDay[];
  today: string;
  selectedDay: string;
  setSelectedDay: Dispatch<SetStateAction<string>>;
  notesFilterActive?: boolean;
  notedDates?: ReadonlySet<string>;
};

export default function WeekDaySelector({
  days,
  today,
  selectedDay,
  setSelectedDay,
  notesFilterActive = false,
  notedDates,
}: WeekDaySelectorProps) {
  const visibleDays = notesFilterActive
    ? days.filter((day) => notedDates?.has(day.key))
    : days;

  if (notesFilterActive && visibleDays.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950">
        No hay dias con notas en esta semana.
      </div>
    );
  }

  return (
    <div
      className={
        notesFilterActive
          ? "flex flex-wrap justify-center gap-1 rounded-2xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950 sm:gap-2 sm:p-3"
          : "grid grid-cols-7 gap-1 rounded-2xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950 sm:gap-2 sm:p-3"
      }
    >
      {visibleDays.map((day) => {
        const date = dateFromKey(day.key);
        const isSelected = day.key === selectedDay;
        const isToday = day.key === today;

        return (
          <button
            key={day.key}
            type="button"
            aria-pressed={isSelected}
            onClick={() => setSelectedDay(day.key)}
            className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl px-1 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-zinc-50 ${notesFilterActive ? "w-[calc((100%-1.5rem)/7)] min-w-[calc((100%-1.5rem)/7)] shrink-0 sm:w-[calc((100%-3rem)/7)] sm:min-w-[calc((100%-3rem)/7)]" : ""} ${isSelected ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}
          >
            <span className="text-xs capitalize sm:text-sm">
              {shortDayFormatter.format(date).replace(".", "")}
            </span>
            <span className="text-xl font-semibold">{date.getDate()}</span>
            {isToday && (
              <span className="size-1 rounded-full bg-current" aria-label="Hoy" />
            )}
          </button>
        );
      })}
    </div>
  );
}
