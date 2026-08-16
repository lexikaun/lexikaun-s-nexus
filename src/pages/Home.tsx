import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  PanelRightClose,
} from 'lucide-react';
import { DayColumn } from '../components/home/DayColumn';
import { CalendarPanel } from '../components/home/CalendarPanel';
import { TaskScheduleModal } from '../components/home/TaskScheduleModal';
import { useAuth } from '../context/useAuth';
import {
  subscribeToTasks,
  subscribeToGoals,
  updateTask,
  deleteTask,
  createTask,
  createGoal,
} from '../services/db';
import { expandRecurringTask } from '../utils/recurrence';
import { Task, Goal } from '../types';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.uid || 'local-producer-01';

  const [rawTasks, setRawTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Start date for the visible range
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Selected date for Timeline Panel detail preview
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Controls which day column has its quick-add open externally (e.g. from timeline click)
  const [activeAddingDate, setActiveAddingDate] = useState<string | null>(null);

  // Selected task for click-based detail/reschedule modal
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);

  // Number of visible day columns
  const visibleDaysCount = 4;

  // Timeline Panel collapsible toggle
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(true);

  // Subscribe to live tasks from Firestore / local cache (unified, no space filter)
  useEffect(() => {
    const unsubTasks = subscribeToTasks(userId, (loadedTasks) => {
      setRawTasks(loadedTasks);
    });
    const unsubGoals = subscribeToGoals(userId, (loadedGoals) => {
      setGoals(loadedGoals);
    });
    return () => {
      unsubTasks();
      unsubGoals();
    };
  }, [userId]);

  // Helper to shift start date
  const handleShiftDays = (days: number) => {
    const next = new Date(startDate);
    next.setDate(next.getDate() + days);
    setStartDate(next);
  };

  const handleGoToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setStartDate(today);
    setSelectedCalendarDate(today);
  };

  // Generate array of visible Date objects
  const visibleDates: Date[] = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < visibleDaysCount; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [startDate, visibleDaysCount]);

  // Calculate start & end ISO strings for the visible window
  const startIsoStr = visibleDates[0]?.toISOString().split('T')[0] || '';
  const endIsoStr =
    visibleDates[visibleDates.length - 1]?.toISOString().split('T')[0] || '';

  // Expand all recurring and non-recurring tasks across visible dates
  const expandedTasksByDate = useMemo(() => {
    const dateMap: Record<string, Task[]> = {};
    for (const d of visibleDates) {
      const dStr = d.toISOString().split('T')[0];
      dateMap[dStr] = [];
    }

    if (!startIsoStr || !endIsoStr) return dateMap;

    for (const t of rawTasks) {
      if (t.recurrence && t.recurrence !== 'none') {
        const occurrences = expandRecurringTask(t, startIsoStr, endIsoStr);
        for (const occ of occurrences) {
          if (dateMap[occ.date]) {
            dateMap[occ.date].push(occ);
          }
        }
      } else if (t.date && dateMap[t.date]) {
        dateMap[t.date].push(t);
      }
    }

    return dateMap;
  }, [rawTasks, visibleDates, startIsoStr, endIsoStr]);

  // Tasks for the selected calendar date
  const selectedDateStr = selectedCalendarDate.toISOString().split('T')[0];
  const tasksForSelectedDate = useMemo(() => {
    const list: Task[] = [];
    for (const t of rawTasks) {
      if (t.recurrence && t.recurrence !== 'none') {
        const occurrences = expandRecurringTask(t, selectedDateStr, selectedDateStr);
        list.push(...occurrences);
      } else if (t.date === selectedDateStr) {
        list.push(t);
      }
    }
    return list;
  }, [rawTasks, selectedDateStr]);

  // Create new task with instant optimistic UI
  const handleSaveNewTask = async (taskData: {
    title: string;
    date: string;
    startTime?: string;
    endTime?: string;
    durationMinutes?: number;
    priority?: any;
    goalId?: string;
    notes?: string;
  }) => {
    const newTask: Task = {
      id: 'task_' + Date.now(),
      userId,
      title: taskData.title,
      date: taskData.date,
      startTime: taskData.startTime || '',
      endTime: taskData.endTime || '',
      durationMinutes: taskData.durationMinutes || 30,
      priority: taskData.priority || 'medium',
      status: 'planned',
      goalId: taskData.goalId,
      notes: taskData.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Optimistic local update
    setRawTasks((prev) => [newTask, ...prev]);

    // Persist to Firestore / local storage
    await createTask(userId, newTask);
  };

  // Create new goal inline
  const handleCreateGoal = async (title: string): Promise<string> => {
    const newGoal: Goal = {
      id: 'goal_' + Date.now(),
      userId,
      title,
      priority: 'medium',
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setGoals((prev) => [...prev, newGoal]);
    await createGoal(userId, newGoal);
    return newGoal.id;
  };

  // Update existing task from Schedule/Detail modal
  const handleSaveTaskModal = async (updatedTask: Task) => {
    const realId = updatedTask.id.includes('_rec_')
      ? updatedTask.id.split('_rec_')[0]
      : updatedTask.id;

    // Optimistic local update
    setRawTasks((prev) =>
      prev.map((t) => (t.id === realId ? { ...updatedTask, id: realId } : t))
    );

    await updateTask(userId, realId, {
      title: updatedTask.title,
      date: updatedTask.date,
      startTime: updatedTask.startTime,
      endTime: updatedTask.endTime,
      priority: updatedTask.priority,
      goalId: updatedTask.goalId || undefined,
      notes: updatedTask.notes || undefined,
    });
  };

  // Quick move task to tomorrow
  const handleQuickRescheduleTomorrow = async (task: Task) => {
    const realId = task.id.includes('_rec_') ? task.id.split('_rec_')[0] : task.id;
    const baseDate = new Date(task.date || new Date().toISOString().split('T')[0]);
    baseDate.setDate(baseDate.getDate() + 1);
    const tomorrowStr = baseDate.toISOString().split('T')[0];

    // Optimistic update
    setRawTasks((prev) =>
      prev.map((t) => (t.id === realId ? { ...t, date: tomorrowStr } : t))
    );

    await updateTask(userId, realId, {
      date: tomorrowStr,
    });
  };

  // Toggle task completion
  const handleToggleComplete = async (task: Task) => {
    const realId = task.id.includes('_rec_') ? task.id.split('_rec_')[0] : task.id;
    const nextStatus = task.status === 'completed' ? 'planned' : 'completed';

    // Optimistic local update
    setRawTasks((prev) =>
      prev.map((t) => (t.id === realId ? { ...t, status: nextStatus } : t))
    );

    await updateTask(userId, realId, {
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? Date.now() : undefined,
    });
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    const realId = taskId.includes('_rec_') ? taskId.split('_rec_')[0] : taskId;

    // Optimistic local update
    setRawTasks((prev) => prev.filter((t) => t.id !== realId));

    await deleteTask(userId, realId);
  };

  // Date range title for header
  const firstDate = visibleDates[0];
  const lastDate = visibleDates[visibleDates.length - 1];
  const dateRangeLabel =
    firstDate && lastDate
      ? `${firstDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })} – ${lastDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`
      : '';

  const isToday = (d: Date) => {
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-bg-main overflow-hidden select-none">
      {/* 5. Calm, Clean Top Bar */}
      <header className="h-12 border-b border-border-main/50 px-4 flex items-center justify-between shrink-0 bg-bg-main">
        {/* Left: Navigation Controls & Date Range */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-surface/50 p-0.5 rounded-lg hairline-border">
            <button
              onClick={() => handleShiftDays(-1)}
              title="Previous day"
              className="p-1.5 rounded-md hover:bg-surface text-text-secondary hover:text-text-main transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoToToday}
              className="px-2.5 py-1 rounded-md text-xs font-mono font-medium hover:bg-surface text-text-main transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => handleShiftDays(1)}
              title="Next day"
              className="p-1.5 rounded-md hover:bg-surface text-text-secondary hover:text-text-main transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs font-mono font-medium text-text-secondary hidden sm:inline-block">
            {dateRangeLabel}
          </span>
        </div>

        {/* Right: Collapsible Timeline Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            title={isCalendarOpen ? 'Hide timeline panel' : 'Show timeline panel'}
            className={`p-1.5 px-2.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 text-xs ${
              isCalendarOpen
                ? 'bg-surface hairline-border text-text-main font-medium'
                : 'hover:bg-surface text-text-secondary hover:text-text-main'
            }`}
          >
            {isCalendarOpen ? (
              <PanelRightClose className="w-3.5 h-3.5 text-red-main" />
            ) : (
              <Calendar className="w-3.5 h-3.5" />
            )}
            <span className="text-xs font-mono">Timeline</span>
          </button>
        </div>
      </header>

      {/* Main Multi-Region Body: Day Columns + Collapsible Vertical Timeline Panel */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Central Multi-Day Horizontal Columns */}
        <main className="flex-1 flex overflow-x-auto overflow-y-hidden min-h-0 divide-x divide-border-main/30">
          {visibleDates.map((date) => {
            const dStr = date.toISOString().split('T')[0];
            const tasksForDay = expandedTasksByDate[dStr] || [];

            return (
              <DayColumn
                key={dStr}
                date={date}
                isToday={isToday(date)}
                tasks={tasksForDay}
                goals={goals}
                isAddingExternal={activeAddingDate === dStr}
                onCloseAddingExternal={() => setActiveAddingDate(null)}
                onSaveNewTask={handleSaveNewTask}
                onCreateGoal={handleCreateGoal}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
                onSelectTask={(task) => {
                  setSelectedTaskForEdit(task);
                  setSelectedCalendarDate(date);
                }}
                onQuickRescheduleTomorrow={handleQuickRescheduleTomorrow}
              />
            );
          })}
        </main>

        {/* Right Collapsible Vertical Hourly Timeline Panel */}
        <CalendarPanel
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          selectedDate={selectedCalendarDate}
          visibleDates={visibleDates}
          onSelectDate={(date) => {
            setSelectedCalendarDate(date);
          }}
          tasksForDate={tasksForSelectedDate}
          allTasks={rawTasks}
          onSelectTask={(task) => {
            setSelectedTaskForEdit(task);
          }}
          onAddSlotTask={(start, end, dateStr) => {
            setActiveAddingDate(dateStr);
          }}
        />
      </div>

      {/* Click-based Task Detail & Reschedule Modal */}
      {selectedTaskForEdit && (
        <TaskScheduleModal
          task={selectedTaskForEdit}
          goals={goals}
          onCreateGoal={handleCreateGoal}
          onClose={() => setSelectedTaskForEdit(null)}
          onSave={handleSaveTaskModal}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};
