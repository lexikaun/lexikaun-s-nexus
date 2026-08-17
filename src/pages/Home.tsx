import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Inbox,
  X,
  ArrowRight,
} from 'lucide-react';
import { DayColumn } from '../components/home/DayColumn';
import { DayTimelinePanel } from '../components/home/DayTimelinePanel';
import { TaskScheduleModal } from '../components/home/TaskScheduleModal';
import { useAuth } from '../context/AuthContext';
import {
  subscribeToTasks,
  subscribeToGoals,
  subscribeToChannels,
  updateTask,
  deleteTask,
  createTask,
  createGoal,
  createChannel,
} from '../services/db';
import { expandRecurringTask } from '../utils/recurrence';
import { Task, Goal, Channel } from '../types';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.uid || 'local-producer-01';

  const [rawTasks, setRawTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

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

  // Controls which day column has its quick-add open externally
  const [activeAddingDate, setActiveAddingDate] = useState<string | null>(null);

  // Selected task for click-based detail/reschedule modal
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);

  // Number of visible day columns
  const visibleDaysCount = 4;

  // Filter State
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);

  // Timeline Panel collapsible drawer toggle
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  // Backlog Drawer Toggle
  const [isBacklogOpen, setIsBacklogOpen] = useState<boolean>(false);

  // Subscribe to live tasks, goals, channels from Firestore / local cache
  useEffect(() => {
    const unsubTasks = subscribeToTasks(userId, (loadedTasks) => {
      setRawTasks(loadedTasks);
    });
    const unsubGoals = subscribeToGoals(userId, (loadedGoals) => {
      setGoals(loadedGoals);
    });
    const unsubChannels = subscribeToChannels(userId, (loadedChannels) => {
      setChannels(loadedChannels);
    });

    // Listen for custom events from Sidebar
    const handleCustomEvents = (e: Event) => {
      const customEvent = e as CustomEvent<{ ritual?: string; prompt?: string }>;
      if (customEvent.detail?.ritual === 'backlog') setIsBacklogOpen(true);
    };

    const handleJumpToday = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setStartDate(today);
      setSelectedCalendarDate(today);
    };

    window.addEventListener('lexikaun-trigger-ritual', handleCustomEvents);
    window.addEventListener('lexikaun-jump-today', handleJumpToday);

    return () => {
      unsubTasks();
      unsubGoals();
      unsubChannels();
      window.removeEventListener('lexikaun-trigger-ritual', handleCustomEvents);
      window.removeEventListener('lexikaun-jump-today', handleJumpToday);
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

  // Filter tasks by channel if a filter is active
  const filteredRawTasks = useMemo(() => {
    if (selectedChannelFilter === 'all') return rawTasks;
    return rawTasks.filter((t) => t.channelId === selectedChannelFilter);
  }, [rawTasks, selectedChannelFilter]);

  // Expand all recurring and non-recurring tasks across visible dates
  const expandedTasksByDate = useMemo(() => {
    const dateMap: Record<string, Task[]> = {};
    for (const d of visibleDates) {
      const dStr = d.toISOString().split('T')[0];
      dateMap[dStr] = [];
    }

    if (!startIsoStr || !endIsoStr) return dateMap;

    for (const t of filteredRawTasks) {
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
  }, [filteredRawTasks, visibleDates, startIsoStr, endIsoStr]);

  // Tasks for the selected calendar date
  const selectedDateStr = selectedCalendarDate.toISOString().split('T')[0];
  const tasksForSelectedDate = useMemo(() => {
    const list: Task[] = [];
    for (const t of filteredRawTasks) {
      if (t.recurrence && t.recurrence !== 'none') {
        const occurrences = expandRecurringTask(t, selectedDateStr, selectedDateStr);
        list.push(...occurrences);
      } else if (t.date === selectedDateStr) {
        list.push(t);
      }
    }
    return list;
  }, [filteredRawTasks, selectedDateStr]);

  // Backlog tasks
  const backlogTasks = useMemo(() => {
    return rawTasks.filter((t) => !t.date || t.date === '' || t.status === 'rescheduled');
  }, [rawTasks]);

  // Create new task with instant optimistic UI
  const handleSaveNewTask = async (taskData: {
    title: string;
    date: string;
    startTime?: string;
    endTime?: string;
    durationMinutes?: number;
    priority?: any;
    goalId?: string;
    channelId?: string;
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
      channelId: taskData.channelId,
      notes: taskData.notes,
      notesCount: taskData.notes ? 1 : 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setRawTasks((prev) => [newTask, ...prev]);
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

  // Create new channel inline
  const handleCreateChannel = async (name: string, color = '#D98E4A'): Promise<string> => {
    const newChan: Channel = {
      id: 'chan_' + Date.now(),
      name,
      color,
    };
    setChannels((prev) => [...prev, newChan]);
    await createChannel(userId, newChan);
    return newChan.id;
  };

  // Update existing task
  const handleSaveTaskModal = async (updatedTask: Task) => {
    const realId = updatedTask.id.includes('_rec_')
      ? updatedTask.id.split('_rec_')[0]
      : updatedTask.id;

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
      channelId: updatedTask.channelId || undefined,
      subtasks: updatedTask.subtasks || undefined,
      notes: updatedTask.notes || undefined,
      notesCount: updatedTask.notesCount,
    });
  };

  // Quick move task to tomorrow
  const handleQuickRescheduleTomorrow = async (task: Task) => {
    const realId = task.id.includes('_rec_') ? task.id.split('_rec_')[0] : task.id;
    const baseDate = new Date(task.date || new Date().toISOString().split('T')[0]);
    baseDate.setDate(baseDate.getDate() + 1);
    const tomorrowStr = baseDate.toISOString().split('T')[0];

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
    const nextStatus = task.status === 'completed' || task.done === true ? 'planned' : 'completed';

    setRawTasks((prev) =>
      prev.map((t) => (t.id === realId ? { ...t, status: nextStatus, done: nextStatus === 'completed' } : t))
    );

    await updateTask(userId, realId, {
      status: nextStatus,
      done: nextStatus === 'completed',
      completedAt: nextStatus === 'completed' ? Date.now() : undefined,
    });
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    const realId = taskId.includes('_rec_') ? taskId.split('_rec_')[0] : taskId;
    setRawTasks((prev) => prev.filter((t) => t.id !== realId));
    await deleteTask(userId, realId);
  };

  const handleRescheduleFromRitual = async (taskId: string, newDate: string) => {
    setRawTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, date: newDate } : t))
    );
    await updateTask(userId, taskId, { date: newDate });
  };

  // Date range title for header in IBM Plex Mono
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

  const activeChannel = channels.find((c) => c.id === selectedChannelFilter);

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-canvas text-ink overflow-hidden select-none">
      {/* 1. Minimalist Top Bar Controls */}
      <header className="h-11 border-b border-hairline/60 px-4 flex items-center justify-between shrink-0 bg-canvas">
        {/* Left / Center: Date Navigation & Date Range in IBM Plex Mono */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5 bg-surface/80 p-0.5 rounded-lg border border-hairline/70 shadow-sm">
            <button
              onClick={() => handleShiftDays(-1)}
              title="Previous day"
              className="p-1 rounded-md hover:bg-surface-hover text-ink-muted hover:text-ink transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleGoToToday}
              className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium hover:bg-surface-hover text-ink transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => handleShiftDays(1)}
              title="Next day"
              className="p-1 rounded-md hover:bg-surface-hover text-ink-muted hover:text-ink transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="font-mono text-[11px] text-ink-muted/80 tracking-tight hidden sm:inline-block">
            {dateRangeLabel}
          </span>
        </div>

        {/* Right: Quiet Filter & Calendars Toggle */}
        <div className="flex items-center gap-2">
          {/* Quiet Channel / Tag Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono border ${
                selectedChannelFilter !== 'all'
                  ? 'bg-accent/15 border-accent/40 text-accent font-medium shadow-sm'
                  : 'bg-surface/80 border-hairline/70 text-ink-muted hover:text-ink hover:bg-surface'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{activeChannel ? `#${activeChannel.name}` : 'Filter'}</span>
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-48 p-1.5 bg-surface border border-hairline rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.45)] z-40 space-y-1">
                <div className="text-[9px] uppercase font-mono text-ink-muted/70 px-2 py-1">
                  Filter by Channel
                </div>
                <button
                  onClick={() => {
                    setSelectedChannelFilter('all');
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                    selectedChannelFilter === 'all'
                      ? 'bg-accent/15 text-accent font-medium'
                      : 'text-ink hover:bg-canvas'
                  }`}
                >
                  <span>All Channels</span>
                </button>
                {channels.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedChannelFilter(c.id);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                      selectedChannelFilter === c.id
                        ? 'bg-accent/15 text-accent font-medium'
                        : 'text-ink hover:bg-canvas'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="truncate font-mono text-xs">#{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Calendars Toggle Button */}
          <button
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            title={isCalendarOpen ? 'Hide timeline schedule' : 'Show timeline schedule'}
            className={`p-1.5 px-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono border ${
              isCalendarOpen
                ? 'bg-accent/15 border-accent/40 text-accent font-medium shadow-sm'
                : 'bg-surface/80 border-hairline/70 text-ink-muted hover:text-ink hover:bg-surface'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendars</span>
          </button>
        </div>
      </header>

      {/* Main Multi-Region Body: Multi-Day Stream Columns */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <main className="flex-1 flex overflow-x-auto overflow-y-hidden min-h-0 divide-x divide-hairline/30">
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
                channels={channels}
                isAddingExternal={activeAddingDate === dStr}
                onCloseAddingExternal={() => setActiveAddingDate(null)}
                onSaveNewTask={handleSaveNewTask}
                onCreateGoal={handleCreateGoal}
                onCreateChannel={handleCreateChannel}
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

        {/* Slide-In Day Timeline Panel (Phase 5) */}
        <DayTimelinePanel
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          selectedDate={selectedCalendarDate}
          visibleDates={visibleDates}
          onSelectDate={(date) => {
            setSelectedCalendarDate(date);
          }}
          tasksForDate={tasksForSelectedDate}
          channels={channels}
          onSelectTask={(task) => {
            setSelectedTaskForEdit(task);
          }}
          onAddSlotTask={(start, end, dateStr) => {
            setActiveAddingDate(dateStr);
          }}
          onOpenBacklog={() => setIsBacklogOpen(true)}
          onQuickAdd={() => setActiveAddingDate(selectedDateStr)}
        />

        {/* Collapsible Backlog Drawer */}
        {isBacklogOpen && (
          <div className="absolute inset-y-0 left-0 w-80 bg-canvas border-r border-hairline shadow-[0_16px_48px_rgba(0,0,0,0.45)] z-30 flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-3.5 border-b border-hairline flex items-center justify-between bg-surface/30">
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-ink">
                <Inbox className="w-4 h-4 text-accent" />
                <span>Backlog & Unscheduled</span>
              </div>
              <button
                onClick={() => setIsBacklogOpen(false)}
                className="p-1 rounded-lg hover:bg-surface text-ink-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {backlogTasks.length === 0 ? (
                <div className="p-6 text-center text-ink-muted text-xs border border-dashed border-hairline rounded-xl space-y-1">
                  <p>Backlog is clear</p>
                  <p className="text-[10px] text-ink-muted/60 font-mono">
                    Tasks without dates appear here as holding items.
                  </p>
                </div>
              ) : (
                backlogTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-xl bg-surface border border-hairline space-y-2 group shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-display font-medium text-ink truncate flex-1">
                        {t.title}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-hairline/50">
                      <button
                        onClick={() => handleRescheduleFromRitual(t.id, new Date().toISOString().split('T')[0])}
                        className="text-[10px] font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Schedule Today</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="text-[10px] text-ink-muted hover:text-red-400 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Task Detail & Schedule Modal */}
      {selectedTaskForEdit && (
        <TaskScheduleModal
          task={selectedTaskForEdit}
          goals={goals}
          channels={channels}
          onCreateGoal={handleCreateGoal}
          onCreateChannel={handleCreateChannel}
          onClose={() => setSelectedTaskForEdit(null)}
          onSave={handleSaveTaskModal}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};
