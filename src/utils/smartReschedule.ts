import { Task, SmartRescheduleSuggestion } from '../types.ts';

/**
 * Calculates duration in minutes from HH:MM strings
 */
export function calculateMinutesBetween(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const totalStart = startH * 60 + (startM || 0);
  const totalEnd = endH * 60 + (endM || 0);
  return Math.max(0, totalEnd - totalStart);
}

/**
 * Adds minutes to an HH:MM time string, returning a formatted HH:MM string
 */
export function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMinutes = (h * 60 + (m || 0) + minutesToAdd) % (24 * 60);
  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

/**
 * Generates a smart reschedule suggestion for partially completed work.
 * 
 * Case: Worked 1 of 2 scheduled hours -> remaining 1 hour is suggested for a new slot.
 * 
 * @param task The task being rescheduled
 * @param actualWorkedMinutes How many minutes were actually completed
 * @param targetDate Proposed new date (defaults to next day)
 * @param targetStartTime Proposed start time on new date (defaults to same startTime)
 * @returns SmartRescheduleSuggestion or null if fully completed
 */
export function generateSmartRescheduleSuggestion(
  task: Task,
  actualWorkedMinutes: number,
  targetDate?: string,
  targetStartTime?: string
): SmartRescheduleSuggestion | null {
  const plannedDurationMinutes =
    task.duration ||
    task.durationMinutes ||
    calculateMinutesBetween(task.startTime, task.endTime);

  const unfinishedMinutes = Math.max(0, plannedDurationMinutes - actualWorkedMinutes);

  if (unfinishedMinutes <= 0) {
    return null; // No remaining work to reschedule
  }

  // Determine target date (tomorrow by default)
  let nextDate = targetDate;
  if (!nextDate) {
    const base = new Date(task.date || new Date().toISOString().split('T')[0]);
    base.setDate(base.getDate() + 1);
    nextDate = base.toISOString().split('T')[0];
  }

  const start = targetStartTime || task.startTime || '09:00';
  const end = addMinutesToTime(start, unfinishedMinutes);

  const workedHours = (actualWorkedMinutes / 60).toFixed(1).replace('.0', '');
  const plannedHours = (plannedDurationMinutes / 60).toFixed(1).replace('.0', '');
  const remainHours = (unfinishedMinutes / 60).toFixed(1).replace('.0', '');

  const reason = `Completed ${workedHours}h of ${plannedHours}h planned. Remaining ${remainHours}h (${unfinishedMinutes}m) suggested for next available block.`;

  return {
    task,
    unfinishedMinutes,
    suggestedStartTime: start,
    suggestedEndTime: end,
    targetDate: nextDate,
    reason,
  };
}
