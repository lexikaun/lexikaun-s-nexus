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

describe("Phase 5 — Quick-Add Task Verification", () => {
  it("creates a scheduled task in under a second and stores without space field", async () => {
    const db = testEnv.authenticatedContext("user_quick_1").firestore();
    const tasksColl = db.collection("users/user_quick_1/tasks");

    const quickTask = {
      id: "task_quick_1",
      userId: "user_quick_1",
      title: "Synthesize Roland Juno Bassline",
      date: "2026-08-17",
      startTime: "11:00",
      endTime: "12:00",
      durationMinutes: 60,
      priority: "high",
      status: "planned",
      goalId: "goal_synth_work",
      notes: "Record with analog chorus mode II",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await assertSucceeds(tasksColl.doc(quickTask.id).set(quickTask));

    const snap = await tasksColl.doc(quickTask.id).get();
    assert.ok(snap.exists, "Task must exist immediately");
    const data = snap.data();
    assert.strictEqual(data.title, "Synthesize Roland Juno Bassline");
    assert.strictEqual(data.space, undefined, "Quick-add task must not contain space field");
    assert.strictEqual(data.startTime, "11:00");
    assert.strictEqual(data.endTime, "12:00");
    assert.strictEqual(data.goalId, "goal_synth_work");
    console.log("  [Quick-Add] Successfully created scheduled task with goal link in 1 step.");
  });

  it("creates an unscheduled task from day column and validates immediate retrieval", async () => {
    const db = testEnv.authenticatedContext("user_quick_2").firestore();
    const tasksColl = db.collection("users/user_quick_2/tasks");

    const unscheduledTask = {
      id: "task_quick_unsched",
      userId: "user_quick_2",
      title: "Order new TRS balanced cables",
      date: "2026-08-17",
      startTime: "",
      endTime: "",
      priority: "low",
      status: "planned",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await assertSucceeds(tasksColl.doc(unscheduledTask.id).set(unscheduledTask));

    const snap = await tasksColl.doc(unscheduledTask.id).get();
    assert.ok(snap.exists);
    const data = snap.data();
    assert.strictEqual(data.startTime, "");
    assert.strictEqual(data.space, undefined);
    console.log("  [Quick-Add] Successfully created unscheduled task.");
  });
});
