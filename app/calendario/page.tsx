import { getDatesWithMealNotes, getMealsBetween } from "@/lib/meals";
import { getRecipes } from "@/lib/recipes";
import {
  dateKey,
  getWeekDays,
  isDateKey,
  startOfWeek,
} from "@/lib/dates";
import DeletionNotice from "@/app/components/deletion-notice";
import CalendarView from "./calendar-view";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; mealDeleted?: string; notes?: string }>;
}) {
  const today = new Date();
  const { date: requestedDate, mealDeleted, notes } = await searchParams;
  const anchorDate = isDateKey(requestedDate)
    ? new Date(`${requestedDate}T00:00:00`)
    : today;
  const monday = startOfWeek(anchorDate);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const days = getWeekDays(anchorDate);
  const validRequestedDate =
    isDateKey(requestedDate) && days.some((day) => day.key === requestedDate)
      ? requestedDate
      : undefined;
  const selectedDay = validRequestedDate ?? dateKey(anchorDate);
  const [recipes, meals, notedDates] = await Promise.all([
    getRecipes(),
    getMealsBetween(dateKey(monday), dateKey(sunday), dateKey(today)),
    getDatesWithMealNotes(),
  ]);

  return (
    <>
      {mealDeleted === "1" && (
        <DeletionNotice message="La comida ha sido borrada" />
      )}
      <CalendarView
        days={days}
        today={dateKey(today)}
        initialSelectedDay={selectedDay}
        recipes={recipes}
        meals={meals}
        notedDates={notedDates}
        initialNotesFilter={notes === "1"}
      />
    </>
  );
}
