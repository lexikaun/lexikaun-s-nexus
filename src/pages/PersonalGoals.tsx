import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Calendar } from 'lucide-react';

export const PersonalGoals: React.FC = () => {
  const personalGoals = [
    {
      id: '1',
      title: 'Run 10K Marathon in Under 50 Minutes',
      description: 'Progressive weekly distance building, zone 2 cardio & recovery.',
      deadline: 'Nov 15, 2026',
      progress: 70,
      priority: 'high'
    },
    {
      id: '2',
      title: 'Read 12 Non-Fiction Books This Year',
      description: 'Focus on music business, cognitive psychology, and sound synthesis.',
      deadline: 'Dec 31, 2026',
      progress: 58,
      priority: 'medium'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-text-main">Personal Goals</h1>
          <p className="text-xs text-text-secondary mt-1">Life aspirations, fitness & personal development</p>
        </div>
        <Button size="sm" variant="secondary">
          <Plus className="w-3.5 h-3.5 mr-1" />
          New Goal
        </Button>
      </div>

      <div className="space-y-3">
        {personalGoals.map((g) => (
          <Card key={g.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-bg-main hairline-border text-text-secondary font-mono">
                    {g.priority.toUpperCase()}
                  </span>
                  <span className="text-xs text-text-secondary flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Due {g.deadline}
                  </span>
                </div>
                <h2 className="text-sm font-normal text-text-main">{g.title}</h2>
                <p className="text-xs text-text-secondary mt-0.5">{g.description}</p>
              </div>
              <span className="text-xs font-mono text-text-main">{g.progress}%</span>
            </div>

            <div className="w-full bg-bg-main h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-red-main h-full rounded-full transition-all duration-300"
                style={{ width: `${g.progress}%` }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
