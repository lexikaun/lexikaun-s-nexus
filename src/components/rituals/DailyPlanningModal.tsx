import React, { useState } from 'react';
import {
  Sunrise,
  Check,
  ArrowRight,
  Clock,
  Target,
  X,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { Task, Goal } from '../../types';

export interface DailyPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  goals: Goal[];
  onRescheduleTask: (taskId: string, newDate: string) => Promise<void> | void;
  onSelectTask: (task: Task) => void;
}

export const DailyPlanningModal: React.FC<DailyPlanningModalProps> = ({
  isOpen,
  onClose,
  tasks,
  goals,
  onRescheduleTask,
  onSelectTask,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const todayStr = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const overdueTasks = tasks.filter(
    (t) => t.date && t.date < todayStr && t.status !== 'completed'
  );

  const totalPlannedMinutes = todayTasks.reduce((acc, t) => {
    return acc + (t.durationMinutes || t.duration || 30);
  }, 0);
  const plannedHours = Math.floor(totalPlannedMinutes / 60);
  const plannedMins = totalPlannedMinutes % 60;

  const handleMoveOverdueToToday = async (taskId: string) => {
    await onRescheduleTask(taskId, todayStr);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl bg-bg-main border border-border-main/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-border-main/50 flex items-center justify-between bg-surface/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-main/15 border border-red-main/30 flex items-center justify-center text-red-main">
              <Sunrise className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-main">Daily Planning Ritual</h2>
              <p className="text-[11px] text-text-secondary font-mono">
                Step {step} of 3 • Align your focus for today
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-text-main transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Rail */}
        <div className="grid grid-cols-3 border-b border-border-main/40 text-center text-[10px] font-mono">
          <div
            className={`py-2 border-b-2 transition-colors ${
              step === 1
                ? 'border-red-main text-red-main font-semibold bg-red-main/5'
                : step > 1
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-text-secondary'
            }`}
          >
            1. Clear Past Tasks
          </div>
          <div
            className={`py-2 border-b-2 transition-colors ${
              step === 2
                ? 'border-red-main text-red-main font-semibold bg-red-main/5'
                : step > 2
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-text-secondary'
            }`}
          >
            2. Today's Workload
          </div>
          <div
            className={`py-2 border-b-2 transition-colors ${
              step === 3
                ? 'border-red-main text-red-main font-semibold bg-red-main/5'
                : 'border-transparent text-text-secondary'
            }`}
          >
            3. Lock in & Begin
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-text-main">
                  Review Unfinished Tasks from Yesterday
                </h3>
                <p className="text-[11px] text-text-secondary">
                  Move necessary items to today or clear them so your workspace stays clean.
                </p>
              </div>

              {overdueTasks.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-surface/30 border border-dashed border-border-main/40 space-y-1">
                  <Sparkles className="w-5 h-5 text-emerald-500 mx-auto" />
                  <p className="text-xs font-medium text-text-main">All caught up!</p>
                  <p className="text-[11px] text-text-secondary">
                    No overdue tasks from previous days.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {overdueTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-lg bg-surface hairline-border flex items-center justify-between gap-2"
                    >
                      <div className="truncate flex-1">
                        <p className="text-xs font-medium text-text-main truncate">{t.title}</p>
                        <p className="text-[10px] font-mono text-text-secondary">
                          Scheduled for {t.date}
                        </p>
                      </div>
                      <button
                        onClick={() => handleMoveOverdueToToday(t.id)}
                        className="px-2.5 py-1 rounded bg-red-main/15 hover:bg-red-main text-red-main hover:text-white text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Move to Today</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-semibold text-text-main">Today's Focus List</h3>
                  <p className="text-[11px] text-text-secondary">
                    {todayTasks.length} tasks scheduled for today
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-surface border border-border-main/50 text-[11px] font-mono text-text-main flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-red-main" />
                  <span>
                    {plannedHours}h {plannedMins}m planned
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {todayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onSelectTask(t)}
                    className="p-2.5 rounded-lg bg-surface/70 hover:bg-surface border border-border-main/50 flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <span className="truncate flex-1 text-text-main font-medium">{t.title}</span>
                    <span className="text-[10px] font-mono text-text-secondary shrink-0">
                      {t.startTime ? `${t.startTime} - ${t.endTime || ''}` : `${t.durationMinutes || 30}m`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-6 text-center space-y-4 bg-surface/20 rounded-2xl border border-border-main/40">
              <div className="w-12 h-12 rounded-2xl bg-red-main/15 border border-red-main/30 flex items-center justify-center mx-auto text-red-main">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-text-main">Ready for a productive day</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Your day is intentionally time-blocked. Focus on one task at a time and enter the creative flow state.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-border-main/50 flex items-center justify-between bg-surface/30">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-text-secondary hover:text-text-main hover:bg-surface transition-colors cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-4 py-1.5 rounded-lg bg-red-main hover:bg-red-hover text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Begin Today</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
