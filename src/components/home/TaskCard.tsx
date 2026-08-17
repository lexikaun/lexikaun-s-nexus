import React from 'react';
import {
  Check,
  RotateCw,
  Music,
  Trash2,
  ArrowRight,
  Target,
  MessageSquare,
  CheckSquare,
  Hash,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Task, Goal, Channel } from '../../types';

export interface TaskCardProps {
  task: Task;
  goals?: Goal[];
  channels?: Channel[];
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
  channels = [],
  onToggleComplete,
  onClick,
  onDelete,
  onQuickRescheduleTomorrow,
}) => {
  const isDone = task.status === 'completed' || task.done === true;
  const hasTime = Boolean(task.startTime && task.startTime.trim() !== '');
  const duration = calculateMinutes(task.startTime, task.endTime, task.duration || task.durationMinutes);

  const linkedGoal = task.goalId ? goals.find((g) => g.id === task.goalId) : undefined;
  const linkedChannel = task.channelId ? channels.find((c) => c.id === task.channelId) : undefined;

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.done).length || 0;
  const hasNotes = Boolean(task.notes && task.notes.trim() !== '') || (task.notesCount && task.notesCount > 0);

  const formattedTimeRange = hasTime
    ? task.endTime
      ? `${formatTime12h(task.startTime)} – ${formatTime12h(task.endTime)}`
      : formatTime12h(task.startTime)
    : null;

  const hasSecondaryDetails = Boolean(
    linkedChannel ||
      totalSubtasks > 0 ||
      hasNotes ||
      linkedGoal ||
      (task.recurrence && task.recurrence !== 'none') ||
      task.associatedBeatId
  );

  return (
    <Card
      interactive
      elevation="floating"
      onClick={() => onClick(task)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(task);
        }
      }}
      className={`group relative p-3 space-y-2 outline-none select-none transition-all duration-150 ease-out focus-visible:ring-1 focus-visible:ring-accent/40 ${
        isDone ? 'opacity-35 bg-surface/50 hover:opacity-70' : ''
      }`}
    >
      {/* 1. Top Row: Scheduled time & duration in clean monospace */}
      {(formattedTimeRange || duration > 0) && (
        <div className="flex items-center justify-between font-mono text-[10.5px] text-ink-muted">
          {formattedTimeRange ? (
            <span className="font-normal text-ink/80 tracking-tight">
              {formattedTimeRange}
            </span>
          ) : (
            <span />
          )}
          {duration > 0 && (
            <span className="px-1.5 py-0.5 rounded-[5px] bg-canvas/60 text-[9.5px] text-ink-muted font-mono tracking-tight">
              {formatDuration(duration)}
            </span>
          )}
        </div>
      )}

      {/* 2. Middle Row: Checkbox + Task Title in Fraunces */}
      <div className="flex items-start gap-2.5">
        {/* Minimal Circle Checkbox button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task);
          }}
          title={isDone ? 'Mark as planned' : 'Mark as completed'}
          className={`w-4 h-4 mt-0.5 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 ${
            isDone
              ? 'bg-accent text-canvas shadow-[0_0_8px_rgba(217,142,74,0.35)]'
              : 'border border-[rgba(237,232,224,0.22)] hover:border-accent/80 bg-canvas/40 hover:scale-105'
          }`}
        >
          {isDone && <Check className="w-2.5 h-2.5 stroke-[2.5]" />}
        </button>

        {/* Task Title (Fraunces serif) */}
        <div className="flex-1 min-w-0">
          <h4
            className={`font-display text-[14px] font-normal leading-snug tracking-tight transition-colors duration-150 ${
              isDone
                ? 'line-through text-ink-muted/80'
                : 'text-ink group-hover:text-white'
            }`}
          >
            {task.title}
          </h4>
        </div>
      </div>

      {/* 3. Bottom Row: Progressive Disclosure on Hover */}
      <div className="flex items-center justify-between pt-0.5 min-h-[18px]">
        {/* Left: Secondary metadata chips (reveal on hover/focus over 150ms ease) */}
        <div
          className={`flex items-center gap-1.5 flex-wrap transition-opacity duration-150 ease-out ${
            hasSecondaryDetails
              ? 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
              : 'opacity-0'
          }`}
        >
          {/* Channel Tag chip */}
          {linkedChannel && (
            <span
              className="inline-flex items-center gap-1 text-[9.5px] font-mono px-1.5 py-0.5 rounded-[5px] border"
              style={{
                backgroundColor: `${linkedChannel.color}15`,
                borderColor: `${linkedChannel.color}35`,
                color: linkedChannel.color,
              }}
              title={`Channel: #${linkedChannel.name}`}
            >
              <Hash className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate max-w-[80px]">{linkedChannel.name}</span>
            </span>
          )}

          {/* Subtask count pill */}
          {totalSubtasks > 0 && (
            <span
              className="inline-flex items-center gap-1 text-[9.5px] font-mono text-ink-muted bg-canvas/60 border border-hairline/60 px-1.5 py-0.5 rounded-[5px]"
              title={`${completedSubtasks} of ${totalSubtasks} subtasks completed`}
            >
              <CheckSquare className="w-2.5 h-2.5 text-ink-muted" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </span>
          )}

          {/* Comment / Notes Icon */}
          {hasNotes && (
            <span
              title={task.notes || `${task.notesCount || 1} notes`}
              className="inline-flex items-center gap-0.5 text-[9.5px] font-mono text-ink-muted hover:text-ink transition-colors"
            >
              <MessageSquare className="w-2.5 h-2.5 text-ink-muted" />
              {task.notesCount && task.notesCount > 1 ? (
                <span>{task.notesCount}</span>
              ) : null}
            </span>
          )}

          {/* Linked Goal Pill */}
          {linkedGoal && (
            <span
              className="inline-flex items-center gap-1 text-[9.5px] font-mono text-ink-muted bg-canvas/60 border border-hairline/60 px-1.5 py-0.5 rounded-full"
              title={`Goal: ${linkedGoal.title}`}
            >
              <Target className="w-2.5 h-2.5 text-accent shrink-0" />
              <span className="truncate max-w-[70px]">{linkedGoal.title}</span>
            </span>
          )}

          {/* Recurring indicator */}
          {task.recurrence && task.recurrence !== 'none' && (
            <span title="Recurring task" className="text-ink-muted">
              <RotateCw className="w-2.5 h-2.5" />
            </span>
          )}

          {/* Attached Beat indicator */}
          {task.associatedBeatId && (
            <span title="Beat Attached" className="text-accent">
              <Music className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        {/* Right: Hover Action Controls */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 ease-out ml-auto">
          {onQuickRescheduleTomorrow && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickRescheduleTomorrow(task);
              }}
              className="p-1 rounded-md hover:bg-canvas text-ink-muted hover:text-ink transition-colors cursor-pointer"
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
              className="p-1 rounded-md hover:bg-canvas text-ink-muted hover:text-red-400 transition-colors cursor-pointer"
              title="Delete task"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
