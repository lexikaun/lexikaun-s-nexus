import React from 'react';
import { Button } from '../components/ui/Button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export const PersonalPlanner: React.FC = () => {
  const blocks = [
    { time: '07:00 AM', label: 'Morning Routine & Meditation', duration: '45m' },
    { time: '08:00 AM', label: 'Healthy Breakfast & News Scan', duration: '30m' },
    { time: '05:30 PM', label: 'Studio Cable Run & Errands', duration: '1h' },
    { time: '07:00 PM', label: 'Dinner & Relaxation', duration: '1h' },
    { time: '09:00 PM', label: 'Reading & Wind-down', duration: '45m' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-text-main">Personal Planner</h1>
          <p className="text-xs text-text-secondary mt-1">Life-side routines and personal time blocks</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface hairline-border rounded-md px-2 py-1 gap-2 text-xs">
            <button className="text-text-secondary hover:text-text-main"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <span className="font-medium text-text-main">Tuesday, Aug 18</span>
            <button className="text-text-secondary hover:text-text-main"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
          <Button size="sm" variant="secondary">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Block Time
          </Button>
        </div>
      </div>

      <div className="hairline-border rounded-lg bg-bg-main divide-y divide-border-main">
        {blocks.map((block, i) => (
          <div key={i} className="flex min-h-[50px] items-center p-3 hover:bg-surface/30 transition-colors">
            <div className="w-24 text-xs font-mono text-text-secondary">{block.time}</div>
            <div className="flex-1 p-2 rounded bg-surface text-xs text-text-main flex items-center justify-between">
              <span>{block.label}</span>
              <span className="text-text-secondary font-mono">{block.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
