import React, { useState } from 'react';
import { useHabits } from '../../context/HabitContext';
import { Repeat, Plus, Check, X, Info } from 'lucide-react';

export const HabitsPage: React.FC = () => {
  const { habits, addHabit, recordHabitLog } = useHabits();
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitFrequency, setNewHabitFrequency] = useState('daily');
  const [newHabitTime, setNewHabitTime] = useState('');

  const handleCreateHabit = async () => {
    if (!newHabitName.trim()) return;
    await addHabit({
      name: newHabitName.trim(),
      frequency: newHabitFrequency,
      preferredTime: newHabitTime.trim() || undefined,
    });
    setNewHabitName('');
    setNewHabitTime('');
    setNewHabitFrequency('daily');
    setIsAdding(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-slate-100">Habits</h1>
          <p className="mt-2 text-sm text-slate-400">Build consistency over time.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Add Habit</span>
        </button>
      </div>

      {isAdding && (
        <div className="rounded-2xl border border-[#27272a] bg-[#121214] p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-slate-100">Create New Habit</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Habit Name</label>
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="e.g. Morning Workout"
                className="w-full rounded-xl border border-[#27272a] bg-[#09090b] px-4 py-2.5 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Frequency</label>
              <select
                value={newHabitFrequency}
                onChange={(e) => setNewHabitFrequency(e.target.value)}
                className="w-full rounded-xl border border-[#27272a] bg-[#09090b] px-4 py-2.5 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Time (Optional)</label>
              <input
                type="text"
                value={newHabitTime}
                onChange={(e) => setNewHabitTime(e.target.value)}
                placeholder="e.g. 07:00 AM"
                className="w-full rounded-xl border border-[#27272a] bg-[#09090b] px-4 py-2.5 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setIsAdding(false)}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateHabit}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
            >
              Save Habit
            </button>
          </div>
        </div>
      )}

      {/* Habits List */}
      <div className="space-y-4">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#27272a] py-16 text-slate-500">
            <Repeat className="h-8 w-8 stroke-1 text-slate-600" />
            <p className="mt-4 text-sm">No habits established yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="group flex flex-col justify-between rounded-2xl border border-[#27272a] bg-[#121214] p-5 shadow-sm transition hover:border-[#3f3f46]"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-slate-100">{habit.name}</h3>
                    <div className="flex items-center space-x-1 rounded bg-[#18181b] px-2 py-0.5 text-[10px] font-bold text-slate-400">
                      <Repeat className="mr-1 h-3 w-3 text-emerald-500/70" />
                      {habit.frequency}
                    </div>
                  </div>
                  {habit.preferredTime && (
                    <p className="mt-1 text-xs text-slate-500">Prefers: {habit.preferredTime}</p>
                  )}
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-slate-500">Current Streak: </span>
                      <span className="font-mono font-semibold text-emerald-400">{habit.streak} days</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#27272a] pt-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Did you do this today?</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => recordHabitLog(habit.id, false)}
                      className="rounded-full bg-[#18181b] p-2 text-slate-400 transition hover:bg-rose-500/20 hover:text-rose-400"
                      title="Missed"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => recordHabitLog(habit.id, true)}
                      className="rounded-full bg-emerald-500/10 p-2 text-emerald-500 transition hover:bg-emerald-500 hover:text-black"
                      title="Completed"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
