"use client";

import type { Dispatch, SetStateAction } from "react";

const shortDayFormatter = new Intl.DateTimeFormat("es", { weekday: "short" });

type CalendarDay = { key: string; timestamp: number };

type WeekDaySelectorProps = {
  days: CalendarDay[];
  today: string;
  selectedDay: string;
  setSelectedDay: Dispatch<SetStateAction<string>>;
};

function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function WeekDaySelector({
  days,
  today,
  selectedDay,
  setSelectedDay,
}: WeekDaySelectorProps) {
  return (
    <div className="grid grid-cols-7 gap-1 rounded-2xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950 sm:gap-2 sm:p-3">
      {days.map((day) => {
        const date = dateFromKey(day.key);
        const isSelected = day.key === selectedDay;
        const isToday = day.key === today;

        return (
          <button
            key={day.key}
            type="button"
            aria-pressed={isSelected}
            onClick={() => setSelectedDay(day.key)}
            className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl px-1 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-zinc-50 ${isSelected ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}
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
