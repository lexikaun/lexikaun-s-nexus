import React, { useState } from 'react';
import {
  Sunset,
  Check,
  ArrowRight,
  Sparkles,
  X,
  RotateCw,
} from 'lucide-react';
import { Task } from '../../types';

export interface DailyShutdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onRescheduleTask: (taskId: string, newDate: string) => Promise<void> | void;
}

export const DailyShutdownModal: React.FC<DailyShutdownModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onRescheduleTask,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [reflection, setReflection] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  if (!isOpen) return null;

  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const completedToday = todayTasks.filter((t) => t.status === 'completed');
  const incompleteToday = todayTasks.filter((t) => t.status !== 'completed');

  const handleMoveToTomorrow = async (taskId: string) => {
    await onRescheduleTask(taskId, tomorrowStr);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl bg-bg-main border border-border-main/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-border-main/50 flex items-center justify-between bg-surface/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Sunset className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-main">Daily Shutdown Ritual</h2>
              <p className="text-[11px] text-text-secondary font-mono">
                Step {step} of 2 • Close out today and unplug
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-surface/40 border border-border-main/40">
                  <div className="text-[10px] font-mono uppercase text-text-secondary">Completed</div>
                  <div className="text-xl font-mono font-semibold text-emerald-400 mt-1">
                    {completedToday.length} tasks
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface/40 border border-border-main/40">
                  <div className="text-[10px] font-mono uppercase text-text-secondary">Remaining</div>
                  <div className="text-xl font-mono font-semibold text-text-main mt-1">
                    {incompleteToday.length} tasks
                  </div>
                </div>
              </div>

              {/* Incomplete Tasks to wrap up */}
              {incompleteToday.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-text-main">Unfinished Work</h3>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {incompleteToday.map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-lg bg-surface hairline-border flex items-center justify-between gap-2"
                      >
                        <span className="text-xs font-medium text-text-main truncate flex-1">
                          {t.title}
                        </span>
                        <button
                          onClick={() => handleMoveToTomorrow(t.id)}
                          className="px-2.5 py-1 rounded bg-surface hover:bg-surface/80 border border-border-main/60 text-[11px] font-mono text-text-secondary hover:text-text-main flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Push Tomorrow</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-text-main">Daily Reflection</h3>
                <p className="text-[11px] text-text-secondary">
                  What went well today? What will you create or tackle next?
                </p>
              </div>

              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Log a quick daily thought, studio breakthrough, or gratitude..."
                rows={4}
                className="w-full bg-surface/70 text-text-main text-xs rounded-xl p-3 border border-border-main/60 focus:border-amber-500 focus:outline-none placeholder:text-text-secondary/40 resize-none font-sans"
              />

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-xs text-text-main">
                  You've put in the work today. Disconnect cleanly and rest your mind.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-main/50 flex items-center justify-between bg-surface/30">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-text-secondary hover:text-text-main hover:bg-surface transition-colors cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Next: Reflection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Complete Shutdown</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
