import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Task, Goal, Channel } from '../../types';
import { TaskCard } from './TaskCard';
import { AddTaskWindow } from '../tasks/AddTaskWindow';

export interface DayColumnProps {
  date: Date;
  isToday: boolean;
  tasks: Task[];
  goals?: Goal[];
  channels?: Channel[];
  isAddingExternal?: boolean;
  onCloseAddingExternal?: () => void;
  onAddTask?: (dateStr: string) => void;
  onSaveNewTask?: (taskData: {
    title: string;
    date: string;
    startTime?: string;
    endTime?: string;
    durationMinutes?: number;
    priority?: any;
    goalId?: string;
    channelId?: string;
    notes?: string;
  }) => Promise<void> | void;
  onToggleComplete?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onSelectTask?: (task: Task) => void;
  onQuickRescheduleTomorrow?: (task: Task) => void;
  onCreateGoal?: (title: string) => Promise<string>;
  onCreateChannel?: (name: string, color?: string) => Promise<string>;
}

export const DayColumn: React.FC<DayColumnProps> = ({
  date,
  isToday,
  tasks,
  goals = [],
  channels = [],
  isAddingExternal = false,
  onCloseAddingExternal,
  onAddTask,
  onSaveNewTask,
  onToggleComplete,
  onDeleteTask,
  onSelectTask,
  onQuickRescheduleTomorrow,
  onCreateGoal,
  onCreateChannel,
}) => {
  const [isAddWindowOpen, setIsAddWindowOpen] = useState(false);

  const dateStr = date.toISOString().split('T')[0];
  const fullDayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dayNumber = date.getDate();
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });

  // Single unified chronological task stream
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.startTime && b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    return (a.createdAt || 0) - (b.createdAt || 0);
  });

  // Honest Progress calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t) => t.status === 'completed' || t.done === true
  ).length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const showAddWindow = isAddWindowOpen || isAddingExternal;

  const handleOpenAdd = () => {
    setIsAddWindowOpen(true);
    onAddTask?.(dateStr);
  };

  const handleCloseAdd = () => {
    setIsAddWindowOpen(false);
    onCloseAddingExternal?.();
  };

  const handleSave = async (taskData: any) => {
    if (onSaveNewTask) {
      await onSaveNewTask(taskData);
    }
  };

  return (
    <div
      className={`flex-1 min-w-[280px] max-w-[420px] flex flex-col h-full border-r border-hairline select-none ${
        isToday ? 'bg-surface/[0.08]' : 'bg-canvas'
      }`}
    >
      {/* 1. Calm Column Header & Real Progress Bar */}
      <div className="px-4 pt-4 pb-2.5 shrink-0 bg-canvas space-y-1.5 border-b border-hairline/40">
        <div className="flex items-baseline justify-between">
          <div>
            <div
              className={`font-display text-base tracking-tight ${
                isToday ? 'text-accent font-medium' : 'text-ink font-normal'
              }`}
            >
              {fullDayName}
            </div>
            <div className="font-mono text-[11px] text-ink-muted tracking-tight">
              {monthName} {dayNumber}
            </div>
          </div>
        </div>

        {/* Thin 2px accent progress line */}
        <div className="w-full h-[2px] bg-surface-hover rounded-full overflow-hidden mt-2">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Unified Day Column Stream */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-2.5">
        {/* + Add Task trigger at top of the column */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="w-full flex items-center gap-2 py-2 px-3 rounded-[10px] border border-hairline/60 hover:border-hairline hover:bg-surface/80 text-xs text-ink-muted hover:text-ink transition-all duration-150 cursor-pointer group text-left shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-ink-muted group-hover:text-accent transition-colors shrink-0" />
          <span className="font-sans">Add task</span>
        </button>

        {/* Single continuous list of task cards */}
        {sortedTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            goals={goals}
            channels={channels}
            onClick={(t) => onSelectTask?.(t)}
            onToggleComplete={(t) => onToggleComplete?.(t)}
            onDelete={(id) => onDeleteTask?.(id)}
            onQuickRescheduleTomorrow={
              onQuickRescheduleTomorrow
                ? (t) => onQuickRescheduleTomorrow(t)
                : undefined
            }
          />
        ))}

        {sortedTasks.length === 0 && (
          <div className="py-8 text-center text-ink-muted/50 text-xs font-mono">
            No tasks scheduled
          </div>
        )}
      </div>

      {/* Floating Notecard Add Task Window (Phase 1) */}
      {showAddWindow && (
        <AddTaskWindow
          isOpen={showAddWindow}
          dateStr={dateStr}
          goals={goals}
          channels={channels}
          onCreateGoal={onCreateGoal}
          onCreateChannel={onCreateChannel}
          onSave={handleSave}
          onClose={handleCloseAdd}
        />
      )}
    </div>
  );
};
