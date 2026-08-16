import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Calendar, CheckSquare } from 'lucide-react';

export const ProfessionalGoals: React.FC = () => {
  const goals = [
    {
      id: '1',
      title: 'Release 5-Track Debut EP',
      description: 'Finish production, mixing, mastering, and packaging for the Autumn release.',
      deadline: 'Oct 31, 2026',
      progress: 60,
      tasksCompleted: 9,
      tasksTotal: 15,
      priority: 'high'
    },
    {
      id: '2',
      title: 'Land 3 Sync Licensing Placements',
      description: 'Pitch instrumental catalog to boutique indie games & film agencies.',
      deadline: 'Dec 15, 2026',
      progress: 25,
      tasksCompleted: 2,
      tasksTotal: 8,
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Launch Producer Sample Pack Vol. 1',
      description: 'Curate 50 high quality drum one-shots, 20 melody loops with key/BPM labels.',
      deadline: 'Nov 20, 2026',
      progress: 40,
      tasksCompleted: 4,
      tasksTotal: 10,
      priority: 'low'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-text-main">Goals</h1>
          <p className="text-xs text-text-secondary mt-1">High-level professional outcomes & linked milestones</p>
        </div>
        <Button size="sm" variant="secondary">
          <Plus className="w-3.5 h-3.5 mr-1" />
          New Goal
        </Button>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {goals.map((goal) => (
          <Card key={goal.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-bg-main hairline-border text-text-secondary font-mono">
                    {goal.priority.toUpperCase()}
                  </span>
                  <span className="text-xs text-text-secondary flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Due {goal.deadline}
                  </span>
                </div>
                <h2 className="text-sm font-normal text-text-main">{goal.title}</h2>
                <p className="text-xs text-text-secondary mt-0.5">{goal.description}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-text-main">{goal.progress}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-bg-main h-1.5 rounded-full overflow-hidden mb-2.5">
              <div
                className="bg-red-main h-full rounded-full transition-all duration-300"
                style={{ width: `${goal.progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-border-main/40">
              <span className="flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" />
                {goal.tasksCompleted} / {goal.tasksTotal} linked tasks completed
              </span>
              <button className="text-text-secondary hover:text-text-main transition-colors">
                View Tasks →
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
