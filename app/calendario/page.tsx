import { getMealsBetween } from "@/lib/meals";
import { getRecipes } from "@/lib/recipes";
import DeletionNotice from "@/app/components/deletion-notice";
import CalendarView from "./calendar-view";

export const dynamic = "force-dynamic";

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date) {
  const monday = new Date(date);
  const day = monday.getDay();
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function isDateKey(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && dateKey(date) === value;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; mealDeleted?: string }>;
}) {
  const today = new Date();
  const { date: requestedDate, mealDeleted } = await searchParams;
  const anchorDate = isDateKey(requestedDate)
    ? new Date(`${requestedDate}T00:00:00`)
    : today;
  const monday = startOfWeek(anchorDate);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return { key: dateKey(date), timestamp: date.getTime() };
  });
  const validRequestedDate =
    isDateKey(requestedDate) && days.some((day) => day.key === requestedDate)
      ? requestedDate
      : undefined;
  const selectedDay = validRequestedDate ?? dateKey(anchorDate);

  return (
    <>
      {mealDeleted === "1" && (
        <DeletionNotice message="La comida ha sido borrada" />
      )}
      <CalendarView
        days={days}
        today={dateKey(today)}
        initialSelectedDay={selectedDay}
        recipes={getRecipes()}
        meals={getMealsBetween(dateKey(monday), dateKey(sunday), dateKey(today))}
      />
    </>
  );
}
