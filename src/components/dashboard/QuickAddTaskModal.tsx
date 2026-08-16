import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Music2, Target, Sparkles, Check } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { useMusic } from '../../context/MusicContext';
import { Task, Priority, RecurrenceType } from '../../types';

interface QuickAddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGoalId?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  editingTask?: Task | null;
}

export const QuickAddTaskModal: React.FC<QuickAddTaskModalProps> = ({
  isOpen,
  onClose,
  initialGoalId,
  initialStartTime,
  initialEndTime,
  editingTask,
}) => {
  const { addTask, updateTask, goals, selectedDate } = usePlanner();
  const { beats } = useMusic();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalId, setGoalId] = useState<string>('');
  const [date, setDate] = useState<string>(selectedDate);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:30');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [priority, setPriority] = useState<Priority>('medium');
  const [associatedBeatId, setAssociatedBeatId] = useState<string>('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setGoalId(editingTask.goalId || '');
      setDate(editingTask.date);
      setStartTime(editingTask.startTime);
      setEndTime(editingTask.endTime);
      setDurationMinutes(editingTask.durationMinutes);
      setPriority(editingTask.priority);
      setAssociatedBeatId(editingTask.associatedBeatId || '');
      setRecurrence(editingTask.recurrence || 'none');
      setNotes(editingTask.notes || '');
    } else {
      setTitle('');
      setDescription('');
      setGoalId(initialGoalId || '');
      setDate(selectedDate);
      setStartTime(initialStartTime || '14:00');
      setEndTime(initialEndTime || '15:30');
      setPriority('medium');
      setAssociatedBeatId('');
      setRecurrence('none');
      setNotes('');

      if (initialStartTime && initialEndTime) {
        const [sh, sm] = initialStartTime.split(':').map(Number);
        const [eh, em] = initialEndTime.split(':').map(Number);
        setDurationMinutes(Math.max(15, (eh * 60 + em) - (sh * 60 + sm)));
      } else {
        setDurationMinutes(90);
      }
    }
  }, [editingTask, initialGoalId, initialStartTime, initialEndTime, selectedDate, isOpen]);

  // Recalculate duration when times change
  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    const [sh, sm] = newStart.split(':').map(Number);
    const endMinutes = sh * 60 + sm + durationMinutes;
    const eh = Math.min(23, Math.floor(endMinutes / 60));
    const em = endMinutes % 60;
    setEndTime(`${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`);
  };

  const handleEndTimeChange = (newEnd: string) => {
    setEndTime(newEnd);
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = newEnd.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff > 0) {
      setDurationMinutes(diff);
    }
  };

  const handleDurationChange = (dur: number) => {
    setDurationMinutes(dur);
    const [sh, sm] = startTime.split(':').map(Number);
    const endMinutes = sh * 60 + sm + dur;
    const eh = Math.min(23, Math.floor(endMinutes / 60));
    const em = endMinutes % 60;
    setEndTime(`${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      await updateTask({
        ...editingTask,
        title: title.trim(),
        description: description.trim() || undefined,
        goalId: goalId || undefined,
        date,
        startTime,
        endTime,
        durationMinutes,
        priority,
        associatedBeatId: associatedBeatId || undefined,
        recurrence,
        notes: notes.trim() || undefined,
      });
    } else {
      await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        goalId: goalId || undefined,
        date,
        startTime,
        endTime,
        durationMinutes,
        priority,
        status: 'planned',
        associatedBeatId: associatedBeatId || undefined,
        recurrence,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div
        id="modal-quick-add-task"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-[#1E2430] bg-[#0F1218] p-6 shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2430] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              {editingTask ? 'Edit Scheduled Task' : 'Schedule New Task'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#141820] hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Task Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Study Mathematics / Arrange drum drop"
              className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3.5 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-500/60 focus:bg-[#141820]"
            />
          </div>

          {/* Goal & Priority */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Parent Goal (Optional)
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-2 text-xs text-slate-200 outline-none transition focus:border-emerald-500/60"
              >
                <option value="">None (Independent Task)</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    🎯 {g.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-2 text-xs text-slate-200 outline-none transition focus:border-emerald-500/60"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical (Must Do)</option>
              </select>
            </div>
          </div>

          {/* Time Blocking Row */}
          <div className="rounded-xl border border-[#1E2430] bg-[#141820] p-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Time Block</span>
              <span className="font-mono text-emerald-400 font-bold">
                {durationMinutes} minutes
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#1E2430] bg-[#0A0C10] px-2.5 py-1.5 font-mono text-xs text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#1E2430] bg-[#0A0C10] px-2.5 py-1.5 font-mono text-xs text-slate-200 outline-none"
                />
              </div>
            </div>

            {/* Quick Duration Preset Pills */}
            <div className="mt-2.5 flex items-center space-x-1.5">
              {[30, 45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleDurationChange(mins)}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                    durationMinutes === mins
                      ? 'bg-emerald-500 font-bold text-black'
                      : 'border border-[#1E2430] bg-[#0A0C10] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Associate with Beat */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Associate with Beat (Optional)
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <select
                value={associatedBeatId}
                onChange={(e) => setAssociatedBeatId(e.target.value)}
                className="w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-2 text-xs text-slate-200 outline-none transition focus:border-emerald-500/60"
              >
                <option value="">No Beat Linked</option>
                {beats.map((b) => (
                  <option key={b.id} value={b.id}>
                    🎵 {b.title} ({b.bpm} BPM · {b.genre})
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Allows you to directly jump into studio session or play stems when this task is active.
            </p>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Notes & Specific Actions
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Chapter 4 exercises 1-15, or check sub bass saturation"
              className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-2 text-xs text-slate-200 outline-none transition focus:border-emerald-500/60"
            />
          </div>

          {/* Footer Buttons */}
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
              className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
            >
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>{editingTask ? 'Save Changes' : 'Schedule Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
