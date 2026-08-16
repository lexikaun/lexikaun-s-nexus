import React from 'react';
import {
  Check,
  RotateCw,
  Music,
  Trash2,
  ArrowRight,
  Target,
  FileText,
} from 'lucide-react';
import { Task, Goal } from '../../types';

export interface TaskCardProps {
  task: Task;
  goals?: Goal[];
  onToggleComplete: (task: Task) => void;
  onClick: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onQuickRescheduleTomorrow?: (task: Task) => void;
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

function formatTime12h(timeStr?: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  goals = [],
  onToggleComplete,
  onClick,
  onDelete,
  onQuickRescheduleTomorrow,
}) => {
  const isDone = task.status === 'completed';
  const hasTime = Boolean(task.startTime && task.startTime.trim() !== '');
  const duration = calculateMinutes(task.startTime, task.endTime, task.duration || task.durationMinutes);
  const linkedGoal = task.goalId ? goals.find((g) => g.id === task.goalId) : undefined;

  const formattedTimeRange = hasTime
    ? task.endTime
      ? `${formatTime12h(task.startTime)} – ${formatTime12h(task.endTime)}`
      : formatTime12h(task.startTime)
    : null;

  return (
    <div
      onClick={() => onClick(task)}
      className={`group relative p-3 rounded-xl bg-surface/90 border border-border-main/50 hover:border-border-main hover:shadow-md transition-all cursor-pointer space-y-2 select-none ${
        isDone ? 'opacity-50 bg-surface/40' : ''
      }`}
    >
      {/* 1. Top Row: Scheduled time on left, duration pill on right */}
      {(formattedTimeRange || duration > 0) && (
        <div className="flex items-center justify-between text-[11px] font-mono text-text-secondary">
          {formattedTimeRange ? (
            <span className="text-text-secondary/90 font-medium">{formattedTimeRange}</span>
          ) : (
            <span />
          )}
          {duration > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-surface border border-border-main/50 text-[10px] text-text-secondary font-mono">
              {formatDuration(duration)}
            </span>
          )}
        </div>
      )}

      {/* 2. Middle Row: Task title */}
      <div className="text-xs font-normal text-text-main leading-snug">
        <span className={isDone ? 'line-through text-text-secondary' : ''}>
          {task.title}
        </span>
      </div>

      {/* 3. Bottom Row: Checkbox on left, subtle goal/tag pill on right & hover actions */}
      <div className="flex items-center justify-between pt-0.5">
        {/* Left: Checkbox + extra icons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task);
            }}
            title={isDone ? 'Mark as planned' : 'Mark as completed'}
            className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isDone
                ? 'bg-red-main text-white'
                : 'border border-border-main/80 hover:border-red-main bg-bg-main'
            }`}
          >
            {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </button>

          {task.notes && (
            <span title="Notes" className="text-text-secondary/60">
              <FileText className="w-2.5 h-2.5" />
            </span>
          )}

          {task.recurrence && task.recurrence !== 'none' && (
            <span title="Recurring" className="text-text-secondary/60">
              <RotateCw className="w-2.5 h-2.5" />
            </span>
          )}

          {task.associatedBeatId && (
            <span title="Beat Attached" className="text-music-accent">
              <Music className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        {/* Right: Subtle Goal pill / Hover action controls */}
        <div className="flex items-center gap-1">
          {/* Hover actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onQuickRescheduleTomorrow && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickRescheduleTomorrow(task);
                }}
                className="p-0.5 rounded hover:bg-surface text-text-secondary hover:text-text-main transition-colors cursor-pointer"
                title="Move to tomorrow"
              >
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="p-0.5 rounded hover:bg-surface text-text-secondary hover:text-red-main transition-colors cursor-pointer"
                title="Delete task"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Goal pill */}
          {linkedGoal && (
            <span
              className="inline-flex items-center gap-1 text-[10px] text-text-secondary bg-surface hairline-border px-1.5 py-0.5 rounded-full"
              title={`Goal: ${linkedGoal.title}`}
            >
              <Target className="w-2.5 h-2.5 text-red-main shrink-0" />
              <span className="truncate max-w-[90px]">{linkedGoal.title}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
