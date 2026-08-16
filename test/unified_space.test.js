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

describe("Phase 1 — Unified Home Data Layer (No space split)", () => {
  it("saves new tasks without space field and queries legacy + new tasks in one unified pool", async () => {
    const db = testEnv.authenticatedContext("user_unified_1").firestore();
    const tasksColl = db.collection("users/user_unified_1/tasks");

    // 1. Legacy task with space: "personal"
    const legacyPersonalTask = {
      id: "task_legacy_personal",
      userId: "user_unified_1",
      space: "personal",
      title: "Morning Routine & Coffee",
      date: "2026-08-17",
      startTime: "07:30",
      endTime: "08:15",
      priority: "medium",
      status: "completed",
      createdAt: Date.now() - 10000,
      updatedAt: Date.now() - 10000,
    };
    await assertSucceeds(tasksColl.doc(legacyPersonalTask.id).set(legacyPersonalTask));

    // 2. Legacy task with space: "professional"
    const legacyProfessionalTask = {
      id: "task_legacy_prof",
      userId: "user_unified_1",
      space: "professional",
      title: "EP Vocal Arrangement",
      date: "2026-08-17",
      startTime: "10:00",
      endTime: "12:00",
      priority: "high",
      status: "in_progress",
      createdAt: Date.now() - 5000,
      updatedAt: Date.now() - 5000,
    };
    await assertSucceeds(tasksColl.doc(legacyProfessionalTask.id).set(legacyProfessionalTask));

    // 3. New task without any space field (Phase 1 standard)
    const newUnifiedTask = {
      id: "task_new_unified",
      userId: "user_unified_1",
      title: "Unified Daily Deep Work Block",
      date: "2026-08-17",
      startTime: "14:00",
      endTime: "16:00",
      priority: "critical",
      status: "planned",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(tasksColl.doc(newUnifiedTask.id).set(newUnifiedTask));

    // Verify all 3 tasks are retrieved together in one shared list
    const snapshot = await tasksColl.get();
    assert.strictEqual(snapshot.docs.length, 3, "Expected exactly 3 tasks in unified pool");

    const retrievedIds = snapshot.docs.map((doc) => doc.id);
    assert.ok(retrievedIds.includes("task_legacy_personal"));
    assert.ok(retrievedIds.includes("task_legacy_prof"));
    assert.ok(retrievedIds.includes("task_new_unified"));

    const newSavedDoc = snapshot.docs.find((d) => d.id === "task_new_unified").data();
    assert.strictEqual(newSavedDoc.space, undefined, "New task should not contain a space field");
    console.log("  [Unified Data Layer] Successfully queried 3 tasks across legacy personal, legacy prof, and new unified task with no space tag.");
  });

  it("saves new goals without space field and queries legacy + new goals in one unified pool", async () => {
    const db = testEnv.authenticatedContext("user_unified_2").firestore();
    const goalsColl = db.collection("users/user_unified_2/goals");

    // 1. Legacy goal with space
    const legacyGoal = {
      id: "goal_legacy_prof",
      userId: "user_unified_2",
      space: "professional",
      title: "Release 5-Track EP",
      priority: "high",
      status: "active",
      createdAt: Date.now() - 5000,
      updatedAt: Date.now() - 5000,
    };
    await assertSucceeds(goalsColl.doc(legacyGoal.id).set(legacyGoal));

    // 2. New unified goal without space
    const newUnifiedGoal = {
      id: "goal_new_unified",
      userId: "user_unified_2",
      title: "Complete Marathon Training & Music Release",
      priority: "critical",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(goalsColl.doc(newUnifiedGoal.id).set(newUnifiedGoal));

    const snapshot = await goalsColl.get();
    assert.strictEqual(snapshot.docs.length, 2, "Expected 2 goals in unified pool");

    const newGoalDoc = snapshot.docs.find((d) => d.id === "goal_new_unified").data();
    assert.strictEqual(newGoalDoc.space, undefined, "New goal should not contain a space field");
    console.log("  [Unified Data Layer] Successfully saved and retrieved goals without space tag.");
  });
});
