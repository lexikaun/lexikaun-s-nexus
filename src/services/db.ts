import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc,
  getDocFromServer,
  updateDoc,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Goal, Task, Beat, Playlist, MusicSession, DailyReview, Habit } from '../types';
import { generateSampleData } from './sampleData';

const LOCAL_STORAGE_KEY_PREFIX = 'lifebeatos_';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as mandated by skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Clean undefined fields before writing to Firestore
function sanitizeDoc<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      clean[k] = v;
    }
  }
  return clean;
}

// Helper to save to local cache
function saveLocal<T>(key: string, data: T) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn('Local storage write error:', e);
  }
}

// Helper to load from local cache
export function loadLocal<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Initialize user data: seed with sample data in Firestore and local cache
 */
export async function initUserData(userId: string) {
  if (!userId) return;
  const localSeedKey = `seeded_${userId}`;
  const alreadySeeded = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + localSeedKey);

  if (!alreadySeeded) {
    const seed = generateSampleData(userId);
    saveLocal(`goals_${userId}`, seed.goals);
    saveLocal(`tasks_${userId}`, seed.tasks);
    saveLocal(`beats_${userId}`, seed.beats);
    saveLocal(`playlists_${userId}`, seed.playlists);
    saveLocal(`reviews_${userId}`, seed.reviews);
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + localSeedKey, 'true');

    // If authenticated user matches, seed to Firestore
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        for (const g of seed.goals) {
          const path = `users/${userId}/goals/${g.id}`;
          await setDoc(doc(db, 'users', userId, 'goals', g.id), sanitizeDoc(g));
        }
        for (const t of seed.tasks) {
          await setDoc(doc(db, 'users', userId, 'tasks', t.id), sanitizeDoc(t));
        }
        for (const b of seed.beats) {
          await setDoc(doc(db, 'users', userId, 'beats', b.id), sanitizeDoc(b));
        }
        for (const p of seed.playlists) {
          await setDoc(doc(db, 'users', userId, 'playlists', p.id), sanitizeDoc(p));
        }
      } catch (err) {
        console.warn('Initial seeding error:', err);
      }
    }
  }
}

/**
 * Realtime Goal subscriptions & operations
 */
export function subscribeToGoals(userId: string, callback: (goals: Goal[]) => void): () => void {
  const localGoals = loadLocal<Goal[]>(`goals_${userId}`, []);
  callback(localGoals);

  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {};
  }

  const path = `users/${userId}/goals`;
  try {
    const goalsRef = collection(db, 'users', userId, 'goals');
    const unsubscribe = onSnapshot(
      goalsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const goals = snapshot.docs.map((docSnap) => docSnap.data() as Goal);
          saveLocal(`goals_${userId}`, goals);
          callback(goals);
        } else if (localGoals.length > 0) {
          callback(localGoals);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

export async function createGoal(userId: string, goal: Goal): Promise<Goal> {
  const goalWithTimestamps: Goal = {
    ...goal,
    userId,
    createdAt: goal.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
  await saveGoal(userId, goalWithTimestamps);
  return goalWithTimestamps;
}

export async function getGoal(userId: string, goalId: string): Promise<Goal | null> {
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const snap = await getDoc(doc(db, 'users', userId, 'goals', goalId));
      if (snap.exists()) {
        return snap.data() as Goal;
      }
    } catch (err) {
      console.warn('Firestore getGoal error, falling back to local cache:', err);
    }
  }
  const localGoals = loadLocal<Goal[]>(`goals_${userId}`, []);
  return localGoals.find((g) => g.id === goalId) || null;
}

export async function getGoals(userId: string): Promise<Goal[]> {
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'goals'));
      if (!snap.empty) {
        const goals = snap.docs.map((d) => d.data() as Goal);
        saveLocal(`goals_${userId}`, goals);
        return goals;
      }
    } catch (err) {
      console.warn('Firestore getGoals error, falling back to local cache:', err);
    }
  }
  return loadLocal<Goal[]>(`goals_${userId}`, []);
}

export async function updateGoal(userId: string, goalId: string, updates: Partial<Goal>): Promise<Goal> {
  const existingGoal = await getGoal(userId, goalId);
  const updatedGoal: Goal = {
    ...(existingGoal || { id: goalId, userId, title: '', priority: 'medium', status: 'active' }),
    ...updates,
    id: goalId,
    userId,
    updatedAt: Date.now(),
  };
  await saveGoal(userId, updatedGoal);
  return updatedGoal;
}

export async function deleteGoal(userId: string, goalId: string): Promise<void> {
  return deleteGoalDoc(userId, goalId);
}

export async function saveGoal(userId: string, goal: Goal): Promise<void> {
  const current = loadLocal<Goal[]>(`goals_${userId}`, []);
  const idx = current.findIndex((g) => g.id === goal.id);
  let updated: Goal[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = goal;
  } else {
    updated = [goal, ...current];
  }
  saveLocal(`goals_${userId}`, updated);

  if (!auth.currentUser || auth.currentUser.uid !== userId) return;

  const path = `users/${userId}/goals/${goal.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'goals', goal.id), sanitizeDoc(goal));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteGoalDoc(userId: string, goalId: string): Promise<void> {
  const current = loadLocal<Goal[]>(`goals_${userId}`, []);
  saveLocal(`goals_${userId}`, current.filter((g) => g.id !== goalId));

  if (!auth.currentUser || auth.currentUser.uid !== userId) return;

  const path = `users/${userId}/goals/${goalId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'goals', goalId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Realtime Habit subscriptions & operations
 */
export function subscribeToHabits(userId: string, callback: (habits: Habit[]) => void): () => void {
  const localHabits = loadLocal<Habit[]>(`habits_${userId}`, []);
  callback(localHabits);

  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {};
  }

  const path = `users/${userId}/habits`;
  try {
    const habitsRef = collection(db, 'users', userId, 'habits');
    const unsubscribe = onSnapshot(
      habitsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const habits = snapshot.docs.map((docSnap) => docSnap.data() as Habit);
          saveLocal(`habits_${userId}`, habits);
          callback(habits);
        } else if (localHabits.length > 0) {
          callback(localHabits);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

export async function createHabit(userId: string, habit: Habit): Promise<Habit> {
  const habitWithTimestamps: Habit = {
    ...habit,
    userId,
    completionHistory: habit.completionHistory || {},
    streak: habit.streak || 0,
    createdAt: habit.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
  await saveHabit(userId, habitWithTimestamps);
  return habitWithTimestamps;
}

export async function getHabit(userId: string, habitId: string): Promise<Habit | null> {
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const snap = await getDoc(doc(db, 'users', userId, 'habits', habitId));
      if (snap.exists()) {
        return snap.data() as Habit;
      }
    } catch (err) {
      console.warn('Firestore getHabit error, falling back to local cache:', err);
    }
  }
  const localHabits = loadLocal<Habit[]>(`habits_${userId}`, []);
  return localHabits.find((h) => h.id === habitId) || null;
}

export async function getHabits(userId: string): Promise<Habit[]> {
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'habits'));
      if (!snap.empty) {
        const habits = snap.docs.map((d) => d.data() as Habit);
        saveLocal(`habits_${userId}`, habits);
        return habits;
      }
    } catch (err) {
      console.warn('Firestore getHabits error, falling back to local cache:', err);
    }
  }
  return loadLocal<Habit[]>(`habits_${userId}`, []);
}

export async function updateHabit(userId: string, habitId: string, updates: Partial<Habit>): Promise<Habit> {
  const existingHabit = await getHabit(userId, habitId);
  const updatedHabit: Habit = {
    ...(existingHabit || {
      id: habitId,
      userId,
      name: '',
      frequency: 'daily',
      streak: 0,
      completionHistory: {},
    }),
    ...updates,
    id: habitId,
    userId,
    updatedAt: Date.now(),
  };
  await saveHabit(userId, updatedHabit);
  return updatedHabit;
}

export async function toggleHabitDate(userId: string, habitId: string, date: string): Promise<Habit> {
  const habit = await getHabit(userId, habitId);
  if (!habit) throw new Error(`Habit not found: ${habitId}`);
  const currentHistory = habit.completionHistory || {};
  const isCurrentlyDone = !!currentHistory[date];
  const newHistory = { ...currentHistory, [date]: !isCurrentlyDone };
  return updateHabit(userId, habitId, { completionHistory: newHistory });
}

export async function deleteHabit(userId: string, habitId: string): Promise<void> {
  return deleteHabitDoc(userId, habitId);
}

export async function saveHabit(userId: string, habit: Habit): Promise<void> {
  const current = loadLocal<Habit[]>(`habits_${userId}`, []);
  const idx = current.findIndex((h) => h.id === habit.id);
  let updated: Habit[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = habit;
  } else {
    updated = [habit, ...current];
  }
  saveLocal(`habits_${userId}`, updated);

  if (!auth.currentUser || auth.currentUser.uid !== userId) return;

  const path = `users/${userId}/habits/${habit.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'habits', habit.id), sanitizeDoc(habit));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteHabitDoc(userId: string, habitId: string): Promise<void> {
  const current = loadLocal<Habit[]>(`habits_${userId}`, []);
  saveLocal(`habits_${userId}`, current.filter((h) => h.id !== habitId));

  if (!auth.currentUser || auth.currentUser.uid !== userId) return;

  const path = `users/${userId}/habits/${habitId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'habits', habitId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Realtime Task subscriptions & operations
 */
export function subscribeToTasks(userId: string, callback: (tasks: Task[]) => void): () => void {
  const localTasks = loadLocal<Task[]>(`tasks_${userId}`, []);
  callback(localTasks);

  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {};
  }

  const path = `users/${userId}/tasks`;
  try {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const unsubscribe = onSnapshot(
      tasksRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const tasks = snapshot.docs.map((docSnap) => docSnap.data() as Task);
          saveLocal(`tasks_${userId}`, tasks);
          callback(tasks);
        } else if (localTasks.length > 0) {
          callback(localTasks);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

export async function createTask(userId: string, task: Task): Promise<Task> {
  const taskWithTimestamps: Task = {
    ...task,
    userId,
    createdAt: task.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
  await saveTask(userId, taskWithTimestamps);
  return taskWithTimestamps;
}

export async function getTask(userId: string, taskId: string): Promise<Task | null> {
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const snap = await getDoc(doc(db, 'users', userId, 'tasks', taskId));
      if (snap.exists()) {
        return snap.data() as Task;
      }
    } catch (err) {
      console.warn('Firestore getTask error, falling back to local cache:', err);
    }
  }
  const localTasks = loadLocal<Task[]>(`tasks_${userId}`, []);
  return localTasks.find((t) => t.id === taskId) || null;
}

export async function getTasks(userId: string): Promise<Task[]> {
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'tasks'));
      if (!snap.empty) {
        const tasks = snap.docs.map((d) => d.data() as Task);
        saveLocal(`tasks_${userId}`, tasks);
        return tasks;
      }
    } catch (err) {
      console.warn('Firestore getTasks error, falling back to local cache:', err);
    }
  }
  return loadLocal<Task[]>(`tasks_${userId}`, []);
}

export async function updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<Task> {
  const existingTask = await getTask(userId, taskId);
  const updatedTask: Task = {
    ...(existingTask || {
      id: taskId,
      userId,
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      priority: 'medium',
      status: 'planned',
    }),
    ...updates,
    id: taskId,
    userId,
    updatedAt: Date.now(),
  };
  await saveTask(userId, updatedTask);
  return updatedTask;
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  return deleteTaskDoc(userId, taskId);
}

export async function saveTask(userId: string, task: Task): Promise<void> {
  const current = loadLocal<Task[]>(`tasks_${userId}`, []);
  const idx = current.findIndex((t) => t.id === task.id);
  let updated: Task[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = task;
  } else {
    updated = [...current, task];
  }
  saveLocal(`tasks_${userId}`, updated);

  if (!auth.currentUser || auth.currentUser.uid !== userId) return;

  const path = `users/${userId}/tasks/${task.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'tasks', task.id), sanitizeDoc(task));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveMultipleTasks(userId: string, tasks: Task[]): Promise<void> {
  saveLocal(`tasks_${userId}`, tasks);

  if (!auth.currentUser || auth.currentUser.uid !== userId) return;

  for (const t of tasks) {
    const path = `users/${userId}/tasks/${t.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'tasks', t.id), sanitizeDoc(t));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
}

export async function deleteTaskDoc(userId: string, taskId: string): Promise<void> {
  const current = loadLocal<Task[]>(`tasks_${userId}`, []);
  saveLocal(`tasks_${userId}`, current.filter((t) => t.id !== taskId));

  if (!auth.currentUser || auth.currentUser.uid !== userId) return;

  const path = `users/${userId}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'tasks', taskId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Realtime Beats subscriptions & operations
 */
export function subscribeToBeats(userId: string, callback: (beats: Beat[]) => void): () => void {
  const localBeats = loadLocal<Beat[]>(`beats_${userId}`, []);
  callback(localBeats);

  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {};
  }

  const path = `users/${userId}/beats`;
  try {
    const beatsRef = collection(db, 'users', userId, 'beats');
    const unsubscribe = onSnapshot(
      beatsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const beats = snapshot.docs.map((docSnap) => docSnap.data() as Beat);
          saveLocal(`beats_${userId}`, beats);
          callback(beats);
        } else if (localBeats.length > 0) {
          callback(localBeats);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

export async function saveBeat(userId: string, beat: Beat): Promise<void> {
  const current = loadLocal<Beat[]>(`beats_${userId}`, []);
  const idx = current.findIndex((b) => b.id === beat.id);
  let updated: Beat[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = beat;
  } else {
    updated = [beat, ...current];
  }
  saveLocal(`beats_${userId}`, updated);

  if (!auth.currentUser || auth.currentUser.uid !== userId) return;

  const path = `users/${userId}/beats/${beat.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'beats', beat.id), sanitizeDoc(beat));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteBeatDoc(userId: string, beatId: string): Promise<void> {
  const current = loadLocal<Beat[]>(`beats_${userId}`, []);
  saveLocal(`beats_${userId}`, current.filter((b) => b.id !== beatId));

  if (!auth.currentUser || auth.currentUser.uid !== userId) return;

  const path = `users/${userId}/beats/${beatId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'beats', beatId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Playlists subscriptions & operations
 */
export function subscribeToPlaylists(userId: string, callback: (playlists: Playlist[]) => void): () => void {
  const localPlaylists = loadLocal<Playlist[]>(`playlists_${userId}`, []);
  callback(localPlaylists);

  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {};
  }

  const path = `users/${userId}/playlists`;
  try {
    const playlistsRef = collection(db, 'users', userId, 'playlists');
    const unsubscribe = onSnapshot(
      playlistsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const playlists = snapshot.docs.map((docSnap) => docSnap.data() as Playlist);
          saveLocal(`playlists_${userId}`, playlists);
          callback(playlists);
        } else if (localPlaylists.length > 0) {
          callback(localPlaylists);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

export async function savePlaylist(userId: string, playlist: Playlist): Promise<void> {
  const current = loadLocal<Playlist[]>(`playlists_${userId}`, []);
  const idx = current.findIndex((p) => p.id === playlist.id);
  let updated: Playlist[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = playlist;
  } else {
    updated = [playlist, ...current];
  }
  saveLocal(`playlists_${userId}`, updated);

  if (!auth.currentUser || auth.currentUser.uid !== userId) return;

  const path = `users/${userId}/playlists/${playlist.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'playlists', playlist.id), sanitizeDoc(playlist));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deletePlaylistDoc(userId: string, playlistId: string): Promise<void> {
  const current = loadLocal<Playlist[]>(`playlists_${userId}`, []);
  saveLocal(`playlists_${userId}`, current.filter((p) => p.id !== playlistId));

  if (!auth.currentUser || auth.currentUser.uid !== userId) return;

  const path = `users/${userId}/playlists/${playlistId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'playlists', playlistId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Music Session operations
 */
export async function saveMusicSession(userId: string, session: MusicSession): Promise<void> {
  const current = loadLocal<MusicSession[]>(`sessions_${userId}`, []);
  saveLocal(`sessions_${userId}`, [session, ...current]);

  if (!auth.currentUser || auth.currentUser.uid !== userId) return;

  const path = `users/${userId}/musicSessions/${session.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'musicSessions', session.id), sanitizeDoc(session));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function subscribeToMusicSessions(userId: string, callback: (sessions: MusicSession[]) => void): () => void {
  const localSessions = loadLocal<MusicSession[]>(`sessions_${userId}`, []);
  callback(localSessions);

  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {};
  }

  const path = `users/${userId}/musicSessions`;
  try {
    const ref = collection(db, 'users', userId, 'musicSessions');
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.empty) {
          const sessions = snapshot.docs.map((docSnap) => docSnap.data() as MusicSession);
          saveLocal(`sessions_${userId}`, sessions);
          callback(sessions);
        } else {
          callback(localSessions);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

/**
 * Daily Review operations
 */
export async function saveDailyReviewDoc(userId: string, review: DailyReview): Promise<void> {
  const current = loadLocal<DailyReview[]>(`reviews_${userId}`, []);
  const idx = current.findIndex((r) => r.id === review.id || r.date === review.date);
  let updated: DailyReview[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = review;
  } else {
    updated = [review, ...current];
  }
  saveLocal(`reviews_${userId}`, updated);

  if (!auth.currentUser || auth.currentUser.uid !== userId) return;

  const path = `users/${userId}/dailyReviews/${review.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'dailyReviews', review.id), sanitizeDoc(review));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function subscribeToDailyReviews(userId: string, callback: (reviews: DailyReview[]) => void): () => void {
  const local = loadLocal<DailyReview[]>(`reviews_${userId}`, []);
  callback(local);

  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {};
  }

  const path = `users/${userId}/dailyReviews`;
  try {
    const ref = collection(db, 'users', userId, 'dailyReviews');
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.empty) {
          const reviews = snapshot.docs.map((d) => d.data() as DailyReview);
          saveLocal(`reviews_${userId}`, reviews);
          callback(reviews);
        } else {
          callback(local);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}
