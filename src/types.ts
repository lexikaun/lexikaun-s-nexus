/**
 * @deprecated Legacy field from old Personal/Professional split.
 * In the unified Home workspace, tasks and goals are unified into one plan.
 */
export type SpaceType = 'personal' | 'professional';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type GoalStatus = 'active' | 'completed' | 'archived';

export type TaskStatus = 'planned' | 'in_progress' | 'completed' | 'skipped' | 'rescheduled';

export type BeatStatus = 'wip' | 'finished' | 'released' | 'archived';

export type RecurrenceType = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export interface RecurrenceRule {
  freq: 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom';
  days?: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  until?: string; // YYYY-MM-DD
}

export interface UserPreferences {
  theme?: 'option-e';
  soundEnabled?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
  preferences?: UserPreferences;
}

export interface Goal {
  id: string;
  userId: string;
  /** @deprecated Optional legacy field. New goals do not require or write a space tag. */
  space?: SpaceType;
  title: string;
  description?: string;
  deadline?: string; // YYYY-MM-DD
  date?: string; // Legacy compatibility
  priority: Priority;
  status: GoalStatus;
  createdAt?: number;
  updatedAt?: number;
}

export interface Task {
  id: string;
  userId: string;
  /** @deprecated Optional legacy field. New tasks do not require or write a space tag. */
  space?: SpaceType;
  goalId?: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h)
  endTime: string; // HH:mm (24h)
  duration?: number; // duration in minutes
  durationMinutes?: number; // Legacy compatibility
  priority: Priority;
  status: TaskStatus;
  associatedBeatId?: string; // Links task directly to a self-produced beat
  recurrence?: RecurrenceRule | RecurrenceType;
  notes?: string;
  completedAt?: number;
  actualDurationMinutes?: number;
  order?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  frequency: string; // e.g. "daily", "weekdays", "weekly"
  preferredTime?: string; // e.g. "Morning", "Evening", or "07:30"
  completionHistory?: Record<string, boolean>; // { "YYYY-MM-DD": boolean } direct lookup map
  streak: number;
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface Beat {
  id: string;
  userId: string;
  title: string;
  storagePath?: string; // users/{uid}/beats/{beatId}/{filename}
  audioUrl?: string; // signed URL or playback URL
  audioBlobId?: string; // indexedDB fallback key
  bpm: number; // strictly user-entered
  key: string; // strictly user-entered
  genre: string;
  tags: string[];
  status: BeatStatus;
  notes?: string;
  artworkPath?: string;
  coverUrl?: string;
  duration?: number; // seconds
  color?: string;
  isFavorite?: boolean;
  fileFormat?: string;
  fileSize?: number;
  createdAt: number;
  uploadedAt: number;
}

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  beatIds: string[];
  createdAt: number;
}

export interface MusicSession {
  id: string;
  userId: string;
  beatId?: string;
  beatTitle?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  durationSeconds?: number;
  notes?: string;
  createdAt?: number;
}

export interface DailyReview {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completedGoals?: number;
  goalsCompleted?: number;
  totalGoals?: number;
  completedTasks?: number;
  tasksCompleted?: number;
  tasksMissed?: number;
  tasksRescheduled?: number;
  skippedTasks?: number;
  plannedTime?: number; // in minutes
  totalPlannedMinutes?: number;
  completedTime?: number; // in minutes
  totalCompletedMinutes?: number;
  completionRate?: number;
  whatWentWell?: string;
  whatToImprove?: string;
  moodRating?: number;
  reflection?: string;
  createdAt?: number;
}

export interface TimeBlockSlot {
  start: string;
  end: string;
  startMinutes: number;
  endMinutes: number;
  task?: Task;
  isFreeTime: boolean;
  isCurrent: boolean;
  isPast: boolean;
}

export interface SmartRescheduleSuggestion {
  task: Task;
  unfinishedMinutes: number;
  suggestedStartTime: string;
  suggestedEndTime: string;
  targetDate: string;
  reason: string;
}
