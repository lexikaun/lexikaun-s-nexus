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

describe("Phase 2.10 & 2.11 — Planner Schedule to Today View Integration", () => {
  const todayStr = new Date().toISOString().split('T')[0];

  it("creates a task in Planner with time slot, and verifies it surfaces on Today view", async () => {
    const db = testEnv.authenticatedContext("user_planner_1").firestore();
    const taskRef = db.doc("users/user_planner_1/tasks/task_planner_today_1");

    // 1. Create a task via Planner (assigned time slot)
    const scheduledTask = {
      id: "task_planner_today_1",
      userId: "user_planner_1",
      space: "professional",
      title: "Vocal Comping & Pitch Correction",
      date: todayStr,
      startTime: "14:00",
      endTime: "16:00",
      priority: "high",
      status: "planned",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(taskRef.set(scheduledTask));
    console.log("  [Planner->Today] Task scheduled at 14:00 on date:", todayStr);

    // 2. Query Today view tasks (tasks matching today's date & space)
    const snapshot = await db.collection("users/user_planner_1/tasks").get();
    const todayTasks = snapshot.docs
      .map((d) => d.data())
      .filter((t) => t.date === todayStr && t.space === "professional");

    console.log("  [Planner->Today] Retrieved today tasks count:", todayTasks.length);
    assert.strictEqual(todayTasks.length, 1);
    assert.strictEqual(todayTasks[0].id, "task_planner_today_1");
    assert.strictEqual(todayTasks[0].startTime, "14:00");
    assert.strictEqual(todayTasks[0].endTime, "16:00");

    // 3. Mark complete in Today view and verify persistence
    const completedTask = {
      ...scheduledTask,
      status: "completed",
      completedAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(taskRef.set(completedTask));

    const updatedSnap = await taskRef.get();
    const updatedData = updatedSnap.data();
    console.log("  [Planner->Today] Task marked done, status:", updatedData.status);
    assert.strictEqual(updatedData.status, "completed");
  });
});
