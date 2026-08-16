import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus, Flame, Check, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import {
  subscribeToHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitDate,
} from '../services/db';
import { calculateStreak } from '../utils/streak';
import { Habit } from '../types';

export const PersonalHabits: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.uid || 'local-producer-01';

  const [habits, setHabits] = useState<Habit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Form fields
  const [habitName, setHabitName] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [preferredTime, setPreferredTime] = useState('Morning');

  // Generate the last 7 days dynamically
  const getPast7Days = () => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({ dateStr, label });
    }
    return days;
  };

  const past7Days = getPast7Days();

  useEffect(() => {
    const unsub = subscribeToHabits(userId, (loadedHabits) => {
      setHabits(loadedHabits);
    });
    return () => unsub();
  }, [userId]);

  const handleSaveHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    if (editingHabit) {
      await updateHabit(userId, editingHabit.id, {
        name: habitName.trim(),
        frequency,
        preferredTime,
      });
      setEditingHabit(null);
    } else {
      const newHabit: Habit = {
        id: 'habit_' + Date.now(),
        userId,
        name: habitName.trim(),
        frequency,
        preferredTime,
        streak: 0,
        completionHistory: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await createHabit(userId, newHabit);
    }

    setHabitName('');
    setIsModalOpen(false);
  };

  const handleToggleDay = async (habit: Habit, dateStr: string) => {
    const updatedHabit = await toggleHabitDate(userId, habit.id, dateStr);
    // Recalculate streak based on the updated history map
    const newStreak = calculateStreak(updatedHabit.completionHistory);
    await updateHabit(userId, habit.id, { streak: newStreak });
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setHabitName(habit.name);
    setFrequency(habit.frequency || 'daily');
    setPreferredTime(habit.preferredTime || 'Morning');
    setIsModalOpen(true);
  };

  const handleDelete = async (habitId: string) => {
    await deleteHabit(userId, habitId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium tracking-tight text-text-main">Habits</h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-surface hairline-border text-red-main font-medium">
              Personal Space Only
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Consistent personal rituals tracked with direct completion maps.
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="gap-2"
          onClick={() => {
            setEditingHabit(null);
            setHabitName('');
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Habit</span>
        </Button>
      </div>

      {/* Habits List */}
      <div>
        <span className="text-xs uppercase tracking-wider text-text-secondary font-medium block mb-2">
          Active Habits ({habits.length})
        </span>

        {habits.length === 0 ? (
          <div className="py-10 text-center text-xs text-text-secondary border border-border-main border-dashed rounded-lg">
            No habits created yet. Click "New Habit" to start your daily rituals.
          </div>
        ) : (
          <div className="divide-y divide-border-main hairline-border rounded-lg bg-bg-main">
            {habits.map((habit) => {
              const liveStreak = calculateStreak(habit.completionHistory);
              return (
                <div
                  key={habit.id}
                  className="py-3 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface/40 transition-colors group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary capitalize">{habit.frequency}</span>
                      <span className="text-xs text-text-secondary">•</span>
                      <span className="text-xs text-text-secondary">{habit.preferredTime}</span>
                      <span className="text-xs text-red-main flex items-center gap-1 font-mono">
                        <Flame className="w-3 h-3 fill-red-main" /> {liveStreak}d streak
                      </span>
                    </div>
                    <h2 className="text-sm font-normal text-text-main">{habit.name}</h2>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* 7-Day Interactive History Map */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {past7Days.map(({ dateStr, label }) => {
                        const isDone = !!habit.completionHistory?.[dateStr];
                        return (
                          <div key={dateStr} className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-text-secondary font-mono">{label}</span>
                            <button
                              onClick={() => handleToggleDay(habit, dateStr)}
                              className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-colors cursor-pointer ${
                                isDone
                                  ? 'bg-red-main text-white'
                                  : 'bg-bg-main hairline-border text-transparent hover:border-red-main'
                              }`}
                              title={`Toggle ${label} (${dateStr})`}
                            >
                              {isDone && <Check className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                      <button
                        onClick={() => handleOpenEdit(habit)}
                        className="p-1 text-text-secondary hover:text-text-main transition-colors cursor-pointer"
                        title="Edit Habit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(habit.id)}
                        className="p-1 text-text-secondary hover:text-red-main transition-colors cursor-pointer"
                        title="Delete Habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Habit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHabit ? 'Edit Habit' : 'New Habit'}
      >
        <form onSubmit={handleSaveHabit} className="space-y-4">
          <Input
            label="Habit Name"
            placeholder="e.g. Morning Meditation or 30-min Audio Synthesis"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary font-medium">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-surface border border-border-main rounded-md px-3 py-2 text-sm text-text-main focus:outline-none focus:border-red-main"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekly">Weekly</option>
                <option value="5 days / week">5 days / week</option>
              </select>
            </div>

            <Input
              label="Preferred Time / Window"
              placeholder="e.g. 08:00 AM or Morning"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingHabit ? 'Save Changes' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

