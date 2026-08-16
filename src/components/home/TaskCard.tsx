import React from 'react';
import {
  Check,
  RotateCw,
  Music,
  Trash2,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Task } from '../../types';

export interface TaskCardProps {
  task: Task;
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

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onClick,
  onDelete,
  onQuickRescheduleTomorrow,
}) => {
  const isDone = task.status === 'completed';
  const isScheduled = Boolean(task.startTime && task.startTime.trim() !== '');
  const duration = calculateMinutes(task.startTime, task.endTime, task.duration || task.durationMinutes);

  return (
    <div
      onClick={() => onClick(task)}
      className={`group relative p-2.5 rounded-lg bg-surface hairline-border hover:border-border-main transition-all cursor-pointer space-y-1.5 select-none ${
        isDone ? 'opacity-55 bg-surface/30' : 'hover:shadow-sm'
      }`}
    >
      {/* Top Row: Checkbox + Title + Hover Action Buttons */}
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task);
          }}
          title={isDone ? 'Mark as planned' : 'Mark as completed'}
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
            isDone ? 'line-through text-text-secondary' : 'text-text-main'
          }`}
        >
          {task.title}
        </span>

        {/* Hover Quick Actions */}
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
      </div>

      {/* Bottom Row: Minimal details (time, duration, recurrence, beat) */}
      <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-secondary pl-6 flex-wrap">
        {isScheduled ? (
          <>
            <span className="text-text-secondary/90">
              {task.startTime} – {task.endTime}
            </span>
            {duration > 0 && (
              <>
                <span className="text-border-main">•</span>
                <span>{formatDuration(duration)}</span>
              </>
            )}
          </>
        ) : (
          <span className="text-text-secondary/60 text-[10px]">Unscheduled</span>
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
            title="Music Beat"
          >
            <Music className="w-2.5 h-2.5" />
          </span>
        )}

        {task.priority === 'critical' && (
          <span className="w-1.5 h-1.5 rounded-full bg-red-main ml-auto" title="Critical priority" />
        )}
        {task.priority === 'high' && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-auto" title="High priority" />
        )}
      </div>
    </div>
  );
};
