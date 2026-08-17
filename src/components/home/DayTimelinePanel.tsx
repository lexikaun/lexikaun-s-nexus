import React, { useEffect, useRef, useState } from 'react';
import {
  Clock,
  X,
  Check,
  Music,
  Target,
  Calendar as CalendarIcon,
  Sparkles,
  Plus,
  Hash,
  ArrowRight,
} from 'lucide-react';
import { FloatingPanel } from '../ui/FloatingPanel';
import { Task, Channel } from '../../types';

export interface DayTimelinePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  visibleDates?: Date[];
  onSelectDate: (date: Date) => void;
  tasksForDate?: Task[];
  channels?: Channel[];
  onSelectTask?: (task: Task) => void;
  onAddSlotTask?: (startTime: string, endTime: string, dateStr: string) => void;
  onOpenBacklog?: () => void;
  onQuickAdd?: () => void;
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

export const DayTimelinePanel: React.FC<DayTimelinePanelProps> = ({
  isOpen,
  onClose,
  selectedDate,
  visibleDates = [],
  onSelectDate,
  tasksForDate = [],
  channels = [],
  onSelectTask,
  onAddSlotTask,
  onQuickAdd,
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

  // Auto-scroll to near current time or 8 AM on mount/date change
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const targetMinutes = isToday
        ? Math.max(0, currentTimeMinutes - 60)
        : 8 * 60;
      const scrollPos = (targetMinutes / 60) * HOUR_HEIGHT;
      scrollContainerRef.current.scrollTop = scrollPos;
    }
  }, [isOpen, selectedDateStr, isToday]);

  const handleTriggerAiRebalance = () => {
    const scheduledSummary = tasksForDate
      .filter((t) => t.startTime)
      .map((t) => `• ${t.title} (${t.startTime} - ${t.endTime || '30m'})`)
      .join('\n');

    const prompt = `Let's optimize my daily schedule for ${selectedDate.toLocaleDateString(
      'en-US',
      { weekday: 'long', month: 'short', day: 'numeric' }
    )}.\n\nHere are my scheduled tasks:\n${
      scheduledSummary || 'No scheduled time blocks yet.'
    }\n\nPlease check for overlaps, recommend optimal focus blocks, and balance deep work with breaks.`;

    window.dispatchEvent(
      new CustomEvent('lexikaun-trigger-ai-ritual', {
        detail: { prompt },
      })
    );
  };

  if (!isOpen) return null;

  // Filter tasks with valid times
  const scheduledTasks = tasksForDate.filter(
    (t) => t.startTime && t.startTime.trim() !== ''
  );

  // Position calculation for live time indicator
  const indicatorTop = (currentTimeMinutes / 60) * HOUR_HEIGHT;

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-sm sm:max-w-md p-3 sm:p-4 flex flex-col transition-all duration-260 ease-[cubic-bezier(0.16,1,0.3,1)] animate-in slide-in-from-right"
      >
        <FloatingPanel className="h-full flex flex-col overflow-hidden border border-hairline bg-surface/95 backdrop-blur-2xl">
          {/* 1. Header with date title, AI rebalance button, and close */}
          <div className="p-3.5 border-b border-hairline flex items-center justify-between bg-canvas/40 shrink-0">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-accent" />
              <div>
                <h3 className="font-display text-sm font-normal text-ink">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
                <p className="font-mono text-[10px] text-ink-muted">
                  24-Hour Timeline
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Quick AI Schedule Rebalance Trigger */}
              <button
                type="button"
                onClick={handleTriggerAiRebalance}
                title="Optimize schedule with AI"
                className="flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-canvas hover:bg-surface-hover border border-hairline text-accent hover:text-accent/90 text-xs font-sans transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3 h-3 text-accent" />
                <span className="text-[11px]">AI Rebalance</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-surface-hover text-ink-muted hover:text-ink transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Mini Date Picker Strip */}
          {visibleDates.length > 0 && (
            <div className="flex items-center gap-1 p-2 border-b border-hairline/60 bg-canvas/20 overflow-x-auto shrink-0">
              {visibleDates.map((d) => {
                const dStr = d.toISOString().split('T')[0];
                const isSelected = dStr === selectedDateStr;
                return (
                  <button
                    key={dStr}
                    type="button"
                    onClick={() => onSelectDate(d)}
                    className={`flex-1 min-w-[48px] py-1 px-1.5 rounded-[8px] text-center transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-accent/20 text-accent border border-accent/40 font-medium'
                        : 'hover:bg-surface text-ink-muted hover:text-ink'
                    }`}
                  >
                    <div className="font-display text-[10px] leading-tight">
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="font-mono text-[11px] leading-tight">
                      {d.getDate()}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. 24-Hour Continuous Timeline Rail */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto relative bg-canvas/30"
            style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
          >
            {/* Hourly horizontal lines and labels */}
            {Array.from({ length: TOTAL_HOURS }).map((_, hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-hairline/40 flex items-start group"
                style={{
                  top: hour * HOUR_HEIGHT,
                  height: HOUR_HEIGHT,
                }}
                onClick={() => {
                  const startStr = `${String(hour).padStart(2, '0')}:00`;
                  const endStr = `${String((hour + 1) % 24).padStart(2, '0')}:00`;
                  onAddSlotTask?.(startStr, endStr, selectedDateStr);
                }}
              >
                <div className="w-14 pl-2 pt-1 font-mono text-[10px] text-ink-muted/70 shrink-0 select-none">
                  {formatHour12h(hour)}
                </div>
                <div className="flex-1 h-full border-l border-hairline/30 group-hover:bg-surface/20 transition-colors relative cursor-pointer" />
              </div>
            ))}

            {/* Live Amber Current-Time Indicator Line */}
            {isToday && (
              <div
                className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                style={{ top: indicatorTop }}
              >
                <div className="w-14 text-right pr-1 font-mono text-[9px] font-semibold text-accent">
                  {minutesToTimeString(currentTimeMinutes)}
                </div>
                <div className="w-2 h-2 rounded-full bg-accent -ml-1 ring-2 ring-canvas shadow-sm" />
                <div className="flex-1 h-[2px] bg-accent shadow-[0_0_8px_rgba(217,142,74,0.6)]" />
              </div>
            )}

            {/* Scheduled Time-Blocked Cards */}
            {scheduledTasks.map((task) => {
              const startMin = timeToMinutes(task.startTime);
              const endMin = task.endTime
                ? timeToMinutes(task.endTime)
                : startMin + (task.durationMinutes || task.duration || 30);
              const durationMin = Math.max(15, endMin - startMin);

              const top = (startMin / 60) * HOUR_HEIGHT;
              const height = Math.max(26, (durationMin / 60) * HOUR_HEIGHT - 2);

              const isDone = task.status === 'completed' || task.done === true;
              const channel = task.channelId
                ? channels.find((c) => c.id === task.channelId)
                : undefined;

              return (
                <div
                  key={task.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTask?.(task);
                  }}
                  style={{
                    top,
                    height,
                    left: '60px',
                    right: '12px',
                  }}
                  className={`absolute rounded-[10px] p-2 border border-hairline text-xs transition-all duration-150 cursor-pointer overflow-hidden flex flex-col justify-between shadow-sm hover:z-20 hover:scale-[1.01] hover:border-accent/40 ${
                    isDone
                      ? 'bg-surface/60 opacity-50'
                      : 'bg-surface hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {channel && (
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: channel.color }}
                        />
                      )}
                      <span
                        className={`font-sans font-medium text-ink truncate leading-tight ${
                          isDone ? 'line-through text-ink-muted' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <span className="font-mono text-[9px] text-ink-muted shrink-0">
                      {task.startTime}
                    </span>
                  </div>

                  {height > 40 && (
                    <div className="flex items-center gap-2 pt-1 font-mono text-[9px] text-ink-muted">
                      <span>{durationMin}m</span>
                      {task.associatedBeatId && (
                        <span className="text-accent flex items-center gap-0.5">
                          <Music className="w-2.5 h-2.5" />
                        </span>
                      )}
                      {task.goalId && (
                        <span className="flex items-center gap-0.5 text-accent">
                          <Target className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 4. Footer summary */}
          <div className="p-3 border-t border-hairline bg-canvas/40 flex items-center justify-between text-xs font-mono text-ink-muted shrink-0">
            <span>
              {scheduledTasks.length} scheduled task
              {scheduledTasks.length === 1 ? '' : 's'}
            </span>
            {onQuickAdd && (
              <button
                type="button"
                onClick={onQuickAdd}
                className="flex items-center gap-1 text-accent hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Time Block</span>
              </button>
            )}
          </div>
        </FloatingPanel>
      </div>
    </div>
  );
};
