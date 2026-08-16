import {
  initializeTestEnvironment,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';

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

describe("Phase 2.4 — Task CRUD (Direct Firestore verification)", () => {
  it("executes Task Create, Read, Update, Delete cycle", async () => {
    const db = testEnv.authenticatedContext("user_test_1").firestore();
    const taskRef = db.doc("users/user_test_1/tasks/task_crud_1");

    // 1. CREATE
    const sampleTask = {
      id: "task_crud_1",
      userId: "user_test_1",
      title: "Write baseline drums",
      space: "personal",
      date: "2026-08-17",
      startTime: "14:00",
      endTime: "15:30",
      priority: "high",
      status: "planned",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(taskRef.set(sampleTask));
    console.log("  [Task CRUD] Created task successfully:", sampleTask.id);

    // 2. READ
    const fetchedSnap = await taskRef.get();
    if (!fetchedSnap.exists) throw new Error("Task was not found after creation");
    const fetchedData = fetchedSnap.data();
    console.log("  [Task CRUD] Read task data:", fetchedData.title, "| status:", fetchedData.status);

    // 3. UPDATE
    const updatedTask = {
      ...fetchedData,
      status: "completed",
      completedAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(taskRef.set(updatedTask));
    console.log("  [Task CRUD] Updated task status to:", updatedTask.status);

    // 4. DELETE
    await assertSucceeds(taskRef.delete());
    const deletedSnap = await taskRef.get();
    if (deletedSnap.exists) throw new Error("Task still exists after delete");
    console.log("  [Task CRUD] Deleted task successfully. Document exists:", deletedSnap.exists);
  });
});

describe("Phase 2.5 — Goal CRUD (Direct Firestore verification)", () => {
  it("executes Goal Create, Read, Update, Delete cycle", async () => {
    const db = testEnv.authenticatedContext("user_test_1").firestore();
    const goalRef = db.doc("users/user_test_1/goals/goal_crud_1");

    // 1. CREATE
    const sampleGoal = {
      id: "goal_crud_1",
      userId: "user_test_1",
      title: "Finish 5 EP Demos",
      space: "professional",
      deadline: "2026-12-31",
      priority: "critical",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(goalRef.set(sampleGoal));
    console.log("  [Goal CRUD] Created goal successfully:", sampleGoal.id);

    // 2. READ
    const fetchedSnap = await goalRef.get();
    if (!fetchedSnap.exists) throw new Error("Goal was not found after creation");
    const fetchedData = fetchedSnap.data();
    console.log("  [Goal CRUD] Read goal data:", fetchedData.title, "| status:", fetchedData.status);

    // 3. UPDATE
    const updatedGoal = {
      ...fetchedData,
      title: "Finish 5 EP Demos (Mastered)",
      status: "completed",
      updatedAt: Date.now(),
    };
    await assertSucceeds(goalRef.set(updatedGoal));
    console.log("  [Goal CRUD] Updated goal title/status to:", updatedGoal.title, "|", updatedGoal.status);

    // 4. DELETE
    await assertSucceeds(goalRef.delete());
    const deletedSnap = await goalRef.get();
    if (deletedSnap.exists) throw new Error("Goal still exists after delete");
    console.log("  [Goal CRUD] Deleted goal successfully. Document exists:", deletedSnap.exists);
  });
});

describe("Phase 2.6 — Habit CRUD and completionHistory map (Direct Firestore verification)", () => {
  it("writes, reads, updates completionHistory map and deletes Habit", async () => {
    const db = testEnv.authenticatedContext("user_test_1").firestore();
    const habitRef = db.doc("users/user_test_1/habits/habit_crud_1");

    // 1. CREATE
    const sampleHabit = {
      id: "habit_crud_1",
      userId: "user_test_1",
      name: "Daily Sound Design (30m)",
      frequency: "daily",
      preferredTime: "08:00",
      streak: 3,
      completionHistory: {
        "2026-08-14": true,
        "2026-08-15": true,
        "2026-08-16": true,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await assertSucceeds(habitRef.set(sampleHabit));
    console.log("  [Habit CRUD] Created habit successfully:", sampleHabit.id);

    // 2. READ & VERIFY MAP SHAPE
    const fetchedSnap = await habitRef.get();
    if (!fetchedSnap.exists) throw new Error("Habit not found");
    const fetchedData = fetchedSnap.data();
    console.log("  [Habit CRUD] Read completionHistory keys:", Object.keys(fetchedData.completionHistory));
    if (fetchedData.completionHistory["2026-08-15"] !== true) {
      throw new Error("completionHistory map shape is invalid");
    }

    // 3. UPDATE / TOGGLE DATE
    const updatedHistory = {
      ...fetchedData.completionHistory,
      "2026-08-17": true,
    };
    const updatedHabit = {
      ...fetchedData,
      completionHistory: updatedHistory,
      streak: 4,
      updatedAt: Date.now(),
    };
    await assertSucceeds(habitRef.set(updatedHabit));
    console.log("  [Habit CRUD] Updated completionHistory, new streak:", updatedHabit.streak);

    // 4. DELETE
    await assertSucceeds(habitRef.delete());
    const deletedSnap = await habitRef.get();
    if (deletedSnap.exists) throw new Error("Habit still exists after delete");
    console.log("  [Habit CRUD] Deleted habit successfully. Document exists:", deletedSnap.exists);
  });
});

