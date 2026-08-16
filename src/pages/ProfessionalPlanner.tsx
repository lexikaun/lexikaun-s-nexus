import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';

export const ProfessionalPlanner: React.FC = () => {
  const timeSlots = [
    { time: '09:00 AM', task: 'Review Master Stems from Sound Engineer', duration: '45m', color: 'border-l-border-main' },
    { time: '10:00 AM', task: null },
    { time: '10:30 AM', task: 'Vocal Layering & Comping for EP Track 2', duration: '2h 00m', color: 'border-l-red-main' },
    { time: '11:30 AM', task: '↳ Continuing Vocal Layering', duration: '', color: 'border-l-red-main' },
    { time: '01:00 PM', task: null },
    { time: '02:00 PM', task: 'Arrange Synth Lead & Bridge Transitions', duration: '1h 30m', color: 'border-l-border-main' },
    { time: '04:00 PM', task: null },
    { time: '04:30 PM', task: 'Export WAV Previews & Prepare Social Teaser', duration: '1h 00m', color: 'border-l-border-main' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-text-main">Planner</h1>
          <p className="text-xs text-text-secondary mt-1">Day time-blocking canvas (Sunsama/Routine model)</p>
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

      {/* Time-blocking Grid */}
      <div className="hairline-border rounded-lg bg-bg-main divide-y divide-border-main">
        {timeSlots.map((slot, i) => (
          <div key={i} className="flex min-h-[52px] group hover:bg-surface/30 transition-colors">
            <div className="w-24 p-3 text-xs font-mono text-text-secondary border-r border-border-main flex items-start">
              {slot.time}
            </div>
            <div className="flex-1 p-2 flex items-center">
              {slot.task ? (
                <div className={`w-full p-2.5 rounded bg-surface border-l-2 ${slot.color} text-xs text-text-main flex items-center justify-between`}>
                  <span>{slot.task}</span>
                  {slot.duration && <span className="text-text-secondary font-mono">{slot.duration}</span>}
                </div>
              ) : (
                <button className="w-full h-full text-left text-xs text-transparent group-hover:text-text-secondary/50 px-2 transition-colors">
                  + Click to schedule
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
