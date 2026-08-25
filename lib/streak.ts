import { CravingEntry } from "./types";

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function previousDay(ts: number): number {
  // Step back through the Date API rather than subtracting 24h, so the count
  // stays correct in time zones that observe DST.
  const d = new Date(ts);
  d.setDate(d.getDate() - 1);
  return startOfDay(d.getTime());
}

/**
 * Consecutive days that have at least one entry, counting back from today.
 * A streak that ends yesterday still counts: the day is not over yet, so it
 * would be discouraging to reset the number before the user has had a chance
 * to log anything.
 */
export function currentStreak(entries: CravingEntry[], now: number = Date.now()): number {
  if (entries.length === 0) return 0;

  const days = new Set(entries.map((e) => startOfDay(e.createdAt)));
  const today = startOfDay(now);
  let cursor = days.has(today) ? today : previousDay(today);
  if (!days.has(cursor)) return 0;

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = previousDay(cursor);
  }
  return streak;
}
