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

describe("Phase 7 — Right-Side Timeline Panel Verification", () => {
  it("accurately partitions tasks into hourly timeline slots and isolates other dates", async () => {
    const db = testEnv.authenticatedContext("user_timeline_1").firestore();
    const tasksColl = db.collection("users/user_timeline_1/tasks");

    const t1 = {
      id: "task_t1",
      userId: "user_timeline_1",
      title: "Morning Drum Synthesis",
      date: "2026-08-17",
      startTime: "09:00",
      endTime: "10:00",
      priority: "high",
      status: "planned",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const t2 = {
      id: "task_t2",
      userId: "user_timeline_1",
      title: "Afternoon Vocal Chop Session",
      date: "2026-08-17",
      startTime: "14:30",
      endTime: "16:00",
      priority: "medium",
      status: "planned",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const t3OtherDay = {
      id: "task_t3",
      userId: "user_timeline_1",
      title: "Mastering on Tomorrow",
      date: "2026-08-18",
      startTime: "09:00",
      endTime: "10:00",
      priority: "low",
      status: "planned",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await assertSucceeds(tasksColl.doc(t1.id).set(t1));
    await assertSucceeds(tasksColl.doc(t2.id).set(t2));
    await assertSucceeds(tasksColl.doc(t3OtherDay.id).set(t3OtherDay));

    const snap = await tasksColl.where("date", "==", "2026-08-17").get();
    const dayTasks = snap.docs.map(d => d.data());

    // Filter for hour 9
    const hour9Tasks = dayTasks.filter(t => t.startTime && t.startTime.startsWith("09:"));
    assert.strictEqual(hour9Tasks.length, 1);
    assert.strictEqual(hour9Tasks[0].title, "Morning Drum Synthesis");

    // Filter for hour 14
    const hour14Tasks = dayTasks.filter(t => t.startTime && t.startTime.startsWith("14:"));
    assert.strictEqual(hour14Tasks.length, 1);
    assert.strictEqual(hour14Tasks[0].title, "Afternoon Vocal Chop Session");

    // Ensure 18-Aug task is not on 17-Aug timeline
    const otherDayMatch = dayTasks.filter(t => t.id === "task_t3");
    assert.strictEqual(otherDayMatch.length, 0);
    console.log("  [Timeline] Successfully partitioned timeline tasks by hour and date.");
  });

  it("synchronizes time slot changes onto timeline immediately", async () => {
    const db = testEnv.authenticatedContext("user_timeline_2").firestore();
    const tasksColl = db.collection("users/user_timeline_2/tasks");

    const task = {
      id: "task_sync_shift",
      userId: "user_timeline_2",
      title: "Mix Bus Compression",
      date: "2026-08-17",
      startTime: "10:00",
      endTime: "11:00",
      priority: "medium",
      status: "planned",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(tasksColl.doc(task.id).set(task));

    // Shift to 16:00
    await assertSucceeds(tasksColl.doc(task.id).update({
      startTime: "16:00",
      endTime: "17:30",
      updatedAt: Date.now(),
    }));

    const snap = await tasksColl.doc(task.id).get();
    const updated = snap.data();
    assert.strictEqual(updated.startTime, "16:00");
    assert.strictEqual(updated.endTime, "17:30");
    console.log("  [Timeline] Successfully verified time block shift synchronization.");
  });
});
