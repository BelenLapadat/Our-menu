import type { CalendarDay } from "@/lib/dates";
import { dateFromKey } from "@/lib/dates";

export function findBestNotedDay(
  selectedDay: string,
  notedDates: string[],
  weekDays: CalendarDay[],
): string | null {
  if (notedDates.length === 0) {
    return null;
  }

  const notedSet = new Set(notedDates);
  if (notedSet.has(selectedDay)) {
    return selectedDay;
  }

  const notedDayInWeek = weekDays.find((day) => notedSet.has(day.key));
  if (notedDayInWeek) {
    return notedDayInWeek.key;
  }

  const selectedTime = dateFromKey(selectedDay).getTime();
  let closest = notedDates[0];
  let closestDistance = Infinity;

  for (const date of notedDates) {
    const distance = Math.abs(dateFromKey(date).getTime() - selectedTime);
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = date;
    }
  }

  return closest;
}

export function getAdjacentNotedDay(
  selectedDay: string,
  notedDates: string[],
  direction: -1 | 1,
): string | null {
  const index = notedDates.indexOf(selectedDay);
  if (index === -1) {
    return null;
  }

  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= notedDates.length) {
    return null;
  }

  return notedDates[nextIndex];
}
