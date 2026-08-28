"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type WeekHeaderProps = {
  weekLabel: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
};

export default function WeekHeader({
  weekLabel,
  onPreviousWeek,
  onNextWeek,
}: WeekHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-zinc-500">
          Nuestro Menusito
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Calendario
        </h1>
        <p className="mt-2 text-zinc-500">{weekLabel}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label="Semana anterior"
          title="Semana anterior"
          onClick={onPreviousWeek}
          className="flex size-10 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
        >
          <ChevronLeft aria-hidden="true" size={20} />
        </button>
        <span className="px-1 text-sm font-medium text-zinc-500">Semana</span>
        <button
          type="button"
          aria-label="Semana siguiente"
          title="Semana siguiente"
          onClick={onNextWeek}
          className="flex size-10 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
        >
          <ChevronRight aria-hidden="true" size={20} />
        </button>
      </div>
    </header>
  );
}
