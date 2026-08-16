import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Task, Goal } from '../../types';
import { QuickAddTask } from './QuickAddTask';
import { TaskCard } from './TaskCard';

export interface DayColumnProps {
  date: Date;
  isToday: boolean;
  tasks: Task[];
  goals?: Goal[];
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
    notes?: string;
  }) => Promise<void> | void;
  onToggleComplete?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onSelectTask?: (task: Task) => void;
  onQuickRescheduleTomorrow?: (task: Task) => void;
  onCreateGoal?: (title: string) => Promise<string>;
}

export const DayColumn: React.FC<DayColumnProps> = ({
  date,
  isToday,
  tasks,
  goals = [],
  isAddingExternal = false,
  onCloseAddingExternal,
  onAddTask,
  onSaveNewTask,
  onToggleComplete,
  onDeleteTask,
  onSelectTask,
  onQuickRescheduleTomorrow,
  onCreateGoal,
}) => {
  const [isAddingInline, setIsAddingInline] = useState(false);

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

  // Progress calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const showQuickAdd = isAddingInline || isAddingExternal;

  const handleOpenAdd = () => {
    setIsAddingInline(true);
    onAddTask?.(dateStr);
  };

  const handleCloseAdd = () => {
    setIsAddingInline(false);
    onCloseAddingExternal?.();
  };

  const handleSave = async (taskData: any) => {
    if (onSaveNewTask) {
      await onSaveNewTask(taskData);
    }
  };

  return (
    <div
      className={`flex-1 min-w-[280px] max-w-[420px] flex flex-col h-full border-r border-border-main/40 select-none ${
        isToday ? 'bg-surface/10' : 'bg-bg-main'
      }`}
    >
      {/* 1. Calm Column Header */}
      <div className="px-4 pt-3.5 pb-2 shrink-0 bg-bg-main space-y-1">
        <div className="flex items-baseline justify-between">
          <div>
            <div
              className={`text-sm font-medium ${
                isToday ? 'text-red-main font-semibold' : 'text-text-main'
              }`}
            >
              {fullDayName}
            </div>
            <div className="text-xs text-text-secondary">
              {monthName} {dayNumber}
            </div>
          </div>
        </div>

        {/* Thin 2px progress bar directly below the date header */}
        <div className="w-full h-[2px] bg-surface rounded-full overflow-hidden mt-1.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              progressPercent === 100 ? 'bg-emerald-500' : 'bg-red-main'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Unified Day Column Stream */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-2">
        {/* + Add Task trigger / Inline Quick Add directly below header */}
        {showQuickAdd ? (
          <div className="mb-2">
            <QuickAddTask
              dateStr={dateStr}
              goals={goals}
              onCreateGoal={onCreateGoal}
              onSave={handleSave}
              onCancel={handleCloseAdd}
            />
          </div>
        ) : (
          <button
            onClick={handleOpenAdd}
            className="w-full flex items-center gap-2 py-1.5 px-2.5 rounded-lg border border-transparent hover:border-border-main/50 hover:bg-surface/50 text-xs text-text-secondary/70 hover:text-text-main transition-all cursor-pointer group text-left"
          >
            <Plus className="w-3.5 h-3.5 text-text-secondary group-hover:text-red-main transition-colors shrink-0" />
            <span>Add task</span>
          </button>
        )}

        {/* Single continuous list of task cards */}
        {sortedTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            goals={goals}
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
      </div>
    </div>
  );
};
