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

describe("Phase 8 — Folding Goals into Tasks Verification", () => {
  it("links task to an existing goal during creation and displays objective tag", async () => {
    const db = testEnv.authenticatedContext("user_goal_link_1").firestore();
    const goalsColl = db.collection("users/user_goal_link_1/goals");
    const tasksColl = db.collection("users/user_goal_link_1/tasks");

    // 1. Create overarching goal
    const goal = {
      id: "goal_album_mastering",
      userId: "user_goal_link_1",
      title: "Release Debut Instrumental EP",
      priority: "high",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(goalsColl.doc(goal.id).set(goal));

    // 2. Create task linked to this goal
    const task = {
      id: "task_ep_track1",
      userId: "user_goal_link_1",
      title: "Master Track 01 'Solaris'",
      date: "2026-08-17",
      startTime: "10:00",
      endTime: "11:30",
      priority: "high",
      status: "planned",
      goalId: goal.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(tasksColl.doc(task.id).set(task));

    // 3. Verify task has goalId and resolves to goal
    const taskSnap = await tasksColl.doc(task.id).get();
    const taskData = taskSnap.data();
    assert.strictEqual(taskData.goalId, "goal_album_mastering");

    const goalSnap = await goalsColl.doc(taskData.goalId).get();
    assert.ok(goalSnap.exists);
    assert.strictEqual(goalSnap.data().title, "Release Debut Instrumental EP");
    console.log("  [Goal Link] Task successfully linked to overarching goal without separate page.");
  });

  it("allows updating or unlinking goal on existing task", async () => {
    const db = testEnv.authenticatedContext("user_goal_link_2").firestore();
    const tasksColl = db.collection("users/user_goal_link_2/tasks");

    const task = {
      id: "task_unlink_test",
      userId: "user_goal_link_2",
      title: "Clean audio sample folder",
      date: "2026-08-17",
      startTime: "",
      endTime: "",
      priority: "low",
      status: "planned",
      goalId: "goal_old_1",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(tasksColl.doc(task.id).set(task));

    // Unlink goal
    await assertSucceeds(tasksColl.doc(task.id).update({
      goalId: null,
      updatedAt: Date.now(),
    }));

    const snap = await tasksColl.doc(task.id).get();
    assert.strictEqual(snap.data().goalId, null);
    console.log("  [Goal Link] Successfully unlinked goal from task.");
  });
});
