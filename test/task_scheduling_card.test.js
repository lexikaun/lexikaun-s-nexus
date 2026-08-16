import {
  initializeTestEnvironment,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import assert from 'assert';

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

describe("Phase 6 — Task Cards & Click-based Scheduling Verification", () => {
  it("reschedules a task to a new date and time slot via click-based update", async () => {
    const db = testEnv.authenticatedContext("user_resched_1").firestore();
    const tasksColl = db.collection("users/user_resched_1/tasks");

    // 1. Initial task on Aug 17 at 09:00
    const initialTask = {
      id: "task_resched_target",
      userId: "user_resched_1",
      title: "Sound Design — 808 Glides",
      date: "2026-08-17",
      startTime: "09:00",
      endTime: "10:30",
      priority: "high",
      status: "planned",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(tasksColl.doc(initialTask.id).set(initialTask));

    // 2. Perform click-based reschedule to Aug 18 at 14:00 - 15:30
    const rescheduledUpdate = {
      date: "2026-08-18",
      startTime: "14:00",
      endTime: "15:30",
      updatedAt: Date.now(),
    };
    await assertSucceeds(tasksColl.doc(initialTask.id).update(rescheduledUpdate));

    // 3. Verify task now lands on Aug 18
    const fetchedSnap = await tasksColl.doc(initialTask.id).get();
    const fetchedData = fetchedSnap.data();

    assert.strictEqual(fetchedData.date, "2026-08-18");
    assert.strictEqual(fetchedData.startTime, "14:00");
    assert.strictEqual(fetchedData.endTime, "15:30");
    console.log("  [Task Scheduling] Successfully rescheduled task date and time slot.");
  });

  it("marks task completed and validates completion timestamp", async () => {
    const db = testEnv.authenticatedContext("user_resched_2").firestore();
    const tasksColl = db.collection("users/user_resched_2/tasks");

    const task = {
      id: "task_complete_check",
      userId: "user_resched_2",
      title: "Master Audio Limiter Test",
      date: "2026-08-17",
      startTime: "10:00",
      endTime: "11:00",
      priority: "critical",
      status: "planned",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(tasksColl.doc(task.id).set(task));

    // Complete task
    const completedAt = Date.now();
    await assertSucceeds(tasksColl.doc(task.id).update({
      status: "completed",
      completedAt,
      updatedAt: completedAt,
    }));

    const snap = await tasksColl.doc(task.id).get();
    const data = snap.data();
    assert.strictEqual(data.status, "completed");
    assert.strictEqual(data.completedAt, completedAt);
    console.log("  [Task Completion] Successfully marked task completed with timestamp.");
  });
});
