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

describe("Phase 10 — Full System Verification & Comprehensive End-to-End Test", () => {
  it("executes complete lifecycle: create across domains, reschedule, complete, goal link, delete", async () => {
    const db = testEnv.authenticatedContext("user_e2e_verified").firestore();
    const tasksColl = db.collection("users/user_e2e_verified/tasks");
    const goalsColl = db.collection("users/user_e2e_verified/goals");

    // 1. Create Overarching Goal
    const epGoal = {
      id: "goal_album_2026",
      userId: "user_e2e_verified",
      title: "Complete 5-Track Instrumental EP",
      priority: "high",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(goalsColl.doc(epGoal.id).set(epGoal));

    // 2. Create tasks across multiple domains (Music production + personal planning)
    const task1 = {
      id: "task_e2e_1",
      userId: "user_e2e_verified",
      title: "Audio Stems Export for Track 3",
      date: "2026-08-17",
      startTime: "10:00",
      endTime: "11:30",
      durationMinutes: 90,
      priority: "high",
      status: "planned",
      goalId: epGoal.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const task2 = {
      id: "task_e2e_2",
      userId: "user_e2e_verified",
      title: "Grocery run & studio supplies",
      date: "2026-08-17",
      startTime: "",
      endTime: "",
      priority: "medium",
      status: "planned",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const task3 = {
      id: "task_e2e_3",
      userId: "user_e2e_verified",
      title: "Mastering session with engineer",
      date: "2026-08-18",
      startTime: "14:00",
      endTime: "16:00",
      durationMinutes: 120,
      priority: "critical",
      status: "planned",
      goalId: epGoal.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await assertSucceeds(tasksColl.doc(task1.id).set(task1));
    await assertSucceeds(tasksColl.doc(task2.id).set(task2));
    await assertSucceeds(tasksColl.doc(task3.id).set(task3));

    // 3. Verify all tasks query in one unified pool
    const snap = await tasksColl.get();
    assert.strictEqual(snap.docs.length, 3, "All 3 tasks exist in unified pool");

    // 4. Reschedule task2 to a scheduled time on 2026-08-18
    await assertSucceeds(tasksColl.doc(task2.id).update({
      date: "2026-08-18",
      startTime: "11:00",
      endTime: "11:45",
      durationMinutes: 45,
      updatedAt: Date.now(),
    }));
    const task2Updated = (await tasksColl.doc(task2.id).get()).data();
    assert.strictEqual(task2Updated.date, "2026-08-18");
    assert.strictEqual(task2Updated.startTime, "11:00");

    // 5. Complete task 1 and calculate completion metrics
    const completedAt = Date.now();
    await assertSucceeds(tasksColl.doc(task1.id).update({
      status: "completed",
      completedAt: completedAt,
      updatedAt: completedAt,
    }));

    const day1Tasks = (await tasksColl.where("date", "==", "2026-08-17").get()).docs.map(d => d.data());
    assert.strictEqual(day1Tasks.length, 1);
    assert.strictEqual(day1Tasks[0].status, "completed");

    const day2Tasks = (await tasksColl.where("date", "==", "2026-08-18").get()).docs.map(d => d.data());
    assert.strictEqual(day2Tasks.length, 2);

    // 6. Delete task 3
    await assertSucceeds(tasksColl.doc(task3.id).delete());
    const deletedSnap = await tasksColl.doc(task3.id).get();
    assert.strictEqual(deletedSnap.exists, false);

    console.log("  [E2E Verification] Successfully created, rescheduled, completed, and verified tasks across days.");
  });

  it("verifies Music Studio and Home data coexist without schema conflicts", async () => {
    const db = testEnv.authenticatedContext("user_music_home_1").firestore();
    const tasksColl = db.collection("users/user_music_home_1/tasks");
    const beatsColl = db.collection("users/user_music_home_1/beats");

    // Create a beat
    const beat = {
      id: "beat_solar_flare",
      userId: "user_music_home_1",
      title: "Solar Flare Beat",
      bpm: 128,
      musicalKey: "A Min",
      genre: "Afro-fusion",
      status: "ready_for_master",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(beatsColl.doc(beat.id).set(beat));

    // Create a task associated with the beat
    const task = {
      id: "task_finish_solar_flare",
      userId: "user_music_home_1",
      title: "Master and export Solar Flare",
      date: "2026-08-17",
      startTime: "13:00",
      endTime: "14:30",
      priority: "high",
      status: "planned",
      associatedBeatId: beat.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(tasksColl.doc(task.id).set(task));

    const beatSnap = await beatsColl.doc(beat.id).get();
    const taskSnap = await tasksColl.doc(task.id).get();

    assert.ok(beatSnap.exists);
    assert.strictEqual(beatSnap.data().bpm, 128);
    assert.ok(taskSnap.exists);
    assert.strictEqual(taskSnap.data().associatedBeatId, beat.id);

    console.log("  [Music + Home Verification] Confirmed seamless coexistence between Music Studio and Home Workspace.");
  });
});
