import React from 'react';
import { Button } from '../components/ui/Button';
import { Check, Plus, Sun } from 'lucide-react';

export const PersonalToday: React.FC = () => {
  const habitsToday = [
    { id: '1', name: 'Morning Meditation (15 min)', time: '07:30 AM', completed: true, streak: 5 },
    { id: '2', name: 'Hydration (2.5L goal)', time: 'Throughout day', completed: false, streak: 12 },
    { id: '3', name: '30-Minute Audio Engineering Reading', time: '08:00 PM', completed: false, streak: 3 },
    { id: '4', name: 'Evening Reflection & Gratitude', time: '10:00 PM', completed: false, streak: 7 },
  ];

  const personalTasks = [
    { id: '1', title: 'Buy high-grade TRS studio monitor cables', time: '05:30 PM', priority: 'Medium', done: false },
    { id: '2', title: 'Weekly grocery run & meal prep', time: '06:30 PM', priority: 'High', done: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-text-main">Today</h1>
          <p className="text-xs text-text-secondary mt-1">Personal life-side ritual · Tuesday, August 18</p>
        </div>
        <Button size="sm" variant="secondary" className="gap-2">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </Button>
      </div>

      {/* Habits Today Section (Flattened single-row divider list) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-text-secondary font-medium flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-red-main" /> Habits for Today (1/4 Complete)
          </span>
          <span className="text-xs text-text-secondary">Personal Only</span>
        </div>

        <div className="divide-y divide-border-main hairline-border rounded-lg bg-bg-main">
          {habitsToday.map((habit) => (
            <div
              key={habit.id}
              className="py-3 px-3 flex items-center justify-between hover:bg-surface/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <button
                  className={`w-4 h-4 rounded flex items-center justify-center transition-colors cursor-pointer ${
                    habit.completed
                      ? 'bg-red-main text-white'
                      : 'bg-bg-main hairline-border text-transparent hover:border-red-main'
                  }`}
                >
                  <Check className="w-3 h-3" />
                </button>
                <div>
                  <h3
                    className={`text-sm font-normal ${
                      habit.completed ? 'line-through text-text-secondary' : 'text-text-main'
                    }`}
                  >
                    {habit.name}
                  </h3>
                  <span className="text-xs text-text-secondary">{habit.time}</span>
                </div>
              </div>
              <span className="text-xs font-mono text-red-main">
                {habit.streak}d streak
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Tasks (Plain divider rows with normalized py-3 px-3 padding) */}
      <div>
        <span className="text-xs uppercase tracking-wider text-text-secondary font-medium block mb-2">
          Personal Tasks
        </span>

        <div className="divide-y divide-border-main hairline-border rounded-lg bg-bg-main">
          {personalTasks.map((task) => (
            <div key={task.id} className="py-3 px-3 flex items-center justify-between hover:bg-surface/40 transition-colors">
              <div className="flex items-center gap-3">
                <button className="w-4 h-4 rounded border border-border-main hover:border-red-main transition-colors cursor-pointer" />
                <div>
                  <h3 className="text-sm font-normal text-text-main">{task.title}</h3>
                  <span className="text-xs text-text-secondary">{task.time}</span>
                </div>
              </div>
              <span className="text-xs text-text-secondary font-mono">{task.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
