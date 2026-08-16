import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let testEnv;

before(async () => {
  // Initialize testing environment with our rules
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

describe("Firestore Security Rules (Goal/Task/Habit)", () => {
  it("should allow a user to read and write their own task", async () => {
    const db = testEnv.authenticatedContext("userA").firestore();
    const taskRef = db.doc("users/userA/tasks/task1");
    
    // Write own task
    await assertSucceeds(taskRef.set({
      id: "task1",
      userId: "userA",
      title: "My Task",
      date: "2026-08-17",
      startTime: "10:00",
      endTime: "11:00",
      priority: "medium",
      status: "planned",
      createdAt: 1234567890,
      updatedAt: 1234567890
    }));

    // Read own task
    await assertSucceeds(taskRef.get());
  });

  it("should deny a user from reading another user's task", async () => {
    const dbB = testEnv.authenticatedContext("userB").firestore();
    const taskRef = dbB.doc("users/userA/tasks/task1"); // trying to read userA's task

    await assertFails(taskRef.get());
  });

  it("should deny a user from writing to another user's tasks", async () => {
    const dbB = testEnv.authenticatedContext("userB").firestore();
    const taskRef = dbB.doc("users/userA/tasks/task2");

    await assertFails(taskRef.set({
      id: "task2",
      userId: "userA",
      title: "Hacked Task",
      date: "2026-08-17",
      startTime: "10:00",
      endTime: "11:00",
      priority: "medium",
      status: "planned",
      createdAt: 1234567890,
      updatedAt: 1234567890
    }));
  });
});
