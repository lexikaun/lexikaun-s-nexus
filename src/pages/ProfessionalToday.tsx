import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckCircle, Plus, Calendar, Disc } from 'lucide-react';

export const ProfessionalToday: React.FC = () => {
  const currentTask = {
    title: "Vocal Layering & Comping for EP Track 2",
    time: "10:30 AM – 12:30 PM",
    goal: "Release 5-Track EP",
    associatedBeat: "Midnight Chill (120 BPM - D Min)",
    duration: "2h 00m"
  };

  const todaySchedule = [
    { id: '1', title: "Review Master Stems from Sound Engineer", time: "09:00 AM", duration: "45m", status: "completed", goal: "EP Quality Check" },
    { id: '2', title: "Vocal Layering & Comping for EP Track 2", time: "10:30 AM", duration: "2h", status: "active", goal: "Release 5-Track EP" },
    { id: '3', title: "Arrange Synth Lead & Bridge Transitions", time: "02:00 PM", duration: "1h 30m", status: "upcoming", goal: "Release 5-Track EP" },
    { id: '4', title: "Export WAV Previews & Prepare Social Teaser", time: "04:30 PM", duration: "1h", status: "upcoming", goal: "EP Marketing" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-text-main">Today</h1>
          <p className="text-xs text-text-secondary mt-1">Professional ritual · Tuesday, August 18</p>
        </div>
        <Button size="sm" variant="secondary" className="gap-2">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </Button>
      </div>

      {/* Current Focus Card — Distinct Object */}
      <div>
        <span className="text-xs uppercase tracking-wider text-text-secondary font-medium block mb-2">
          Current Focus
        </span>
        <Card className="p-4 border-l-2 border-l-red-main">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <span className="text-xs text-red-main font-medium inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-main animate-pulse" />
                In Progress ({currentTask.time})
              </span>
              <h2 className="text-sm font-medium text-text-main">{currentTask.title}</h2>
              <div className="flex items-center gap-4 text-xs text-text-secondary pt-0.5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {currentTask.goal}
                </span>
                <span className="flex items-center gap-1.5">
                  <Disc className="w-3.5 h-3.5" />
                  {currentTask.associatedBeat}
                </span>
              </div>
            </div>
            <Button size="sm" variant="primary" className="gap-2 shrink-0">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Done</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Today's Schedule — Plain Rows with Dividers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-text-secondary font-medium">
            Timeline (4 items)
          </span>
          <span className="text-xs text-text-secondary">4h 15m planned</span>
        </div>

        <div className="divide-y divide-border-main hairline-border rounded-lg bg-bg-main">
          {todaySchedule.map((item) => (
            <div key={item.id} className="py-3 px-3 flex items-center justify-between hover:bg-surface/40 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-secondary font-mono w-16 shrink-0">{item.time}</span>
                <div>
                  <h3 className={`text-sm font-normal ${item.status === 'completed' ? 'text-text-secondary line-through' : 'text-text-main'}`}>
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                    <span>{item.duration}</span>
                    <span>•</span>
                    <span>{item.goal}</span>
                  </div>
                </div>
              </div>
              <div>
                {item.status === 'completed' ? (
                  <span className="text-xs text-text-secondary">Done</span>
                ) : item.status === 'active' ? (
                  <span className="text-xs text-red-main">Active</span>
                ) : (
                  <span className="text-xs text-text-secondary">Upcoming</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
