import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Goal,
  Task,
  DailyReview,
  TimeBlockSlot,
  SmartRescheduleSuggestion,
  TaskStatus,
  Priority,
} from '../types';
import {
  subscribeToGoals,
  subscribeToTasks,
  subscribeToDailyReviews,
  saveGoal,
  deleteGoalDoc,
  saveTask,
  saveMultipleTasks,
  deleteTaskDoc,
  saveDailyReviewDoc,
} from '../services/db';
import { useAuth } from './AuthContext';
import { getTodayDateString, generateSampleData } from '../services/sampleData';

interface PlannerContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  goals: Goal[];
  tasks: Task[];
  reviews: DailyReview[];
  currentTask: Task | null;
  nextTask: Task | null;
  currentSlotRemainingMinutes: number | null;
  currentFreeTimeSlot: { start: string; end: string; duration: number } | null;
  timeBlocks: TimeBlockSlot[];
  dailyProgressPercentage: number;
  completedTasksCount: number;
  remainingTasksCount: number;
  rescheduleSuggestions: SmartRescheduleSuggestion[];
  
  // Actions
  addGoal: (goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  
  addTask: (task: Omit<Task, 'id' | 'userId' | 'order' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  reorderTasks: (reorderedTasks: Task[]) => Promise<void>;
  setTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  
  applyRescheduleSuggestion: (suggestion: SmartRescheduleSuggestion) => Promise<void>;
  dismissRescheduleSuggestion: (taskId: string) => void;
  
  saveDailyReview: (review: Omit<DailyReview, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  getGoalProgress: (goalId: string) => { completed: number; total: number; percentage: number };
}

const PlannerContext = createContext<PlannerContextType | null>(null);

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTimeStr(minutes: number): string {
  const normalized = Math.max(0, Math.min(24 * 60 - 1, minutes));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reviews, setReviews] = useState<DailyReview[]>([]);
  const [dismissedRescheduleIds, setDismissedRescheduleIds] = useState<string[]>([]);
  const [nowMinute, setNowMinute] = useState<number>(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  // Update current time tick every 30 seconds
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setNowMinute(d.getHours() * 60 + d.getMinutes());
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Subscriptions to Firestore / local
  useEffect(() => {
    if (!user) {
      const sample = generateSampleData('guest_preview');
      setGoals(sample.goals);
      setTasks(sample.tasks);
      setReviews(sample.reviews);
      return;
    }

    const unsubGoals = subscribeToGoals(user.uid, (data) => setGoals(data));
    const unsubTasks = subscribeToTasks(user.uid, (data) => setTasks(data));
    const unsubReviews = subscribeToDailyReviews(user.uid, (data) => setReviews(data));

    return () => {
      unsubGoals();
      unsubTasks();
      unsubReviews();
    };
  }, [user]);

  // Filtered goals and tasks for the selected date
  const todayGoals = useMemo(() => {
    return goals.filter((g) => g.date === selectedDate || !g.date);
  }, [goals, selectedDate]);

  const todayTasks = useMemo(() => {
    return tasks
      .filter((t) => t.date === selectedDate)
      .sort((a, b) => {
        const startA = parseTimeToMinutes(a.startTime);
        const startB = parseTimeToMinutes(b.startTime);
        if (startA !== startB) return startA - startB;
        return a.order - b.order;
      });
  }, [tasks, selectedDate]);

  // Goal Progress Calculation helper
  const getGoalProgress = useCallback(
    (goalId: string) => {
      const goalTasks = tasks.filter((t) => t.goalId === goalId);
      if (goalTasks.length === 0) return { completed: 0, total: 0, percentage: 0 };
      const completed = goalTasks.filter((t) => t.status === 'completed').length;
      return {
        completed,
        total: goalTasks.length,
        percentage: Math.round((completed / goalTasks.length) * 100),
      };
    },
    [tasks]
  );

  // Time Blocking Timeline generator (covering 06:00 to 24:00 or full day)
  const timeBlocks = useMemo<TimeBlockSlot[]>(() => {
    const isToday = selectedDate === getTodayDateString();
    const sorted = [...todayTasks].sort(
      (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
    );

    const blocks: TimeBlockSlot[] = [];
    let currentPointer = 6 * 60; // start timeline at 06:00 AM

    for (const task of sorted) {
      const taskStart = parseTimeToMinutes(task.startTime);
      const taskEnd = parseTimeToMinutes(task.endTime);

      // If gap before task, insert free time slot
      if (taskStart > currentPointer) {
        blocks.push({
          start: minutesToTimeStr(currentPointer),
          end: minutesToTimeStr(taskStart),
          startMinutes: currentPointer,
          endMinutes: taskStart,
          isFreeTime: true,
          isCurrent: isToday && nowMinute >= currentPointer && nowMinute < taskStart,
          isPast: isToday && nowMinute >= taskStart,
        });
      }

      // Add task slot
      blocks.push({
        start: task.startTime,
        end: task.endTime,
        startMinutes: taskStart,
        endMinutes: taskEnd,
        task,
        isFreeTime: false,
        isCurrent: isToday && nowMinute >= taskStart && nowMinute < taskEnd,
        isPast: isToday && nowMinute >= taskEnd,
      });

      currentPointer = Math.max(currentPointer, taskEnd);
    }

    // Add trailing free time till end of day (23:59)
    if (currentPointer < 24 * 60) {
      blocks.push({
        start: minutesToTimeStr(currentPointer),
        end: '23:59',
        startMinutes: currentPointer,
        endMinutes: 24 * 60,
        isFreeTime: true,
        isCurrent: isToday && nowMinute >= currentPointer && nowMinute < 24 * 60,
        isPast: false,
      });
    }

    return blocks;
  }, [todayTasks, selectedDate, nowMinute]);

  // Find Current Active Task & Next Task
  const { currentTask, nextTask, currentSlotRemainingMinutes, currentFreeTimeSlot } = useMemo(() => {
    const isToday = selectedDate === getTodayDateString();
    if (!isToday) {
      return {
        currentTask: null,
        nextTask: todayTasks[0] || null,
        currentSlotRemainingMinutes: null,
        currentFreeTimeSlot: null,
      };
    }

    let current: Task | null = null;
    let next: Task | null = null;
    let remainingMinutes: number | null = null;
    let freeTime: { start: string; end: string; duration: number } | null = null;

    // Check if directly in a task's window
    for (let i = 0; i < todayTasks.length; i++) {
      const task = todayTasks[i];
      const start = parseTimeToMinutes(task.startTime);
      const end = parseTimeToMinutes(task.endTime);

      if (nowMinute >= start && nowMinute < end) {
        current = task;
        remainingMinutes = Math.max(1, end - nowMinute);
        next = todayTasks[i + 1] || null;
        break;
      }
    }

    // If no active task currently, find next upcoming task and free time slot
    if (!current) {
      // Find the upcoming task
      for (const task of todayTasks) {
        const start = parseTimeToMinutes(task.startTime);
        if (start > nowMinute) {
          next = task;
          break;
        }
      }

      // Check which free time block we are in
      for (const block of timeBlocks) {
        if (block.isFreeTime && block.isCurrent) {
          freeTime = {
            start: block.start,
            end: block.end,
            duration: block.endMinutes - block.startMinutes,
          };
          remainingMinutes = block.endMinutes - nowMinute;
          break;
        }
      }
    }

    return {
      currentTask: current,
      nextTask: next,
      currentSlotRemainingMinutes: remainingMinutes,
      currentFreeTimeSlot: freeTime,
    };
  }, [todayTasks, selectedDate, nowMinute, timeBlocks]);

  // Overall Daily Progress Calculations
  const { dailyProgressPercentage, completedTasksCount, remainingTasksCount } = useMemo(() => {
    if (todayTasks.length === 0) {
      return { dailyProgressPercentage: 0, completedTasksCount: 0, remainingTasksCount: 0 };
    }
    const completed = todayTasks.filter((t) => t.status === 'completed').length;
    const remaining = todayTasks.length - completed;
    const pct = Math.round((completed / todayTasks.length) * 100);
    return {
      dailyProgressPercentage: pct,
      completedTasksCount: completed,
      remainingTasksCount: remaining,
    };
  }, [todayTasks]);

  // Smart Rescheduling Algorithm
  // Scans for tasks that ended in the past today but remain 'planned' or 'in_progress'
  // Finds upcoming free-time gaps of sufficient duration and suggests rescheduling!
  const rescheduleSuggestions = useMemo<SmartRescheduleSuggestion[]>(() => {
    const isToday = selectedDate === getTodayDateString();
    if (!isToday) return [];

    const missedOrIncomplete = todayTasks.filter((task) => {
      if (dismissedRescheduleIds.includes(task.id)) return false;
      if (task.status === 'completed' || task.status === 'skipped' || task.status === 'rescheduled') {
        return false;
      }
      const endM = parseTimeToMinutes(task.endTime);
      // Ended at least 5 minutes ago and still not finished
      return endM + 5 <= nowMinute;
    });

    if (missedOrIncomplete.length === 0) return [];

    // Find free time slots starting after nowMinute
    const futureFreeSlots = timeBlocks.filter(
      (b) => b.isFreeTime && b.endMinutes > nowMinute + 15
    );

    const suggestions: SmartRescheduleSuggestion[] = [];

    for (const task of missedOrIncomplete) {
      const taskDuration = task.durationMinutes || 45;
      // Look for a suitable open slot
      let matchedSlot: { start: string; end: string } | null = null;

      for (const slot of futureFreeSlots) {
        const effectiveStartMin = Math.max(slot.startMinutes, Math.ceil(nowMinute / 15) * 15 + 15);
        if (slot.endMinutes - effectiveStartMin >= taskDuration) {
          const suggestedStart = minutesToTimeStr(effectiveStartMin);
          const suggestedEnd = minutesToTimeStr(effectiveStartMin + taskDuration);
          matchedSlot = { start: suggestedStart, end: suggestedEnd };
          break;
        }
      }

      // If no today slot has enough room, propose tomorrow morning slot
      if (matchedSlot) {
        suggestions.push({
          task,
          unfinishedMinutes: taskDuration,
          suggestedStartTime: matchedSlot.start,
          suggestedEndTime: matchedSlot.end,
          targetDate: selectedDate,
          reason: `Task was scheduled for ${task.startTime}–${task.endTime}. Slot found today at ${matchedSlot.start}.`,
        });
      } else {
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        suggestions.push({
          task,
          unfinishedMinutes: taskDuration,
          suggestedStartTime: '10:00',
          suggestedEndTime: minutesToTimeStr(10 * 60 + taskDuration),
          targetDate: tomorrow,
          reason: `No open slot today. Suggested for tomorrow morning at 10:00.`,
        });
      }
    }

    return suggestions;
  }, [todayTasks, selectedDate, nowMinute, timeBlocks, dismissedRescheduleIds]);

  // Actions
  const addGoal = async (goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    const newGoal: Goal = {
      ...goalData,
      id: 'goal_' + Math.random().toString(36).substring(2, 9),
      userId: user.uid,
      createdAt: now,
      updatedAt: now,
    };
    await saveGoal(user.uid, newGoal);
  };

  const updateGoal = async (goal: Goal) => {
    if (!user) return;
    const updated = { ...goal, updatedAt: Date.now() };
    await saveGoal(user.uid, updated);
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return;
    await deleteGoalDoc(user.uid, goalId);
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'userId' | 'order' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    const order = todayTasks.length + 1;
    const newTask: Task = {
      ...taskData,
      id: 'task_' + Math.random().toString(36).substring(2, 9),
      userId: user.uid,
      order,
      createdAt: now,
      updatedAt: now,
    };
    await saveTask(user.uid, newTask);
  };

  const updateTask = async (task: Task) => {
    if (!user) return;
    const updated = { ...task, updatedAt: Date.now() };
    await saveTask(user.uid, updated);
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    await deleteTaskDoc(user.uid, taskId);
  };

  const reorderTasks = async (reordered: Task[]) => {
    if (!user) return;
    const updated = reordered.map((t, idx) => ({ ...t, order: idx + 1, updatedAt: Date.now() }));
    await saveMultipleTasks(user.uid, updated);
  };

  const setTaskStatus = async (taskId: string, status: TaskStatus) => {
    if (!user) return;
    const t = tasks.find((item) => item.id === taskId);
    if (!t) return;
    const updated: Task = {
      ...t,
      status,
      completedAt: status === 'completed' ? Date.now() : undefined,
      actualDurationMinutes: status === 'completed' ? t.durationMinutes : t.actualDurationMinutes,
      updatedAt: Date.now(),
    };
    await saveTask(user.uid, updated);
  };

  const applyRescheduleSuggestion = async (suggestion: SmartRescheduleSuggestion) => {
    if (!user) return;
    const updated: Task = {
      ...suggestion.task,
      date: suggestion.targetDate,
      startTime: suggestion.suggestedStartTime,
      endTime: suggestion.suggestedEndTime,
      status: 'rescheduled',
      updatedAt: Date.now(),
    };
    await saveTask(user.uid, updated);
    setDismissedRescheduleIds((prev) => [...prev, suggestion.task.id]);
  };

  const dismissRescheduleSuggestion = (taskId: string) => {
    setDismissedRescheduleIds((prev) => [...prev, taskId]);
  };

  const saveDailyReview = async (reviewData: Omit<DailyReview, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newRev: DailyReview = {
      ...reviewData,
      id: 'rev_' + (reviewData.date || getTodayDateString()),
      userId: user.uid,
      createdAt: Date.now(),
    };
    await saveDailyReviewDoc(user.uid, newRev);
  };

  return (
    <PlannerContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        goals: todayGoals,
        tasks: todayTasks,
        reviews,
        currentTask,
        nextTask,
        currentSlotRemainingMinutes,
        currentFreeTimeSlot,
        timeBlocks,
        dailyProgressPercentage,
        completedTasksCount,
        remainingTasksCount,
        rescheduleSuggestions,
        addGoal,
        updateGoal,
        deleteGoal,
        addTask,
        updateTask,
        deleteTask,
        reorderTasks,
        setTaskStatus,
        applyRescheduleSuggestion,
        dismissRescheduleSuggestion,
        saveDailyReview,
        getGoalProgress,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};
