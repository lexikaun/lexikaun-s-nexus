export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type GoalStatus = 'active' | 'completed' | 'archived';

export type TaskStatus = 'planned' | 'in_progress' | 'completed' | 'skipped' | 'rescheduled';

export type BeatStatus = 'wip' | 'finished' | 'released' | 'archived';

export type RecurrenceType = 'none' | 'daily' | 'weekdays' | 'weekly';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  priority: Priority;
  status: GoalStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  userId: string;
  goalId?: string; // parent goal
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h)
  endTime: string; // HH:mm (24h)
  durationMinutes: number;
  priority: Priority;
  status: TaskStatus;
  notes?: string;
  recurrence?: RecurrenceType;
  associatedBeatId?: string; // Links task directly to a beat
  completedAt?: number;
  actualDurationMinutes?: number;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Beat {
  id: string;
  userId: string;
  title: string;
  audioUrl: string;
  audioBlobId?: string; // indexedDB fallback key for offline uploaded audio
  duration: number; // in seconds
  bpm: number;
  key: string;
  genre: string;
  tags: string[];
  status: BeatStatus;
  notes?: string;
  coverUrl?: string;
  color?: string; // aesthetic gradient color or accent
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
  durationSeconds: number;
  notes: string;
  createdAt: number;
}

export interface DailyReview {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  goalsCompleted: number;
  totalGoals: number;
  tasksCompleted: number;
  tasksMissed: number;
  tasksRescheduled: number;
  totalPlannedMinutes: number;
  totalCompletedMinutes: number;
  completionRate: number;
  whatWentWell: string;
  whatToImprove: string;
  moodRating?: number; // 1-5
  createdAt: number;
}

export interface TimeBlockSlot {
  start: string; // HH:mm
  end: string;   // HH:mm
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
