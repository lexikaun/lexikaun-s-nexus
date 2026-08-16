import React from 'react';
import { Button } from '../components/ui/Button';
import { Plus, Flame, Check } from 'lucide-react';

export const PersonalHabits: React.FC = () => {
  const past7Days = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Today'];

  const habits = [
    {
      id: '1',
      name: 'Morning Meditation (15 min)',
      frequency: 'Daily',
      streak: 5,
      history: [true, true, true, true, true, false, true]
    },
    {
      id: '2',
      name: 'Hydration Target (2.5L)',
      frequency: 'Daily',
      streak: 12,
      history: [true, true, true, true, true, true, false]
    },
    {
      id: '3',
      name: 'Audio Engineering Reading (30 min)',
      frequency: '5 days / week',
      streak: 3,
      history: [false, true, true, false, true, true, false]
    },
    {
      id: '4',
      name: 'Evening Gratitude & Reflection',
      frequency: 'Daily',
      streak: 7,
      history: [true, true, true, true, true, true, false]
    }
  ];

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
        <Button size="sm" variant="secondary">
          <Plus className="w-3.5 h-3.5 mr-1" />
          New Habit
        </Button>
      </div>

      {/* Habits List (Divider rows with py-3 px-3 padding) */}
      <div>
        <span className="text-xs uppercase tracking-wider text-text-secondary font-medium block mb-2">
          Active Habits ({habits.length})
        </span>

        <div className="divide-y divide-border-main hairline-border rounded-lg bg-bg-main">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="py-3 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface/40 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-text-secondary">{habit.frequency}</span>
                  <span className="text-xs text-red-main flex items-center gap-1 font-mono">
                    <Flame className="w-3 h-3 fill-red-main" /> {habit.streak}d streak
                  </span>
                </div>
                <h2 className="text-sm font-normal text-text-main">{habit.name}</h2>
              </div>

              {/* 7-Day History Map */}
              <div className="flex items-center gap-1.5 shrink-0">
                {past7Days.map((day, idx) => {
                  const isDone = habit.history[idx];
                  return (
                    <div key={day} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-text-secondary font-mono">{day}</span>
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-colors ${
                          isDone
                            ? 'bg-red-main text-white'
                            : 'bg-bg-main hairline-border text-transparent'
                        }`}
                      >
                        {isDone && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
