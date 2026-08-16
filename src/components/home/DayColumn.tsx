import React from 'react';
import {
  Plus,
  Clock,
  Inbox,
  Check,
  RotateCw,
  Music,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { Task } from '../../types';

export interface DayColumnProps {
  date: Date;
  isToday: boolean;
  tasks: Task[];
  onAddTask?: (dateStr: string) => void;
  onToggleComplete?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onSelectTask?: (task: Task) => void;
}

function calculateMinutes(startTime?: string, endTime?: string, duration?: number): number {
  if (duration && duration > 0) return duration;
  if (!startTime || !endTime) return 0;
  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);
  const diff = (eH * 60 + (eM || 0)) - (sH * 60 + (sM || 0));
  return diff > 0 ? diff : 0;
}

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export const DayColumn: React.FC<DayColumnProps> = ({
  date,
  isToday,
  tasks,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  onSelectTask,
}) => {
  const dateStr = date.toISOString().split('T')[0];

  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNumber = date.getDate();
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });

  // Separate scheduled vs unscheduled
  const scheduledTasks = tasks
    .filter((t) => t.startTime && t.startTime.trim() !== '')
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const unscheduledTasks = tasks.filter(
    (t) => !t.startTime || t.startTime.trim() === ''
  );

  // Real progress calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Scheduled total time
  const totalScheduledMinutes = scheduledTasks.reduce((acc, t) => {
    return acc + calculateMinutes(t.startTime, t.endTime, t.duration || t.durationMinutes);
  }, 0);

  return (
    <div
      className={`flex-1 min-w-[280px] max-w-[420px] flex flex-col h-full border-r border-border-main/40 select-none ${
        isToday ? 'bg-surface/15' : 'bg-bg-main/50'
      }`}
    >
      {/* Column Header */}
      <div className="p-3.5 border-b border-border-main/50 flex flex-col gap-2.5 shrink-0 bg-bg-main">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                isToday ? 'text-red-main' : 'text-text-secondary'
              }`}
            >
              {dayName}
            </span>
            <span
              className={`text-sm font-mono font-medium ${
                isToday ? 'text-text-main font-bold' : 'text-text-main'
              }`}
            >
              {monthName} {dayNumber}
            </span>
          </div>

          {isToday && (
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-main/15 text-red-main border border-red-main/30 font-medium">
              Today
            </span>
          )}
        </div>

        {/* Real Daily Completion Progress Bar */}
        <div className="w-full flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden hairline-border">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progressPercent === 100 ? 'bg-emerald-500' : 'bg-red-main'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-text-secondary shrink-0">
            {completedTasks}/{totalTasks} ({progressPercent}%)
          </span>
        </div>

        {/* Quick Add Task Button */}
        <button
          onClick={() => onAddTask?.(dateStr)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-surface/60 hover:bg-surface border border-border-main/40 hover:border-border-main text-xs font-medium text-text-secondary hover:text-text-main transition-all cursor-pointer group"
        >
          <Plus className="w-3.5 h-3.5 text-text-secondary group-hover:text-red-main transition-colors" />
          <span>Add task</span>
        </button>
      </div>

      {/* Column Content: Scheduled + Unscheduled sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* 1. Scheduled Tasks Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-text-secondary">
              <Clock className="w-3 h-3 text-text-secondary" />
              <span>Scheduled</span>
            </div>
            <span className="text-[10px] font-mono text-text-secondary">
              {formatDuration(totalScheduledMinutes)}
            </span>
          </div>

          {scheduledTasks.length === 0 ? (
            <div className="p-3.5 rounded-lg bg-surface/20 border border-dashed border-border-main/40 text-center space-y-1">
              <p className="text-xs text-text-secondary">No scheduled blocks</p>
              <p className="text-[11px] text-text-secondary/60">
                Tasks with specific hours land here
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {scheduledTasks.map((task) => {
                const isDone = task.status === 'completed';
                const duration = calculateMinutes(task.startTime, task.endTime, task.duration || task.durationMinutes);

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask?.(task)}
                    className={`group relative p-2.5 rounded-lg bg-surface hairline-border hover:border-border-main/80 transition-all cursor-pointer space-y-1.5 ${
                      isDone ? 'opacity-60 bg-surface/40' : ''
                    }`}
                  >
                    {/* Top Row: Completion checkbox + Title */}
                    <div className="flex items-start gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete?.(task);
                        }}
                        className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          isDone
                            ? 'bg-red-main text-white'
                            : 'border border-border-main/80 hover:border-red-main bg-bg-main'
                        }`}
                      >
                        {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <span
                        className={`text-xs font-medium leading-snug flex-1 truncate ${
                          isDone
                            ? 'line-through text-text-secondary'
                            : 'text-text-main'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Delete action on hover */}
                      {onDeleteTask && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-main text-text-secondary transition-all cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Bottom Row: Time badge, duration, tags */}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-secondary pl-6 flex-wrap">
                      <span className="text-text-secondary/90">
                        {task.startTime} – {task.endTime}
                      </span>
                      {duration > 0 && (
                        <>
                          <span className="text-border-main">•</span>
                          <span>{formatDuration(duration)}</span>
                        </>
                      )}

                      {task.recurrence && task.recurrence !== 'none' && (
                        <span
                          className="inline-flex items-center gap-0.5 text-[10px] text-text-secondary bg-surface px-1 py-0.2 rounded"
                          title="Recurring task"
                        >
                          <RotateCw className="w-2.5 h-2.5 text-red-main" />
                        </span>
                      )}

                      {task.associatedBeatId && (
                        <span
                          className="inline-flex items-center gap-0.5 text-[10px] text-music-accent bg-music-accent/10 px-1 py-0.2 rounded"
                          title="Music beat task"
                        >
                          <Music className="w-2.5 h-2.5" />
                        </span>
                      )}

                      {task.priority === 'critical' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-main" title="Critical priority" />
                      )}
                      {task.priority === 'high' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="High priority" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Unscheduled Tasks Section */}
        <div className="space-y-2 pt-2 border-t border-border-main/40">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-text-secondary">
              <Inbox className="w-3 h-3 text-text-secondary" />
              <span>Unscheduled</span>
            </div>
            <span className="text-[10px] font-mono text-text-secondary">
              {unscheduledTasks.length} tasks
            </span>
          </div>

          {unscheduledTasks.length === 0 ? (
            <div className="p-3.5 rounded-lg bg-surface/20 border border-dashed border-border-main/40 text-center space-y-1">
              <p className="text-xs text-text-secondary">No unscheduled items</p>
              <p className="text-[11px] text-text-secondary/60">
                Tasks for this day without fixed hours
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {unscheduledTasks.map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask?.(task)}
                    className={`group relative p-2.5 rounded-lg bg-surface hairline-border hover:border-border-main/80 transition-all cursor-pointer space-y-1 ${
                      isDone ? 'opacity-60 bg-surface/40' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete?.(task);
                        }}
                        className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          isDone
                            ? 'bg-red-main text-white'
                            : 'border border-border-main/80 hover:border-red-main bg-bg-main'
                        }`}
                      >
                        {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <span
                        className={`text-xs font-medium leading-snug flex-1 truncate ${
                          isDone
                            ? 'line-through text-text-secondary'
                            : 'text-text-main'
                        }`}
                      >
                        {task.title}
                      </span>

                      {onDeleteTask && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-main text-text-secondary transition-all cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-secondary pl-6">
                      <span className="text-text-secondary/60 text-[10px]">Unscheduled</span>
                      {task.recurrence && task.recurrence !== 'none' && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-text-secondary bg-surface px-1 py-0.2 rounded">
                          <RotateCw className="w-2.5 h-2.5 text-red-main" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
