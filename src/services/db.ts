import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDocFromServer,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Goal, Task, Beat, Playlist, MusicSession, DailyReview } from '../types';
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
