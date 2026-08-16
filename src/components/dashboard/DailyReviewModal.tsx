import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  TrendingUp,
  Award,
  Smile,
  Save,
  Check,
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { DailyReview } from '../../types';

interface DailyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyReviewModal: React.FC<DailyReviewModalProps> = ({ isOpen, onClose }) => {
  const { tasks, goals, selectedDate, saveDailyReview, reviews } = usePlanner();

  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatToImprove, setWhatToImprove] = useState('');
  const [moodRating, setMoodRating] = useState<number>(5);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Calculate metrics for selectedDate
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const missedTasks = tasks.filter((t) => t.status === 'planned' || t.status === 'in_progress');
  const rescheduledTasks = tasks.filter((t) => t.status === 'rescheduled');

  const completedGoals = goals.filter((g) => g.status === 'completed');

  const totalPlannedMinutes = tasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
  const totalCompletedMinutes = completedTasks.reduce(
    (sum, t) => sum + (t.actualDurationMinutes || t.durationMinutes || 0),
    0
  );

  const completionRate =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Load existing review for this date if present
  useEffect(() => {
    const existing = reviews.find((r) => r.date === selectedDate);
    if (existing) {
      setWhatWentWell(existing.whatWentWell || '');
      setWhatToImprove(existing.whatToImprove || '');
      setMoodRating(existing.moodRating || 5);
    } else {
      setWhatWentWell('');
      setWhatToImprove('');
      setMoodRating(5);
    }
  }, [selectedDate, reviews, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveDailyReview({
      date: selectedDate,
      goalsCompleted: completedGoals.length,
      totalGoals: goals.length,
      tasksCompleted: completedTasks.length,
      tasksMissed: missedTasks.length,
      tasksRescheduled: rescheduledTasks.length,
      totalPlannedMinutes,
      totalCompletedMinutes,
      completionRate,
      whatWentWell: whatWentWell.trim(),
      whatToImprove: whatToImprove.trim(),
      moodRating,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div
        id="modal-daily-review"
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#1E2430] bg-[#0F1218] p-6 shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2430] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                End of Day Performance Review
              </h3>
              <p className="text-xs text-slate-400">
                Review output metrics, celebrate wins, and capture high-leverage learnings.
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

        {/* Metrics Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#1E2430] bg-[#141820] p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Completion Rate
            </span>
            <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">
              {completionRate}%
            </div>
            <span className="text-[11px] text-slate-500">
              {completedTasks.length}/{tasks.length} tasks done
            </span>
          </div>

          <div className="rounded-xl border border-[#1E2430] bg-[#141820] p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Focus Time
            </span>
            <div className="mt-1 font-mono text-2xl font-bold text-slate-100">
              {Math.round(totalCompletedMinutes / 60)}h {totalCompletedMinutes % 60}m
            </div>
            <span className="text-[11px] text-slate-500">
              of {Math.round(totalPlannedMinutes / 60)}h planned
            </span>
          </div>

          <div className="rounded-xl border border-[#1E2430] bg-[#141820] p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Goals Hit
            </span>
            <div className="mt-1 font-mono text-2xl font-bold text-indigo-400">
              {completedGoals.length}/{goals.length}
            </div>
            <span className="text-[11px] text-slate-500">Target outcomes</span>
          </div>

          <div className="rounded-xl border border-[#1E2430] bg-[#141820] p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Rescheduled
            </span>
            <div className="mt-1 font-mono text-2xl font-bold text-amber-400">
              {rescheduledTasks.length}
            </div>
            <span className="text-[11px] text-slate-500">Adjusted blocks</span>
          </div>
        </div>

        {/* Short Reflection Journal Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>What went well today?</span>
            </label>
            <textarea
              rows={3}
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
              placeholder="e.g. Locked in 2 hours uninterrupted on the beat arrangement; finished math chapter cleanly."
              className="mt-1.5 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] p-3 text-xs text-slate-100 outline-none transition focus:border-emerald-500/60 focus:bg-[#141820]"
            />
          </div>

          <div>
            <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
              <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
              <span>What should I improve tomorrow?</span>
            </label>
            <textarea
              rows={3}
              value={whatToImprove}
              onChange={(e) => setWhatToImprove(e.target.value)}
              placeholder="e.g. Leave 15 min buffer between coding and music studio; avoid checking social feeds before noon."
              className="mt-1.5 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] p-3 text-xs text-slate-100 outline-none transition focus:border-emerald-500/60 focus:bg-[#141820]"
            />
          </div>

          {/* Energy / Mood rating */}
          <div>
            <label className="block text-xs font-bold text-slate-200">
              Energy & Focus Rating (1-5)
            </label>
            <div className="mt-2 flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMoodRating(num)}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl font-mono text-xs font-bold transition ${
                    moodRating === num
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                      : 'border border-[#1E2430] bg-[#0A0C10] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {num}★
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end space-x-2 border-t border-[#1E2430] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-[#141820] hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Review Saved!</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Daily Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
