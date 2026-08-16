import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  PanelRightClose,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  Plus,
  Music,
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

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 07:00 to 21:00

export const CalendarPanel: React.FC<CalendarPanelProps> = ({
  isOpen,
  onClose,
  selectedDate,
  visibleDates = [],
  onSelectDate,
  tasksForDate = [],
  allTasks = [],
  onSelectTask,
  onAddSlotTask,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  if (!isOpen) return null;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const selectedDateStr = selectedDate.toISOString().split('T')[0];

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Compute days in month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isCurrentSelected = (day: number) => {
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    );
  };

  const isTodayDate = (day: number) => {
    const now = new Date();
    return (
      now.getFullYear() === year &&
      now.getMonth() === month &&
      now.getDate() === day
    );
  };

  // Check if a day has any tasks in allTasks
  const hasTasksOnDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allTasks.some((t) => t.date === dayStr);
  };

  // Find all tasks that overlap with an hour
  const getTasksForHour = (hour: number) => {
    const hourStr = String(hour).padStart(2, '0');
    return tasksForDate.filter((t) => {
      if (!t.startTime) return false;
      const [taskH] = t.startTime.split(':');
      return taskH === hourStr;
    });
  };

  return (
    <aside className="w-80 h-full border-l border-border-main/50 bg-bg-main flex flex-col shrink-0 select-none overflow-hidden transition-all duration-200">
      {/* Panel Header */}
      <div className="h-12 border-b border-border-main/50 px-4 flex items-center justify-between shrink-0 bg-bg-main">
        <div className="flex items-center gap-2 text-xs font-medium text-text-main">
          <CalendarIcon className="w-4 h-4 text-red-main" />
          <span>Timeline Overview</span>
        </div>
        <button
          onClick={onClose}
          title="Collapse timeline panel"
          className="p-1 rounded-md hover:bg-surface text-text-secondary hover:text-text-main transition-colors cursor-pointer"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Day Switcher Pills (from visible workspace columns) */}
        {visibleDates.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-text-secondary uppercase">
              <span>Visible Days</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {visibleDates.map((d) => {
                const dStr = d.toISOString().split('T')[0];
                const isSel = dStr === selectedDateStr;
                const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = d.getDate();

                return (
                  <button
                    key={dStr}
                    onClick={() => onSelectDate(d)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors shrink-0 cursor-pointer ${
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
          </div>
        )}

        {/* Mini Month Calendar */}
        <div className="p-3 bg-surface/30 rounded-xl hairline-border space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-main">{monthName}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded hover:bg-surface text-text-secondary hover:text-text-main transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded hover:bg-surface text-text-secondary hover:text-text-main transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-[10px] font-mono text-text-secondary uppercase">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {daysArray.map((day, idx) => {
              if (day === null) {
                return <div key={`empty_${idx}`} className="h-7" />;
              }
              const selected = isCurrentSelected(day);
              const today = isTodayDate(day);
              const hasTasks = hasTasksOnDay(day);

              return (
                <button
                  key={`day_${day}`}
                  onClick={() => onSelectDate(new Date(year, month, day))}
                  className={`h-7 w-7 mx-auto rounded-md flex flex-col items-center justify-center font-mono text-xs transition-colors cursor-pointer relative ${
                    selected
                      ? 'bg-red-main text-white font-medium'
                      : today
                      ? 'bg-surface hairline-border text-red-main font-bold'
                      : 'text-text-secondary hover:text-text-main hover:bg-surface/70'
                  }`}
                >
                  <span>{day}</span>
                  {hasTasks && !selected && (
                    <span className="w-1 h-1 rounded-full bg-text-secondary/70 absolute bottom-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Timeline Canvas (07:00 - 21:00) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-text-secondary">
              <Clock className="w-3 h-3 text-text-secondary" />
              <span>Timeline: {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
            <span className="text-[10px] font-mono text-text-secondary">
              {tasksForDate.filter((t) => t.startTime).length} blocks
            </span>
          </div>

          <div className="p-2.5 bg-surface/30 rounded-xl hairline-border space-y-1.5">
            {HOURS.map((hour) => {
              const matchedTasks = getTasksForHour(hour);
              const hourStr = String(hour).padStart(2, '0') + ':00';
              const nextHourStr = String(hour + 1).padStart(2, '0') + ':00';

              return (
                <div
                  key={hour}
                  className="flex items-start gap-2.5 py-1 border-b border-border-main/15 last:border-0 min-h-[30px]"
                >
                  <span className="w-10 text-[10px] font-mono text-text-secondary text-right shrink-0 pt-0.5">
                    {hourStr}
                  </span>

                  {matchedTasks.length > 0 ? (
                    <div className="flex-1 space-y-1">
                      {matchedTasks.map((task) => {
                        const isDone = task.status === 'completed';
                        return (
                          <div
                            key={task.id}
                            onClick={() => onSelectTask?.(task)}
                            className={`rounded px-2 py-1 flex items-center gap-1.5 text-xs font-mono truncate hairline-border cursor-pointer transition-all hover:scale-[1.01] ${
                              isDone
                                ? 'bg-surface/40 text-text-secondary line-through'
                                : 'bg-red-main/15 border-red-main/40 text-text-main font-medium hover:bg-red-main/25'
                            }`}
                            title={`Click to edit: ${task.title} (${task.startTime} - ${task.endTime})`}
                          >
                            {isDone && <Check className="w-3 h-3 text-red-main shrink-0" />}
                            {task.associatedBeatId && (
                              <Music className="w-2.5 h-2.5 text-music-accent shrink-0" />
                            )}
                            <span className="truncate flex-1">{task.title}</span>
                            <span className="text-[10px] text-text-secondary shrink-0 font-mono">
                              {task.startTime}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onAddSlotTask?.(hourStr, nextHourStr, selectedDateStr)
                      }
                      className="flex-1 h-5 rounded bg-surface/20 border border-dashed border-border-main/20 hover:border-red-main/40 hover:bg-surface/50 flex items-center justify-between px-2 text-[10px] text-text-secondary/40 hover:text-text-secondary font-mono transition-all cursor-pointer group"
                      title={`Add task for ${hourStr}`}
                    >
                      <span>Free</span>
                      <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-red-main transition-opacity" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
