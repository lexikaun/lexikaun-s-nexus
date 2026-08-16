import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  PanelRightClose,
  Filter,
  Layers,
  LayoutGrid,
  List,
  Clock,
  Inbox,
  X,
  ArrowRight,
  Plus,
  Hash,
} from 'lucide-react';
import { DayColumn } from '../components/home/DayColumn';
import { CalendarPanel } from '../components/home/CalendarPanel';
import { TaskScheduleModal } from '../components/home/TaskScheduleModal';
import { TaskCard } from '../components/home/TaskCard';
import { DailyPlanningModal } from '../components/rituals/DailyPlanningModal';
import { DailyShutdownModal } from '../components/rituals/DailyShutdownModal';
import { useAuth } from '../context/useAuth';
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

export type ViewMode = 'board' | 'list';

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

  // Controls which day column has its quick-add open externally (e.g. from timeline click)
  const [activeAddingDate, setActiveAddingDate] = useState<string | null>(null);

  // Selected task for click-based detail/reschedule modal
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);

  // Number of visible day columns
  const visibleDaysCount = 4;

  // View Mode: Board vs List
  const [viewMode, setViewMode] = useState<ViewMode>('board');

  // Filter State
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);

  // Timeline Panel collapsible toggle
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(true);

  // Backlog Drawer Toggle
  const [isBacklogOpen, setIsBacklogOpen] = useState<boolean>(false);

  // Ritual Modals
  const [isDailyPlanningOpen, setIsDailyPlanningOpen] = useState<boolean>(false);
  const [isDailyShutdownOpen, setIsDailyShutdownOpen] = useState<boolean>(false);

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

    // Listen for custom ritual triggers from Sidebar
    const handleRitualEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ ritual: string }>;
      const ritual = customEvent.detail?.ritual;
      if (ritual === 'daily-planning') setIsDailyPlanningOpen(true);
      if (ritual === 'daily-shutdown') setIsDailyShutdownOpen(true);
      if (ritual === 'backlog') setIsBacklogOpen(true);
    };

    window.addEventListener('lexikaun-trigger-ritual', handleRitualEvent);

    return () => {
      unsubTasks();
      unsubGoals();
      unsubChannels();
      window.removeEventListener('lexikaun-trigger-ritual', handleRitualEvent);
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

  // Backlog tasks (unscheduled / undated or holding)
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
  const handleCreateChannel = async (name: string, color = '#ef4444'): Promise<string> => {
    const newChan: Channel = {
      id: 'chan_' + Date.now(),
      name,
      color,
    };
    setChannels((prev) => [...prev, newChan]);
    await createChannel(userId, newChan);
    return newChan.id;
  };

  // Update existing task from Schedule/Detail modal
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
    const nextStatus = task.status === 'completed' ? 'planned' : 'completed';

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
    setRawTasks((prev) => prev.filter((t) => t.id !== realId));
    await deleteTask(userId, realId);
  };

  const handleRescheduleFromRitual = async (taskId: string, newDate: string) => {
    setRawTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, date: newDate } : t))
    );
    await updateTask(userId, taskId, { date: newDate });
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

  const activeChannel = channels.find((c) => c.id === selectedChannelFilter);

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-bg-main overflow-hidden select-none">
      {/* 1. Sunsama Clean Top Bar with Filter & View Mode Switcher */}
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

        {/* Center/Right: Filter, View Switcher, Timeline Panel Toggle */}
        <div className="flex items-center gap-2">
          {/* Channel / Tag Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono border ${
                selectedChannelFilter !== 'all'
                  ? 'bg-red-main/15 border-red-main/40 text-text-main'
                  : 'bg-surface/50 border-border-main/50 text-text-secondary hover:text-text-main hover:bg-surface'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{activeChannel ? `#${activeChannel.name}` : 'Filter'}</span>
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-48 p-1.5 bg-surface border border-border-main/70 rounded-xl shadow-2xl z-40 space-y-1">
                <div className="text-[9px] uppercase font-mono text-text-secondary px-2 py-1">
                  Filter by Channel
                </div>
                <button
                  onClick={() => {
                    setSelectedChannelFilter('all');
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                    selectedChannelFilter === 'all'
                      ? 'bg-red-main/15 text-red-main font-medium'
                      : 'text-text-main hover:bg-bg-main'
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
                        ? 'bg-red-main/15 text-red-main font-medium'
                        : 'text-text-main hover:bg-bg-main'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="truncate">#{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Mode Toggle: Board vs List */}
          <div className="flex items-center bg-surface/50 p-0.5 rounded-lg hairline-border text-xs font-mono">
            <button
              onClick={() => setViewMode('board')}
              title="Board View"
              className={`p-1 px-2 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'board'
                  ? 'bg-surface text-text-main font-medium shadow-sm'
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              className={`p-1 px-2 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'list'
                  ? 'bg-surface text-text-main font-medium shadow-sm'
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden md:inline">List</span>
            </button>
          </div>

          <div className="h-4 w-px bg-border-main/50" />

          {/* Right: Collapsible Timeline Toggle */}
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
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Central Multi-Day Content (Board or List View) */}
        {viewMode === 'board' ? (
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
        ) : (
          /* Single Consolidated List View */
          <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto">
            {visibleDates.map((date) => {
              const dStr = date.toISOString().split('T')[0];
              const tasksForDay = expandedTasksByDate[dStr] || [];
              const dayName = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

              return (
                <div key={dStr} className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase font-mono tracking-wider text-text-secondary border-b border-border-main/40 pb-1 flex items-center justify-between">
                    <span>{dayName}</span>
                    <span>{tasksForDay.length} tasks</span>
                  </h3>
                  <div className="space-y-1.5">
                    {tasksForDay.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        goals={goals}
                        channels={channels}
                        onClick={(t) => setSelectedTaskForEdit(t)}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDeleteTask}
                        onQuickRescheduleTomorrow={handleQuickRescheduleTomorrow}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </main>
        )}

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

        {/* Collapsible Backlog Drawer (holding area for unscheduled tasks) */}
        {isBacklogOpen && (
          <div className="absolute inset-y-0 left-0 w-80 bg-bg-main border-r border-border-main/70 shadow-2xl z-30 flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-3.5 border-b border-border-main/50 flex items-center justify-between bg-surface/30">
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-text-main">
                <Inbox className="w-4 h-4 text-red-main" />
                <span>Backlog & Unscheduled</span>
              </div>
              <button
                onClick={() => setIsBacklogOpen(false)}
                className="p-1 rounded-md hover:bg-surface text-text-secondary hover:text-text-main cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {backlogTasks.length === 0 ? (
                <div className="p-6 text-center text-text-secondary text-xs border border-dashed border-border-main/40 rounded-xl space-y-1">
                  <p>Backlog is clear</p>
                  <p className="text-[10px] text-text-secondary/60">
                    Tasks without dates appear here as holding items.
                  </p>
                </div>
              ) : (
                backlogTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg bg-surface hairline-border space-y-2 group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-medium text-text-main truncate flex-1">
                        {t.title}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border-main/30">
                      <button
                        onClick={() => handleRescheduleFromRitual(t.id, new Date().toISOString().split('T')[0])}
                        className="text-[10px] font-mono text-red-main hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Schedule Today</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="text-[10px] text-text-secondary hover:text-red-main cursor-pointer"
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

      {/* Rituals Modals */}
      <DailyPlanningModal
        isOpen={isDailyPlanningOpen}
        onClose={() => setIsDailyPlanningOpen(false)}
        tasks={rawTasks}
        goals={goals}
        onRescheduleTask={handleRescheduleFromRitual}
        onSelectTask={(t) => setSelectedTaskForEdit(t)}
      />

      <DailyShutdownModal
        isOpen={isDailyShutdownOpen}
        onClose={() => setIsDailyShutdownOpen(false)}
        tasks={rawTasks}
        onRescheduleTask={handleRescheduleFromRitual}
      />
    </div>
  );
};
