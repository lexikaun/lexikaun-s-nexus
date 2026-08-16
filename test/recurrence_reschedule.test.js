import assert from 'assert';
import { expandRecurrenceDates, expandRecurringTask } from '../src/utils/recurrence.ts';
import { generateSmartRescheduleSuggestion, calculateMinutesBetween, addMinutesToTime } from '../src/utils/smartReschedule.ts';

describe("Phase 2.12 — Recurrence Expansion Tests", () => {
  it("Case 1: Expands Mon/Wed/Fri rule until date", () => {
    // 2026-08-17 is Monday (1)
    const rule = {
      freq: 'weekly',
      days: [1, 3, 5], // Mon, Wed, Fri
      until: '2026-08-24', // Mon next week
    };
    const dates = expandRecurrenceDates(rule, '2026-08-17');
    console.log("  [Recurrence] Mon/Wed/Fri occurrences:", dates);
    // Expected: Aug 17 (Mon), Aug 19 (Wed), Aug 21 (Fri), Aug 24 (Mon)
    assert.deepStrictEqual(dates, [
      '2026-08-17',
      '2026-08-19',
      '2026-08-21',
      '2026-08-24',
    ]);
  });

  it("Case 2: Expands daily task for 4 days", () => {
    const dates = expandRecurrenceDates('daily', '2026-08-17', '2026-08-20');
    console.log("  [Recurrence] Daily occurrences:", dates);
    assert.deepStrictEqual(dates, [
      '2026-08-17',
      '2026-08-18',
      '2026-08-19',
      '2026-08-20',
    ]);
  });

  it("Case 3: Expands weekdays skipping weekend", () => {
    // 2026-08-21 is Friday, 22 is Sat, 23 is Sun, 24 is Mon
    const dates = expandRecurrenceDates('weekdays', '2026-08-21', '2026-08-24');
    console.log("  [Recurrence] Weekdays occurrences:", dates);
    assert.deepStrictEqual(dates, [
      '2026-08-21',
      '2026-08-24',
    ]);
  });
});

describe("Phase 2.13 — Smart Rescheduling (Partial Completion) Tests", () => {
  it("Case 1: Worked 1 of 2 scheduled hours -> suggests remaining 1 hour (60m)", () => {
    const plannedTask = {
      id: "task_rec_1",
      userId: "user_test",
      title: "Audio Mastering Session",
      date: "2026-08-17",
      startTime: "10:00",
      endTime: "12:00", // 2 hours = 120m
      priority: "high",
      status: "planned",
    };

    const actualWorked = 60; // 1 hour completed
    const suggestion = generateSmartRescheduleSuggestion(plannedTask, actualWorked, "2026-08-18", "14:00");

    console.log("  [Smart Reschedule] Suggestion reason:", suggestion?.reason);
    console.log("  [Smart Reschedule] Suggested slot:", suggestion?.suggestedStartTime, "to", suggestion?.suggestedEndTime);

    assert.ok(suggestion !== null);
    assert.strictEqual(suggestion.unfinishedMinutes, 60);
    assert.strictEqual(suggestion.suggestedStartTime, "14:00");
    assert.strictEqual(suggestion.suggestedEndTime, "15:00");
    assert.strictEqual(suggestion.targetDate, "2026-08-18");
  });

  it("Case 2: Worked 45 of 90 planned minutes -> suggests remaining 45 minutes", () => {
    const plannedTask = {
      id: "task_rec_2",
      userId: "user_test",
      title: "Vocal Recording Session",
      date: "2026-08-17",
      startTime: "14:00",
      endTime: "15:30", // 90 minutes
      priority: "medium",
      status: "planned",
    };

    const actualWorked = 45;
    const suggestion = generateSmartRescheduleSuggestion(plannedTask, actualWorked);

    assert.ok(suggestion !== null);
    assert.strictEqual(suggestion.unfinishedMinutes, 45);
    assert.strictEqual(suggestion.suggestedStartTime, "14:00");
    assert.strictEqual(suggestion.suggestedEndTime, "14:45");
  });

  it("Case 3: Fully completed (120 of 120 min) -> no reschedule needed (null)", () => {
    const plannedTask = {
      id: "task_rec_3",
      userId: "user_test",
      title: "Finished Project",
      date: "2026-08-17",
      startTime: "10:00",
      endTime: "12:00",
      priority: "medium",
      status: "completed",
    };

    const suggestion = generateSmartRescheduleSuggestion(plannedTask, 120);
    assert.strictEqual(suggestion, null);
  });
});
