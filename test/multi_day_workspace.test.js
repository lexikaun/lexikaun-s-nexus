import {
  initializeTestEnvironment,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import assert from 'assert';
import { expandRecurringTask } from '../src/utils/recurrence.ts';

let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-lexikaun",
    firestore: {
      rules: readFileSync(resolve('firestore.rules'), 'utf8'),
    },
  });
});

after(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("Phase 4 — Multi-Day Task Workspace Integration", () => {
  it("populates multi-day columns with live scheduled and unscheduled tasks and calculates daily progress", async () => {
    const db = testEnv.authenticatedContext("user_workspace_1").firestore();
    const tasksColl = db.collection("users/user_workspace_1/tasks");

    const day1 = "2026-08-17";
    const day2 = "2026-08-18";

    // 1. Create a scheduled task on Day 1
    const taskDay1Scheduled = {
      id: "task_d1_sched",
      userId: "user_workspace_1",
      title: "Morning Drum Programming",
      date: day1,
      startTime: "09:00",
      endTime: "10:30",
      priority: "high",
      status: "completed",
      completedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(tasksColl.doc(taskDay1Scheduled.id).set(taskDay1Scheduled));

    // 2. Create an unscheduled task on Day 1
    const taskDay1Unscheduled = {
      id: "task_d1_unsched",
      userId: "user_workspace_1",
      title: "Check audio master levels",
      date: day1,
      startTime: "",
      endTime: "",
      priority: "medium",
      status: "planned",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(tasksColl.doc(taskDay1Unscheduled.id).set(taskDay1Unscheduled));

    // 3. Create a scheduled task on Day 2
    const taskDay2Scheduled = {
      id: "task_d2_sched",
      userId: "user_workspace_1",
      title: "Vocal Recording Session",
      date: day2,
      startTime: "14:00",
      endTime: "16:00",
      priority: "critical",
      status: "planned",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(tasksColl.doc(taskDay2Scheduled.id).set(taskDay2Scheduled));

    // Read back and partition by day
    const snapshot = await tasksColl.get();
    const loadedTasks = snapshot.docs.map((d) => d.data());

    const day1Tasks = loadedTasks.filter((t) => t.date === day1);
    const day2Tasks = loadedTasks.filter((t) => t.date === day2);

    assert.strictEqual(day1Tasks.length, 2, "Day 1 should have 2 tasks");
    assert.strictEqual(day2Tasks.length, 1, "Day 2 should have 1 task");

    // Test scheduled vs unscheduled separation
    const day1Scheduled = day1Tasks.filter((t) => t.startTime && t.startTime.trim() !== "");
    const day1Unscheduled = day1Tasks.filter((t) => !t.startTime || t.startTime.trim() === "");

    assert.strictEqual(day1Scheduled.length, 1);
    assert.strictEqual(day1Unscheduled.length, 1);

    // Test real progress calculation for Day 1: 1 completed of 2 total = 50%
    const day1Completed = day1Tasks.filter((t) => t.status === "completed").length;
    const day1Progress = Math.round((day1Completed / day1Tasks.length) * 100);
    assert.strictEqual(day1Progress, 50, "Day 1 progress should be 50%");

    // Test real progress calculation for Day 2: 0 completed of 1 total = 0%
    const day2Completed = day2Tasks.filter((t) => t.status === "completed").length;
    const day2Progress = Math.round((day2Completed / day2Tasks.length) * 100);
    assert.strictEqual(day2Progress, 0, "Day 2 progress should be 0%");

    console.log("  [Multi-Day Workspace] Successfully partitioned tasks across days with accurate completion ratios.");
  });

  it("automatically expands recurring tasks across multi-day planning columns", async () => {
    const db = testEnv.authenticatedContext("user_workspace_2").firestore();
    const tasksColl = db.collection("users/user_workspace_2/tasks");

    // Recurring task starting 2026-08-17 every weekday
    const recurringTask = {
      id: "task_rec_daily_standup",
      userId: "user_workspace_2",
      title: "Daily Music Production Ritual",
      date: "2026-08-17", // Monday
      startTime: "08:30",
      endTime: "09:00",
      priority: "high",
      status: "planned",
      recurrence: { freq: "weekdays", days: [1, 2, 3, 4, 5] },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(tasksColl.doc(recurringTask.id).set(recurringTask));

    // Expand across 4-day window: Aug 17 (Mon) to Aug 20 (Thu)
    const expanded = expandRecurringTask(recurringTask, "2026-08-17", "2026-08-20");
    assert.strictEqual(expanded.length, 4, "Expected 4 occurrences across Mon-Thu window");

    const dates = expanded.map((t) => t.date);
    assert.deepStrictEqual(dates, ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20"]);
    console.log("  [Multi-Day Workspace] Successfully expanded recurring routine across 4 visible planning columns.");
  });
});
