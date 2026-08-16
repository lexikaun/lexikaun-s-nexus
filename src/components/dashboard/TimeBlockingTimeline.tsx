import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  Music2,
  Plus,
  Zap,
  MoreVertical,
  Check,
  ChevronRight,
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { useMusic } from '../../context/MusicContext';
import { Task, TimeBlockSlot } from '../../types';

interface TimeBlockingTimelineProps {
  onScheduleSlot: (start: string, end: string) => void;
  onOpenTaskDetail?: (task: Task) => void;
  onOpenBeatDetail: (beatId: string) => void;
  onOpenReschedule: (task: Task) => void;
}

export const TimeBlockingTimeline: React.FC<TimeBlockingTimelineProps> = ({
  onScheduleSlot,
  onOpenBeatDetail,
  onOpenReschedule,
}) => {
  const { timeBlocks, setTaskStatus, selectedDate } = usePlanner();
  const { getBeatById, playBeat } = useMusic();

  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTimeMinutes(d.getHours() * 60 + d.getMinutes());
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPriorityBorder = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return 'border-rose-500/40 bg-rose-500/5 text-rose-300';
      case 'high':
        return 'border-amber-500/40 bg-amber-500/5 text-amber-300';
      case 'medium':
        return 'border-indigo-500/40 bg-indigo-500/5 text-indigo-300';
      default:
        return 'border-[#1E2430] bg-[#141820] text-slate-300';
    }
  };

  return (
    <div
      id="timeline-timeblocking-container"
      className="rounded-2xl border border-[#1E2430] bg-[#0F1218] p-5.5 shadow-sm transition"
    >
      {/* Header with Timeline Controls */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-bold text-slate-100">
            Day Schedule & Time Blocks
          </h3>
          <p className="text-xs text-slate-400">
            Chronological visual timeline showing active commitments, time blocks, and free space.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span className="font-medium text-slate-300">Active / NOW</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-slate-700" />
            <span>Free Space</span>
          </div>
        </div>
      </div>

      {/* Chronological List of Time Blocks */}
      <div className="relative mt-5 space-y-2.5">
        {timeBlocks.map((block, idx) => {
          const task = block.task;
          const associatedBeat = task?.associatedBeatId
            ? getBeatById(task.associatedBeatId)
            : null;

          if (block.isFreeTime) {
            return (
              <div
                key={`free_${idx}_${block.start}`}
                className={`group flex items-center justify-between rounded-xl border border-dashed p-3 transition ${
                  block.isCurrent
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-[#1E2430] bg-[#0A0C10]/40 hover:border-slate-700 hover:bg-[#141820]/40'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex w-24 shrink-0 items-center space-x-1 font-mono text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>{block.start} → {block.end}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {block.isCurrent ? (
                      <span className="rounded-md border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                        NOW — Free Space
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500">
                        Free Time ({block.endMinutes - block.startMinutes}m)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onScheduleSlot(block.start, block.end)}
                  className="flex items-center space-x-1 rounded-lg border border-[#1E2430] bg-[#141820] px-2.5 py-1 text-xs font-semibold text-slate-400 opacity-0 shadow-sm transition group-hover:opacity-100 hover:border-emerald-500/40 hover:text-emerald-400"
                >
                  <Plus className="h-3 w-3" />
                  <span>Block Time</span>
                </button>
              </div>
            );
          }

          if (!task) return null;

          const isCompleted = task.status === 'completed';
          const isInProgress = task.status === 'in_progress';
          const isRescheduled = task.status === 'rescheduled';

          return (
            <div
              key={task.id}
              className={`relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all ${
                block.isCurrent
                  ? 'border-emerald-500/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                  : isCompleted
                  ? 'border-[#1E2430] bg-[#0A0C10]/60 opacity-60'
                  : getPriorityBorder(task.priority)
              }`}
            >
              {/* Active Indicator Bar */}
              {block.isCurrent && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              )}

              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                {/* Time & Title Info */}
                <div className="flex items-start space-x-3.5">
                  <button
                    onClick={() =>
                      setTaskStatus(task.id, isCompleted ? 'planned' : 'completed')
                    }
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                      isCompleted
                        ? 'border-emerald-500 bg-emerald-500 text-black'
                        : 'border-slate-700 bg-[#141820] hover:border-emerald-500/60 text-transparent'
                    }`}
                    title={isCompleted ? 'Mark uncompleted' : 'Mark complete'}
                  >
                    {isCompleted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold tracking-tight text-slate-300">
                        {task.startTime} → {task.endTime}
                      </span>
                      <span className="text-[11px] text-slate-500">({task.durationMinutes}m)</span>

                      {block.isCurrent && (
                        <span className="rounded-md bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black">
                          NOW
                        </span>
                      )}

                      {isRescheduled && (
                        <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                          Rescheduled
                        </span>
                      )}
                    </div>

                    <h4
                      className={`mt-1 text-sm font-semibold tracking-tight ${
                        isCompleted
                          ? 'text-slate-500 line-through'
                          : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side associated beat and quick action buttons */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  {associatedBeat && (
                    <div
                      className="flex items-center space-x-2 rounded-xl border border-emerald-500/30 bg-[#141820] px-2.5 py-1 text-xs shadow-sm"
                    >
                      <button
                        onClick={() => playBeat(associatedBeat)}
                        className="text-emerald-400 hover:text-emerald-300"
                        title="Play associated beat"
                      >
                        <Play className="h-3 w-3 fill-emerald-400" />
                      </button>
                      <button
                        onClick={() => onOpenBeatDetail(associatedBeat.id)}
                        className="truncate font-semibold text-slate-200 hover:text-emerald-400"
                      >
                        {associatedBeat.title}
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => onOpenReschedule(task)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-[#141820] hover:text-slate-200"
                    title="Reschedule task"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
