import Link from "next/link";
import { CalendarDays, Star } from "lucide-react";
import {
  getBestRatedMeals,
  getMealsBetween,
  getMostSelectedRecipes,
} from "@/lib/meals";

export const dynamic = "force-dynamic";

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return dateKey(date);
}

const todayFormatter = new Intl.DateTimeFormat("es", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          size={15}
          className={
            index < rating
              ? "fill-amber-400 text-amber-400"
              : "text-zinc-300 dark:text-zinc-700"
          }
        />
      ))}
    </span>
  );
}

function StatsSection({
  label,
  mostSelected,
  bestRated,
}: {
  label: string;
  mostSelected: ReturnType<typeof getMostSelectedRecipes>;
  bestRated: ReturnType<typeof getBestRatedMeals>;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Estadisticas · {label}
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Mas populares
          </h3>
          {mostSelected.length > 0 ? (
            <ol className="mt-4 flex flex-col gap-3">
              {mostSelected.map((recipe) => (
                <li key={recipe.recipeId} className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {recipe.title}
                  </span>
                  <span className="shrink-0 text-zinc-500">
                    {recipe.selections} {recipe.selections === 1 ? "vez" : "veces"}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">Todavia no hay datos.</p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Mejor puntuadas
          </h3>
          {bestRated.length > 0 ? (
            <ol className="mt-4 flex flex-col gap-3">
              {bestRated.map((meal) => (
                <li key={meal.id} className="flex items-center justify-between gap-4 text-sm">
                  <span className="min-w-0 font-medium text-zinc-800 dark:text-zinc-200">
                    {meal.recipeTitles.join(" + ")}
                  </span>
                  <Stars rating={meal.rating} />
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">Todavia no hay datos.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const today = dateKey(new Date());
  const todayMeals = getMealsBetween(today, today, today);
  const weekStart = dateDaysAgo(6);
  const monthStart = dateDaysAgo(29);

  return (
    <main className="flex-1 bg-zinc-50 px-6 py-16 dark:bg-black sm:px-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
        <header>
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-zinc-500">
            Nuestro Menusito
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Inicio
          </h1>
          <p className="mt-2 capitalize text-zinc-500">
            {todayFormatter.format(new Date())}
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Menu de hoy
          </h2>
          {todayMeals.length > 0 ? (
            <div className="flex flex-col gap-3">
              {todayMeals.map((meal) => (
                <div key={meal.id} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                  <ul className="list-none text-sm font-medium text-zinc-950 dark:text-zinc-50">
                    {meal.recipeTitles.map((title, index) => (
                      <li key={`${meal.id}-${meal.recipeIds[index]}`}>{title}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-950">
              <p className="text-zinc-600 dark:text-zinc-400">
                No hay comidas planificadas para hoy.
              </p>
              <Link
                href={`/calendario?date=${today}`}
                className="flex items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:outline-white"
              >
                <CalendarDays aria-hidden="true" size={17} />
                Planificar
              </Link>
            </div>
          )}
        </section>

        <StatsSection
          label="ultima semana"
          mostSelected={getMostSelectedRecipes(weekStart, today)}
          bestRated={getBestRatedMeals(weekStart, today)}
        />
        <StatsSection
          label="ultimo mes"
          mostSelected={getMostSelectedRecipes(monthStart, today)}
          bestRated={getBestRatedMeals(monthStart, today)}
        />
      </div>
    </main>
  );
}
