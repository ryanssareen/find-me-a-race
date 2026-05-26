import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addMonths,
  format,
  isSameDay,
  isBefore,
  isAfter,
  parseISO,
} from "date-fns";

export function getDateRange(preset: string): { from: Date; to: Date } {
  const now = new Date();

  switch (preset) {
    case "this-weekend": {
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const saturday = new Date(weekEnd);
      saturday.setDate(saturday.getDate() - 1);
      return { from: startOfDay(saturday), to: endOfDay(weekEnd) };
    }
    case "this-month":
      return { from: startOfDay(now), to: endOfMonth(now) };
    case "next-3-months":
      return { from: startOfDay(now), to: endOfMonth(addMonths(now, 2)) };
    default:
      return { from: startOfDay(now), to: endOfMonth(addMonths(now, 11)) };
  }
}

export function formatRaceDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "EEE, d MMM yyyy");
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMM yyyy");
}

export function formatDateRange(from: Date, to: Date): string {
  if (isSameDay(from, to)) {
    return formatRaceDate(from);
  }
  return `${format(from, "d MMM")} – ${format(to, "d MMM yyyy")}`;
}

export function isUpcoming(date: Date | string): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isAfter(endOfDay(d), new Date());
}

export function isWithinRange(
  date: Date,
  from: Date | undefined,
  to: Date | undefined
): boolean {
  if (from && isBefore(date, startOfDay(from))) return false;
  if (to && isAfter(date, endOfDay(to))) return false;
  return true;
}

export { startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths, format, parseISO };

/**
 * Sort by relevance: future races first (earliest first), then past races (most
 * recent past first). Used in both the server-rendered initial list and the
 * client-side default sort so they don't drift apart.
 */
export function sortByRelevance<T extends { date: string }>(
  races: readonly T[],
  now: number = Date.now()
): T[] {
  return races.slice().sort((a, b) => {
    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();
    const aPast = aTime < now;
    const bPast = bTime < now;
    if (aPast !== bPast) return aPast ? 1 : -1;
    if (aPast && bPast) return bTime - aTime;
    return aTime - bTime;
  });
}
