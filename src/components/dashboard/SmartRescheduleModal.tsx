import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Clock, Sparkles, Check, ArrowRight, Calendar } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { Task, SmartRescheduleSuggestion } from '../../types';

interface SmartRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTask?: Task | null;
}

export const SmartRescheduleModal: React.FC<SmartRescheduleModalProps> = ({
  isOpen,
  onClose,
  targetTask,
}) => {
  const {
    rescheduleSuggestions,
    applyRescheduleSuggestion,
    dismissRescheduleSuggestion,
    updateTask,
    selectedDate,
  } = usePlanner();

  const [customStart, setCustomStart] = useState('17:00');
  const [customEnd, setCustomEnd] = useState('17:45');
  const [customDate, setCustomDate] = useState(selectedDate);
  const [completedMinutes, setCompletedMinutes] = useState(0);

  useEffect(() => {
    if (targetTask) {
      setCustomDate(targetTask.date);
      setCustomStart(targetTask.startTime);
      setCustomEnd(targetTask.endTime);
      setCompletedMinutes(targetTask.actualDurationMinutes || 0);
    }
  }, [targetTask, isOpen]);

  if (!isOpen) return null;

  // If there's an active suggestion matching the target task
  const matchingSuggestion = targetTask
    ? rescheduleSuggestions.find((s) => s.task.id === targetTask.id)
    : rescheduleSuggestions[0];

  const activeTask = targetTask || matchingSuggestion?.task;

  const handleApplySuggestion = async (s: SmartRescheduleSuggestion) => {
    await applyRescheduleSuggestion(s);
    onClose();
  };

  const handleManualReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;

    const [sh, sm] = customStart.split(':').map(Number);
    const [eh, em] = customEnd.split(':').map(Number);
    const remainingDur = Math.max(15, (eh * 60 + em) - (sh * 60 + sm));

    await updateTask({
      ...activeTask,
      date: customDate,
      startTime: customStart,
      endTime: customEnd,
      durationMinutes: remainingDur,
      actualDurationMinutes: completedMinutes,
      status: 'rescheduled',
    });

    if (matchingSuggestion) {
      dismissRescheduleSuggestion(activeTask.id);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div
        id="modal-smart-reschedule"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-[#1E2430] bg-[#0F1218] p-6 shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2430] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <RotateCcw className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Smart Rescheduling
              </h3>
              <p className="text-xs text-slate-400">
                Reclaim unfinished blocks without disrupting your flow.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#141820] hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {activeTask ? (
          <div className="mt-5 space-y-4">
            {/* Task Info Summary */}
            <div className="rounded-xl border border-[#1E2430] bg-[#141820] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Unfinished / Missed Task
                  </span>
                  <h4 className="text-sm font-bold text-slate-100">
                    {activeTask.title}
                  </h4>
                </div>
                <span className="rounded-md border border-[#1E2430] bg-[#0A0C10] px-2 py-0.5 font-mono text-xs font-semibold text-slate-300">
                  {activeTask.startTime} → {activeTask.endTime}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#1E2430] pt-2.5 text-xs text-slate-400">
                <span>Planned: {activeTask.durationMinutes} min</span>
                <span>Original Slot: {activeTask.startTime}</span>
              </div>
            </div>

            {/* Smart Suggested Slot (if available) */}
            {matchingSuggestion && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                  <Sparkles className="h-4 w-4" />
                  <span>AI Schedule Recommendation</span>
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  {matchingSuggestion.reason}
                </p>

                <div className="mt-3 flex items-center justify-between rounded-xl border border-[#1E2430] bg-[#0A0C10] p-3">
                  <div className="flex items-center space-x-2 font-mono text-xs font-semibold text-slate-200">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span>
                      {matchingSuggestion.suggestedStartTime} → {matchingSuggestion.suggestedEndTime}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ({matchingSuggestion.unfinishedMinutes} min)
                    </span>
                  </div>

                  <button
                    onClick={() => handleApplySuggestion(matchingSuggestion)}
                    className="flex items-center space-x-1 rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-black shadow-md shadow-emerald-500/20 transition hover:bg-emerald-400"
                  >
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Accept Slot</span>
                  </button>
                </div>
              </div>
            )}

            {/* Or Manually Pick Slot */}
            <form onSubmit={handleManualReschedule} className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-slate-300">
                Or Manually Choose Another Time Slot:
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] text-slate-400">Date</label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-2.5 py-1.5 text-xs text-slate-200 outline-none transition focus:border-emerald-500/60"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400">New Start Time</label>
                  <input
                    type="time"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-2.5 py-1.5 font-mono text-xs text-slate-200 outline-none transition focus:border-emerald-500/60"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400">New End Time</label>
                  <input
                    type="time"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-2.5 py-1.5 font-mono text-xs text-slate-200 outline-none transition focus:border-emerald-500/60"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-[#141820] hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
                >
                  <RotateCcw className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Reschedule to Selected Slot</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400">
            <Check className="mx-auto h-8 w-8 text-emerald-400" />
            <p className="mt-2 text-sm font-semibold text-slate-200">
              No tasks requiring rescheduling!
            </p>
            <p className="mt-1 text-xs text-slate-500">
              All scheduled blocks for today are on track or completed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
