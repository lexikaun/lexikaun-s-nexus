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
  const isDone = task.status === 'completed';
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
    <div
      onClick={() => onClick(task)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(task);
        }
      }}
      className={`group relative p-3.5 rounded-2xl bg-[#27242C] border border-[rgba(237,232,224,0.08)] shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition-all duration-150 ease-out cursor-pointer select-none space-y-2.5 outline-none hover:-translate-y-[1px] hover:bg-[#302D36] hover:border-[rgba(237,232,224,0.16)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.45)] focus-visible:ring-2 focus-visible:ring-[#D98E4A]/50 ${
        isDone ? 'opacity-40 bg-[#27242C]/60 hover:opacity-75' : ''
      }`}
    >
      {/* 1. Top Row: Scheduled time on left, duration pill on right (IBM Plex Mono) */}
      {(formattedTimeRange || duration > 0) && (
        <div className="flex items-center justify-between font-mono text-[11px] text-[#948D9C]">
          {formattedTimeRange ? (
            <span className="font-medium text-[#EDE8E0]/90 tracking-tight">
              {formattedTimeRange}
            </span>
          ) : (
            <span />
          )}
          {duration > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-[#1E1C22]/80 border border-[rgba(237,232,224,0.08)] text-[10px] text-[#948D9C] font-mono tracking-tight">
              {formatDuration(duration)}
            </span>
          )}
        </div>
      )}

      {/* 2. Middle Row: Checkbox + Task Title in Fraunces */}
      <div className="flex items-start gap-3">
        {/* Checkbox button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task);
          }}
          title={isDone ? 'Mark as planned' : 'Mark as completed'}
          className={`w-4 h-4 mt-0.5 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 ${
            isDone
              ? 'bg-[#D98E4A] text-[#1E1C22] shadow-[0_0_8px_rgba(217,142,74,0.4)]'
              : 'border border-[rgba(237,232,224,0.3)] hover:border-[#D98E4A] bg-[#1E1C22]/70 hover:scale-105'
          }`}
        >
          {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
        </button>

        {/* Task Title (Fraunces serif) */}
        <div className="flex-1 min-w-0">
          <h4
            className={`font-display text-sm font-normal leading-snug tracking-tight transition-all duration-150 ${
              isDone
                ? 'line-through text-[#948D9C]'
                : 'text-[#EDE8E0] group-hover:text-white'
            }`}
          >
            {task.title}
          </h4>
        </div>
      </div>

      {/* 3. Bottom Row: Progressive Disclosure on Hover (Secondary metadata & actions) */}
      <div className="flex items-center justify-between pt-0.5 min-h-[22px]">
        {/* Left: Secondary metadata chips (reveal on hover/focus) */}
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
              className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-[6px] border"
              style={{
                backgroundColor: `${linkedChannel.color}18`,
                borderColor: `${linkedChannel.color}45`,
                color: linkedChannel.color,
              }}
              title={`Channel: #${linkedChannel.name}`}
            >
              <Hash className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate max-w-[85px]">{linkedChannel.name}</span>
            </span>
          )}

          {/* Subtask count pill */}
          {totalSubtasks > 0 && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-mono text-[#948D9C] bg-[#1E1C22]/80 border border-[rgba(237,232,224,0.08)] px-1.5 py-0.5 rounded-[6px]"
              title={`${completedSubtasks} of ${totalSubtasks} subtasks completed`}
            >
              <CheckSquare className="w-2.5 h-2.5 text-[#948D9C]" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </span>
          )}

          {/* Comment / Notes Icon */}
          {hasNotes && (
            <span
              title={task.notes || `${task.notesCount || 1} notes`}
              className="inline-flex items-center gap-0.5 text-[10px] font-mono text-[#948D9C] hover:text-[#EDE8E0] transition-colors"
            >
              <MessageSquare className="w-2.5 h-2.5 text-[#948D9C]" />
              {task.notesCount && task.notesCount > 1 ? (
                <span>{task.notesCount}</span>
              ) : null}
            </span>
          )}

          {/* Linked Goal Pill */}
          {linkedGoal && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-mono text-[#948D9C] bg-[#1E1C22]/80 border border-[rgba(237,232,224,0.08)] px-1.5 py-0.5 rounded-full"
              title={`Goal: ${linkedGoal.title}`}
            >
              <Target className="w-2.5 h-2.5 text-[#D98E4A] shrink-0" />
              <span className="truncate max-w-[75px]">{linkedGoal.title}</span>
            </span>
          )}

          {/* Recurring indicator */}
          {task.recurrence && task.recurrence !== 'none' && (
            <span title="Recurring task" className="text-[#948D9C]">
              <RotateCw className="w-2.5 h-2.5" />
            </span>
          )}

          {/* Attached Beat indicator */}
          {task.associatedBeatId && (
            <span title="Beat Attached" className="text-[#D98E4A]">
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
              className="p-1 rounded-md hover:bg-[#1E1C22] text-[#948D9C] hover:text-[#EDE8E0] transition-colors cursor-pointer"
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
              className="p-1 rounded-md hover:bg-[#1E1C22] text-[#948D9C] hover:text-red-400 transition-colors cursor-pointer"
              title="Delete task"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
