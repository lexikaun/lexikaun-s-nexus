import { RecurrenceRule, RecurrenceType, Task } from '../types.ts';

/**
 * Normalizes a RecurrenceRule or string type to RecurrenceRule object
 */
export function normalizeRecurrenceRule(rule: RecurrenceRule | RecurrenceType): RecurrenceRule {
  if (typeof rule === 'string') {
    if (rule === 'weekdays') {
      return { freq: 'weekdays', days: [1, 2, 3, 4, 5] };
    }
    return { freq: rule as 'daily' | 'weekly' | 'monthly' };
  }
  return rule;
}

/**
 * Expands a recurrence rule into a series of ISO date strings (YYYY-MM-DD).
 * 
 * @param rule RecurrenceRule or RecurrenceType
 * @param startDate Starting ISO date string (YYYY-MM-DD)
 * @param untilDate Maximum end ISO date string (YYYY-MM-DD) or max limit
 * @param maxLimit Safety limit on number of occurrences (default: 60)
 * @returns Array of date strings [ "2026-08-18", "2026-08-19", ... ]
 */
export function expandRecurrenceDates(
  rule: RecurrenceRule | RecurrenceType,
  startDate: string,
  untilDate?: string,
  maxLimit: number = 60
): string[] {
  const normRule = normalizeRecurrenceRule(rule);
  if (normRule.freq === 'custom' && (!normRule.days || normRule.days.length === 0)) {
    return [startDate];
  }

  const results: string[] = [];
  const start = new Date(startDate + 'T00:00:00');
  const until = untilDate
    ? new Date(untilDate + 'T23:59:59')
    : normRule.until
    ? new Date(normRule.until + 'T23:59:59')
    : null;

  const formatDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const curr = new Date(start);
  let iterations = 0;

  while (iterations < maxLimit) {
    if (until && curr > until) break;

    const dayOfWeek = curr.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const dateStr = formatDate(curr);

    if (normRule.freq === 'daily') {
      results.push(dateStr);
    } else if (normRule.freq === 'weekdays') {
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        results.push(dateStr);
      }
    } else if (normRule.freq === 'weekly') {
      if (normRule.days && normRule.days.length > 0) {
        if (normRule.days.includes(dayOfWeek)) {
          results.push(dateStr);
        }
      } else {
        // Same day of week as startDate
        if (dayOfWeek === start.getDay()) {
          results.push(dateStr);
        }
      }
    } else if (normRule.freq === 'monthly') {
      if (curr.getDate() === start.getDate()) {
        results.push(dateStr);
      }
    }

    // Step forward 1 day
    curr.setDate(curr.getDate() + 1);
    iterations++;
  }

  return results;
}

/**
 * Expands a recurring task into virtual occurrence tasks within a date range
 */
export function expandRecurringTask(
  baseTask: Task,
  startDate: string,
  endDate: string
): Task[] {
  if (!baseTask.recurrence || baseTask.recurrence === 'none') {
    return [baseTask];
  }

  const dates = expandRecurrenceDates(baseTask.recurrence, baseTask.date, endDate);
  const inRangeDates = dates.filter((d) => d >= startDate && d <= endDate);

  return inRangeDates.map((date, idx) => ({
    ...baseTask,
    id: idx === 0 && date === baseTask.date ? baseTask.id : `${baseTask.id}_rec_${date}`,
    date,
  }));
}
