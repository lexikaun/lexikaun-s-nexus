import React, { useState, useEffect } from 'react';
import { X, Target, Check } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { Goal, Priority } from '../../types';

interface QuickAddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoal?: Goal | null;
}

export const QuickAddGoalModal: React.FC<QuickAddGoalModalProps> = ({
  isOpen,
  onClose,
  editingGoal,
}) => {
  const { addGoal, updateGoal, selectedDate } = usePlanner();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('high');
  const [date, setDate] = useState(selectedDate);

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setDescription(editingGoal.description || '');
      setPriority(editingGoal.priority);
      setDate(editingGoal.date || selectedDate);
    } else {
      setTitle('');
      setDescription('');
      setPriority('high');
      setDate(selectedDate);
    }
  }, [editingGoal, selectedDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingGoal) {
      await updateGoal({
        ...editingGoal,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        date,
      });
    } else {
      await addGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status: 'active',
        date,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div
        id="modal-quick-add-goal"
        className="relative z-10 w-full max-w-md rounded-2xl border border-[#1E2430] bg-[#0F1218] p-6 shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2430] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Target className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              {editingGoal ? 'Edit Daily Goal' : 'Create Today Goal'}
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
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Goal Outcome Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finish Mathematics preparation / Master Midnight mix"
              className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3.5 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-500/60 focus:bg-[#141820]"
            />
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
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical (Must Achieve)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Description / Target Definition
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Define clear criteria for success (e.g. Revise Chapter 1, solve 20 problems, review mistakes)."
              className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-2 text-xs text-slate-200 outline-none transition focus:border-emerald-500/60"
            />
          </div>

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
              <span>{editingGoal ? 'Save Goal' : 'Create Goal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
