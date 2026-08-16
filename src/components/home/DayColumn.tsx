import React from 'react';
import { Plus, Clock, Inbox, CheckCircle2 } from 'lucide-react';

export interface DayColumnProps {
  date: Date;
  isToday: boolean;
  onAddTask?: (dateStr: string) => void;
}

export const DayColumn: React.FC<DayColumnProps> = ({ date, isToday, onAddTask }) => {
  const dateStr = date.toISOString().split('T')[0];
  
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNumber = date.getDate();
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });

  return (
    <div className={`flex-1 min-w-[280px] max-w-[400px] flex flex-col h-full border-r border-border-main/40 bg-bg-main/50 select-none ${
      isToday ? 'bg-surface/20' : ''
    }`}>
      {/* Column Header */}
      <div className="p-3.5 border-b border-border-main/50 flex flex-col gap-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              isToday ? 'text-red-main' : 'text-text-secondary'
            }`}>
              {dayName}
            </span>
            <span className={`text-sm font-mono font-medium ${
              isToday ? 'text-text-main font-bold' : 'text-text-main'
            }`}>
              {monthName} {dayNumber}
            </span>
          </div>

          {isToday && (
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-main/15 text-red-main border border-red-main/30 font-medium">
              Today
            </span>
          )}
        </div>

        {/* Daily Completion Progress Bar (Placeholder for Phase 4) */}
        <div className="w-full flex items-center gap-2">
          <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden hairline-border">
            <div
              className="h-full bg-red-main rounded-full transition-all duration-300"
              style={{ width: isToday ? '0%' : '0%' }}
            />
          </div>
          <span className="text-[10px] font-mono text-text-secondary">0/0</span>
        </div>

        {/* Quick Add Task Button */}
        <button
          onClick={() => onAddTask?.(dateStr)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-surface/60 hover:bg-surface border border-border-main/40 hover:border-border-main text-xs font-medium text-text-secondary hover:text-text-main transition-all cursor-pointer group"
        >
          <Plus className="w-3.5 h-3.5 text-text-secondary group-hover:text-red-main transition-colors" />
          <span>Add task</span>
        </button>
      </div>

      {/* Column Content: Scrollable list of Scheduled + Unscheduled */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Scheduled Tasks Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-text-secondary">
              <Clock className="w-3 h-3 text-text-secondary" />
              <span>Scheduled</span>
            </div>
            <span className="text-[10px] font-mono text-text-secondary">0h 0m</span>
          </div>

          {/* Empty state placeholder for Scheduled */}
          <div className="p-4 rounded-lg bg-surface/30 border border-dashed border-border-main/40 text-center space-y-1">
            <p className="text-xs text-text-secondary">No scheduled time blocks</p>
            <p className="text-[11px] text-text-secondary/70">Tasks with assigned times appear here</p>
          </div>
        </div>

        {/* Unscheduled Tasks Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 pt-2 border-t border-border-main/30">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-text-secondary">
              <Inbox className="w-3 h-3 text-text-secondary" />
              <span>Unscheduled</span>
            </div>
            <span className="text-[10px] font-mono text-text-secondary">0 tasks</span>
          </div>

          {/* Empty state placeholder for Unscheduled */}
          <div className="p-4 rounded-lg bg-surface/30 border border-dashed border-border-main/40 text-center space-y-1">
            <p className="text-xs text-text-secondary">No unscheduled items</p>
            <p className="text-[11px] text-text-secondary/70">Tasks for this day without fixed hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};
