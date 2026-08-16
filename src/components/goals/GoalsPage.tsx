import React from 'react';
import { GoalsList } from '../dashboard/GoalsList';
import { Goal } from '../../types';
import { Target } from 'lucide-react';

interface GoalsPageProps {
  onOpenAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({ onOpenAddGoal, onEditGoal }) => {
  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-slate-100">Goals</h1>
          <p className="mt-2 text-sm text-slate-400">Define and track your objectives.</p>
        </div>
        <button
          onClick={onOpenAddGoal}
          className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
        >
          <Target className="h-4 w-4" />
          <span>New Goal</span>
        </button>
      </div>

      <div className="rounded-2xl border border-[#27272a] bg-[#121214] p-6 shadow-xl">
        <GoalsList
          onOpenAddGoal={onOpenAddGoal}
          onEditGoal={onEditGoal}
        />
      </div>
    </div>
  );
};
