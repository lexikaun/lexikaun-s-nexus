import React from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Sparkles,
  Play,
  RotateCcw,
  Music2,
  Coffee,
  Check,
  Zap,
  Flame,
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { useMusic } from '../../context/MusicContext';
import { Task } from '../../types';

interface TodayOverviewProps {
  onOpenAddTask: () => void;
  onOpenBeatDetail: (beatId: string) => void;
  onOpenReschedule: (task: Task) => void;
  onOpenDailyReview: () => void;
}

export const TodayOverview: React.FC<TodayOverviewProps> = ({
  onOpenAddTask,
  onOpenBeatDetail,
  onOpenReschedule,
  onOpenDailyReview,
}) => {
  const {
    goals,
    currentTask,
    nextTask,
    currentSlotRemainingMinutes,
    currentFreeTimeSlot,
    dailyProgressPercentage,
    completedTasksCount,
    remainingTasksCount,
    setTaskStatus,
  } = usePlanner();

  const { getBeatById, playBeat, startSession } = useMusic();

  const activeBeat = currentTask?.associatedBeatId
    ? getBeatById(currentTask.associatedBeatId)
    : null;

  const nextBeat = nextTask?.associatedBeatId
    ? getBeatById(nextTask.associatedBeatId)
    : null;

  return (
    <div id="today-overview-section" className="space-y-4">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Daily Progress */}
        <div
          id="card-daily-progress"
          className="rounded-2xl border border-[#1E2430] bg-[#0F1218] p-4.5 shadow-sm transition hover:border-slate-800"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Today's Progress
            </span>
            <span className="font-mono text-sm font-bold text-emerald-400">
              {dailyProgressPercentage}%
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#1E2430]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-sm shadow-emerald-500/30"
              style={{ width: `${Math.min(100, Math.max(0, dailyProgressPercentage))}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
            <span>{completedTasksCount} completed</span>
            <span>{remainingTasksCount} remaining</span>
          </div>
        </div>

        {/* Focus Goals Summary */}
        <div
          id="card-goals-summary"
          className="rounded-2xl border border-[#1E2430] bg-[#0F1218] p-4.5 shadow-sm transition hover:border-slate-800"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Focus Goals
            </span>
            <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-400">
              {goals.length} Active
            </span>
          </div>
          <div className="mt-2.5 space-y-1.5">
            {goals.slice(0, 2).map((goal) => (
              <div key={goal.id} className="flex items-center space-x-2 truncate text-xs text-slate-300">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <span className="truncate font-medium">{goal.title}</span>
              </div>
            ))}
            {goals.length === 0 && (
              <p className="text-xs italic text-slate-500">No focus goals logged today.</p>
            )}
            {goals.length > 2 && (
              <span className="text-[11px] font-medium text-slate-500">+{goals.length - 2} more goals</span>
            )}
          </div>
        </div>

        {/* Task Velocity */}
        <div
          id="card-task-velocity"
          className="rounded-2xl border border-[#1E2430] bg-[#0F1218] p-4.5 shadow-sm transition hover:border-slate-800"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Completed Tasks
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="font-mono text-2xl font-bold text-slate-100">
              {completedTasksCount}
            </span>
            <span className="text-xs text-slate-400">
              of {completedTasksCount + remainingTasksCount} total tasks
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {remainingTasksCount === 0 && completedTasksCount > 0
              ? '✨ All planned tasks completed!'
              : `${remainingTasksCount} tasks remaining in schedule`}
          </p>
        </div>

        {/* End of Day Review link */}
        <div
          id="card-daily-review-cta"
          onClick={onOpenDailyReview}
          className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-[#1E2430] bg-gradient-to-br from-[#0F1218] to-[#141820] p-4.5 shadow-sm transition hover:border-emerald-500/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Daily Review
            </span>
            <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
              Reflect & Close Day
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Log insights, review missed time blocks & prep tomorrow.
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Current Task & Next Task Split */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* CURRENT TASK / NOW HERO (8 cols) */}
        <div
          id="hero-current-task"
          className="relative overflow-hidden rounded-2xl border border-[#1E2430] bg-[#0F1218] p-5.5 shadow-md lg:col-span-8"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />

          {/* Top Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {currentTask ? 'NOW — Active Task' : 'NOW — Free Space'}
              </span>
            </div>

            {currentSlotRemainingMinutes !== null && (
              <div className="flex items-center space-x-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-300">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                <span>{currentSlotRemainingMinutes}m remaining</span>
              </div>
            )}
          </div>

          {currentTask ? (
            <div className="mt-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-100">
                    {currentTask.title}
                  </h3>
                  {currentTask.description && (
                    <p className="mt-1 text-sm text-slate-400 max-w-xl">
                      {currentTask.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg border border-[#1E2430] bg-[#141820] px-2.5 py-1 font-mono text-xs font-semibold text-slate-300">
                      {currentTask.startTime} → {currentTask.endTime}
                    </span>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                        currentTask.priority === 'critical'
                          ? 'border border-rose-500/30 bg-rose-500/10 text-rose-400'
                          : currentTask.priority === 'high'
                          ? 'border border-amber-500/30 bg-amber-500/10 text-amber-400'
                          : 'border border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
                      }`}
                    >
                      {currentTask.priority} Priority
                    </span>
                  </div>
                </div>

                {/* Associated Beat Card */}
                {activeBeat && (
                  <div
                    id="current-task-associated-beat"
                    className="flex shrink-0 items-center space-x-3 rounded-2xl border border-emerald-500/30 bg-[#141820] p-3 shadow-sm"
                  >
                    <button
                      onClick={() => playBeat(activeBeat)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-black shadow-md shadow-emerald-500/20 transition hover:bg-emerald-400"
                      title="Play associated beat"
                    >
                      <Play className="h-4 w-4 fill-black" />
                    </button>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <Music2 className="h-3 w-3 text-emerald-400" />
                        <span className="text-xs font-bold text-slate-200">
                          {activeBeat.title}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {activeBeat.bpm} BPM · {activeBeat.key}
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenBeatDetail(activeBeat.id)}
                      className="rounded-lg border border-slate-700 bg-[#0F1218] px-2 py-1 text-[10px] font-semibold text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40"
                    >
                      Vault
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons for Current Task */}
              <div className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-[#1E2430] pt-4">
                <button
                  id="btn-complete-current-task"
                  onClick={() => setTaskStatus(currentTask.id, 'completed')}
                  className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
                >
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Mark Complete</span>
                </button>

                {currentTask.status !== 'in_progress' && (
                  <button
                    id="btn-start-current-task"
                    onClick={() => setTaskStatus(currentTask.id, 'in_progress')}
                    className="flex items-center space-x-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>Set In Progress</span>
                  </button>
                )}

                <button
                  id="btn-reschedule-current-task"
                  onClick={() => onOpenReschedule(currentTask)}
                  className="flex items-center space-x-1.5 rounded-xl border border-[#1E2430] bg-[#141820] px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-700 hover:text-slate-100"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                  <span>Reschedule</span>
                </button>

                {activeBeat && (
                  <button
                    id="btn-studio-current-task"
                    onClick={() => startSession(activeBeat.id, activeBeat.title)}
                    className="flex items-center space-x-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                  >
                    <Flame className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Launch Studio Session</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <Coffee className="h-5 w-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-slate-100">
                    No scheduled task at this moment
                  </h3>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {currentFreeTimeSlot
                    ? `You have free space until ${currentFreeTimeSlot.end} (${currentFreeTimeSlot.duration} minutes). Ideal for quick focus, beat composition, or breaks.`
                    : 'Your schedule is currently clear. Schedule a block or take a break!'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  id="btn-free-time-add-task"
                  onClick={onOpenAddTask}
                  className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
                >
                  <Clock className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Schedule Task Now</span>
                </button>

                <button
                  id="btn-free-time-session"
                  onClick={() => startSession()}
                  className="flex items-center space-x-1.5 rounded-xl border border-[#1E2430] bg-[#141820] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-700 hover:text-slate-100"
                >
                  <Music2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Start Free Studio Session</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* NEXT UP SCHEDULED TASK (4 cols) */}
        <div
          id="hero-next-task"
          className="flex flex-col justify-between rounded-2xl border border-[#1E2430] bg-[#0F1218] p-5.5 shadow-md lg:col-span-4"
        >
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Next Up
              </span>
            </div>

            {nextTask ? (
              <div className="mt-3.5">
                <h4 className="text-base font-bold text-slate-100">
                  {nextTask.title}
                </h4>
                <div className="mt-1.5 flex items-center space-x-2 text-xs text-slate-400">
                  <span className="font-mono font-medium text-emerald-400">{nextTask.startTime} → {nextTask.endTime}</span>
                  <span>·</span>
                  <span>{nextTask.durationMinutes} min</span>
                </div>
                {nextTask.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-slate-400">
                    {nextTask.description}
                  </p>
                )}

                {nextBeat && (
                  <div className="mt-3.5 flex items-center space-x-2 rounded-xl border border-[#1E2430] bg-[#141820] p-2 text-xs text-slate-300">
                    <Music2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="truncate font-medium text-slate-200">
                      Beat: {nextBeat.title}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center justify-center py-6 text-center text-slate-500">
                <Calendar className="h-6 w-6 stroke-1 text-slate-600" />
                <p className="mt-2 text-xs">No upcoming tasks scheduled for today.</p>
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-[#1E2430] pt-3.5">
            <button
              onClick={onOpenAddTask}
              className="flex w-full items-center justify-center space-x-1.5 rounded-xl border border-dashed border-[#1E2430] py-2 text-xs font-semibold text-slate-400 transition hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-[#141820]"
            >
              <span>+ Add another scheduled block</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
