/**
 * Calculate the consecutive daily streak from a completionHistory map.
 * 
 * Rules:
 * - If today is completed, count backwards from today until the first missed day.
 * - If today is not completed yet, but yesterday was completed, count backwards from yesterday (streak is active/grace today).
 * - If neither today nor yesterday was completed, the streak is broken (0).
 * 
 * @param completionHistory Map of dates { "YYYY-MM-DD": boolean }
 * @param referenceDate Optional ISO string for testing (default: today)
 * @returns number Consecutive days completed
 */
export function calculateStreak(
  completionHistory: Record<string, boolean> | undefined | null,
  referenceDate?: string
): number {
  if (!completionHistory || Object.keys(completionHistory).length === 0) {
    return 0;
  }

  const baseDate = referenceDate ? new Date(referenceDate) : new Date();
  
  // Format Date to YYYY-MM-DD
  const formatDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getPreviousDay = (d: Date, daysBack: number): string => {
    const prev = new Date(d);
    prev.setDate(prev.getDate() - daysBack);
    return formatDate(prev);
  };

  const todayStr = formatDate(baseDate);
  const yesterdayStr = getPreviousDay(baseDate, 1);

  let streak = 0;
  let startOffset = 0;

  if (completionHistory[todayStr] === true) {
    streak = 1;
    startOffset = 1;
  } else if (completionHistory[yesterdayStr] === true) {
    streak = 1;
    startOffset = 2;
  } else {
    return 0;
  }

  // Count consecutive previous days
  while (true) {
    const checkDateStr = getPreviousDay(baseDate, startOffset);
    if (completionHistory[checkDateStr] === true) {
      streak++;
      startOffset++;
    } else {
      break;
    }
  }

  return streak;
}
