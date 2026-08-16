import React, { useState } from 'react';
import {
  Target,
  Plus,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  ListTodo,
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { Goal, Priority } from '../../types';

interface GoalsListProps {
  onOpenAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onAddTaskForGoal: (goalId: string) => void;
}

export const GoalsList: React.FC<GoalsListProps> = ({
  onOpenAddGoal,
  onEditGoal,
  onAddTaskForGoal,
}) => {
  const { goals, deleteGoal, updateGoal, getGoalProgress, tasks } = usePlanner();
  const [expandedGoalIds, setExpandedGoalIds] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const toggleExpand = (id: string) => {
    setExpandedGoalIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredGoals = goals.filter((g) => {
    if (filterPriority !== 'all' && g.priority !== filterPriority) return false;
    return true;
  });

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'critical':
        return 'border border-rose-500/40 bg-rose-500/10 text-rose-400';
      case 'high':
        return 'border border-amber-500/40 bg-amber-500/10 text-amber-400';
      case 'medium':
        return 'border border-indigo-500/40 bg-indigo-500/10 text-indigo-400';
      default:
        return 'border border-slate-700 bg-slate-800 text-slate-300';
    }
  };

  return (
    <div
      id="goals-management-container"
      className="rounded-2xl border border-[#1E2430] bg-[#0F1218] p-5.5 shadow-sm transition"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Today's Key Goals
            </h3>
            <p className="text-xs text-slate-400">
              High-level desired outcomes breaking down into executable scheduled tasks.
            </p>
          </div>
        </div>

        <button
          id="btn-add-goal-header"
          onClick={onOpenAddGoal}
          className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-black shadow-md shadow-emerald-500/20 transition hover:bg-emerald-400"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goals List */}
      <div className="mt-5 space-y-3">
        {filteredGoals.map((goal) => {
          const progress = getGoalProgress(goal.id);
          const isExpanded = expandedGoalIds.includes(goal.id);
          const goalTasks = tasks.filter((t) => t.goalId === goal.id);

          return (
            <div
              key={goal.id}
              className="rounded-xl border border-[#1E2430] bg-[#141820] p-4 transition hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2.5">
                  <button
                    onClick={() => toggleExpand(goal.id)}
                    className="mt-0.5 text-slate-400 hover:text-slate-200"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getPriorityBadge(
                          goal.priority
                        )}`}
                      >
                        {goal.priority}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-100">
                        {goal.title}
                      </h4>
                    </div>

                    {goal.description && (
                      <p className="mt-1 text-xs text-slate-400">
                        {goal.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress & Actions */}
                <div className="flex items-center space-x-3">
                  <div className="hidden text-right sm:block">
                    <span className="font-mono text-xs font-bold text-slate-300">
                      {progress.completed}/{progress.total} tasks
                    </span>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#1E2430] mt-1">
                      <div
                        className="h-full bg-emerald-500 transition-all shadow-sm shadow-emerald-500/40"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => onAddTaskForGoal(goal.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0F1218] hover:text-emerald-400"
                    title="Add task for this goal"
                  >
                    <Plus className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onEditGoal(goal)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0F1218] hover:text-slate-200"
                    title="Edit Goal"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"
                    title="Delete Goal"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress bar on mobile */}
              <div className="mt-3 sm:hidden">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Progress</span>
                  <span>{progress.completed}/{progress.total} ({progress.percentage}%)</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#1E2430]">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>

              {/* Expanded Child Tasks Sub-list */}
              {isExpanded && (
                <div className="mt-3.5 space-y-2 border-t border-[#1E2430] pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Linked Tasks ({goalTasks.length})
                  </div>
                  {goalTasks.length === 0 ? (
                    <div className="flex items-center justify-between py-1 text-xs text-slate-500">
                      <span>No tasks created for this goal yet.</span>
                      <button
                        onClick={() => onAddTaskForGoal(goal.id)}
                        className="font-semibold text-emerald-400 hover:underline"
                      >
                        + Add first task
                      </button>
                    </div>
                  ) : (
                    goalTasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between rounded-xl border border-[#1E2430] bg-[#0F1218] p-2.5 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              t.status === 'completed'
                                ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                                : t.status === 'in_progress'
                                ? 'bg-amber-400'
                                : 'bg-slate-600'
                            }`}
                          />
                          <span
                            className={
                              t.status === 'completed'
                                ? 'text-slate-500 line-through'
                                : 'text-slate-200'
                            }
                          >
                            {t.title}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">
                          {t.startTime} - {t.endTime}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredGoals.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1E2430] py-8 text-center">
            <Target className="h-8 w-8 text-slate-600" />
            <p className="mt-2 text-xs text-slate-400">
              No goals added yet. Set 2-3 key outcomes for today.
            </p>
            <button
              onClick={onOpenAddGoal}
              className="mt-3 rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-black shadow-md shadow-emerald-500/20 transition hover:bg-emerald-400"
            >
              + Create First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
