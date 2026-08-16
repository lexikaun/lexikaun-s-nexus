import React, { useEffect, useRef, useState } from 'react';
import {
  Clock,
  PanelRightClose,
  Check,
  Music,
  Target,
} from 'lucide-react';
import { Task } from '../../types';

export interface CalendarPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  visibleDates?: Date[];
  onSelectDate: (date: Date) => void;
  tasksForDate?: Task[];
  allTasks?: Task[];
  onSelectTask?: (task: Task) => void;
  onAddSlotTask?: (startTime: string, endTime: string, dateStr: string) => void;
}

const HOUR_HEIGHT = 48; // px per hour
const TOTAL_HOURS = 24;

function formatHour12h(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
}

function timeToMinutes(timeStr?: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const CalendarPanel: React.FC<CalendarPanelProps> = ({
  isOpen,
  onClose,
  selectedDate,
  visibleDates = [],
  onSelectDate,
  tasksForDate = [],
  onSelectTask,
  onAddSlotTask,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  // Keep live time indicator updated
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const now = new Date();
  const isToday =
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getDate() === now.getDate();

  // Auto-scroll to near current time or first scheduled task on mount/date change
  useEffect(() => {
    if (scrollContainerRef.current) {
      const targetMinutes = isToday
        ? Math.max(0, currentTimeMinutes - 60)
        : 8 * 60; // 8 AM default
      const scrollPos = (targetMinutes / 60) * HOUR_HEIGHT;
      scrollContainerRef.current.scrollTop = scrollPos;
    }
  }, [selectedDateStr, isToday]);

  if (!isOpen) return null;

  const scheduledTasks = tasksForDate.filter(
    (t) => t.startTime && t.startTime.trim() !== ''
  );

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const totalMinutes = Math.floor((offsetY / HOUR_HEIGHT) * 60);
    const roundedMinutes = Math.floor(totalMinutes / 30) * 30;
    const startTimeStr = minutesToTimeString(roundedMinutes);
    const endTimeStr = minutesToTimeString(roundedMinutes + 30);
    onAddSlotTask?.(startTimeStr, endTimeStr, selectedDateStr);
  };

  return (
    <aside className="w-80 h-full border-l border-border-main/50 bg-bg-main flex flex-col shrink-0 select-none overflow-hidden transition-all duration-200">
      {/* 1. Panel Header & Day Switcher */}
      <div className="border-b border-border-main/50 p-3 bg-bg-main shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-text-main">
            <Clock className="w-3.5 h-3.5 text-red-main" />
            <span>Timeline</span>
          </div>
          <button
            onClick={onClose}
            title="Collapse timeline panel"
            className="p-1 rounded-md hover:bg-surface text-text-secondary hover:text-text-main transition-colors cursor-pointer"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>

        {/* Visible Days Tab Selector */}
        {visibleDates.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            {visibleDates.map((d) => {
              const dStr = d.toISOString().split('T')[0];
              const isSel = dStr === selectedDateStr;
              const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = d.getDate();

              return (
                <button
                  key={dStr}
                  onClick={() => onSelectDate(d)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors shrink-0 cursor-pointer ${
                    isSel
                      ? 'bg-red-main text-white font-medium shadow-sm'
                      : 'bg-surface hairline-border text-text-secondary hover:text-text-main hover:bg-surface/80'
                  }`}
                >
                  {weekday} {dayNum}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. True Vertical Hourly Timeline Rail (12 AM - 11 PM) */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative bg-bg-main select-none"
      >
        <div
          className="relative min-h-[1152px] cursor-crosshair"
          style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
          onClick={handleTimelineClick}
        >
          {/* Hourly grid lines & labels */}
          {Array.from({ length: TOTAL_HOURS }).map((_, hour) => {
            const top = hour * HOUR_HEIGHT;
            return (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-border-main/20 flex items-start pointer-events-none"
                style={{ top: `${top}px`, height: `${HOUR_HEIGHT}px` }}
              >
                <span className="w-12 pr-2 text-[10px] font-mono text-text-secondary/60 text-right -translate-y-2 select-none">
                  {formatHour12h(hour)}
                </span>
                <div className="flex-1 h-full border-b border-border-main/10" />
              </div>
            );
          })}

          {/* Time-Blocked Task Cards */}
          {scheduledTasks.map((task) => {
            const startMins = timeToMinutes(task.startTime);
            let endMins = timeToMinutes(task.endTime);
            if (endMins <= startMins) {
              endMins = startMins + (task.durationMinutes || 30);
            }
            const durationMins = Math.max(15, endMins - startMins);

            const top = (startMins / 60) * HOUR_HEIGHT;
            const height = Math.max(26, (durationMins / 60) * HOUR_HEIGHT);
            const isDone = task.status === 'completed';

            return (
              <div
                key={task.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTask?.(task);
                }}
                className={`absolute left-12 right-3 rounded-lg px-2 py-1 shadow-sm border transition-all cursor-pointer overflow-hidden z-10 flex flex-col justify-between ${
                  isDone
                    ? 'bg-surface/60 border-border-main text-text-secondary opacity-60 line-through'
                    : 'bg-surface border-red-main/40 text-text-main hover:border-red-main hover:shadow-md'
                }`}
                style={{ top: `${top}px`, height: `${height}px` }}
                title={`${task.title} (${task.startTime} – ${task.endTime || ''})`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-medium truncate leading-tight flex-1">
                    {task.title}
                  </span>
                  {isDone && <Check className="w-2.5 h-2.5 text-red-main shrink-0" />}
                </div>

                {height >= 36 && (
                  <div className="flex items-center justify-between text-[9px] font-mono text-text-secondary">
                    <span>
                      {task.startTime} – {task.endTime || ''}
                    </span>
                    {task.associatedBeatId && (
                      <Music className="w-2.5 h-2.5 text-music-accent shrink-0" />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Live Current Time Horizontal Red Line */}
          {isToday && (
            <div
              className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
              style={{ top: `${(currentTimeMinutes / 60) * HOUR_HEIGHT}px` }}
            >
              <div className="w-2 h-2 rounded-full bg-red-main -ml-1 shrink-0 ring-4 ring-red-main/20" />
              <div className="flex-1 h-[2px] bg-red-main shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
