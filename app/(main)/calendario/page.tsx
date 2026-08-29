import { redirect } from "next/navigation";
import { getActiveMenu } from "@/lib/active-menu";
import { getDatesWithMealNotes, getMealsBetween } from "@/lib/meals";
import { getRecipes } from "@/lib/recipes";
import { getUserHousehold } from "@/lib/session";
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
  searchParams: Promise<{
    date?: string;
    mealDeleted?: string;
    mealConflict?: string;
    notes?: string;
  }>;
}) {
  const today = new Date();
  const { date: requestedDate, mealDeleted, mealConflict, notes } =
    await searchParams;
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
  const household = await getUserHousehold();
  if (!household) {
    redirect("/login");
  }

  const activeMenu = await getActiveMenu(household.id);
  const [recipes, meals, notedDates] = await Promise.all([
    getRecipes(household.id),
    getMealsBetween(
      activeMenu.id,
      dateKey(monday),
      dateKey(sunday),
      dateKey(today),
    ),
    getDatesWithMealNotes(activeMenu.id),
  ]);

  return (
    <>
      {mealDeleted === "1" && (
        <DeletionNotice message="La comida ha sido borrada" />
      )}
      {mealConflict === "1" && (
        <DeletionNotice
          variant="warning"
          message="Esta comida cambio mientras la editabas. Actualiza la pagina e intentalo de nuevo."
        />
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
