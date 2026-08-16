import React, { useState } from 'react';
import { Calendar as CalendarIcon, PanelRightClose, ChevronLeft, ChevronRight, Clock, Check } from 'lucide-react';
import { Task } from '../../types';

export interface CalendarPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  tasksForDate?: Task[];
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 07:00 to 21:00

export const CalendarPanel: React.FC<CalendarPanelProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  tasksForDate = [],
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  if (!isOpen) return null;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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

  // Find task matching each hour slot
  const getTaskForHour = (hour: number) => {
    const hourStr = String(hour).padStart(2, '0');
    return tasksForDate.find((t) => {
      if (!t.startTime) return false;
      const [taskH] = t.startTime.split(':');
      return taskH === hourStr;
    });
  };

  return (
    <aside className="w-80 h-full border-l border-border-main/50 bg-bg-main flex flex-col shrink-0 select-none overflow-hidden transition-all duration-200">
      {/* Panel Header */}
      <div className="h-12 border-b border-border-main/50 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium text-text-main">
          <CalendarIcon className="w-4 h-4 text-text-secondary" />
          <span>Calendar & Timeline</span>
        </div>
        <button
          onClick={onClose}
          title="Collapse calendar panel"
          className="p-1 rounded-md hover:bg-surface text-text-secondary hover:text-text-main transition-colors cursor-pointer"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Mini Month Calendar */}
        <div className="p-3 bg-surface/40 rounded-xl hairline-border space-y-3">
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

              return (
                <button
                  key={`day_${day}`}
                  onClick={() => onSelectDate(new Date(year, month, day))}
                  className={`h-7 w-7 mx-auto rounded-md flex items-center justify-center font-mono text-xs transition-colors cursor-pointer ${
                    selected
                      ? 'bg-red-main text-white font-medium'
                      : today
                      ? 'bg-surface hairline-border text-red-main font-bold'
                      : 'text-text-secondary hover:text-text-main hover:bg-surface/70'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Timeline Overview (07:00 - 21:00) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-text-secondary">
              <Clock className="w-3 h-3 text-text-secondary" />
              <span>Timeline Preview</span>
            </div>
            <span className="text-[10px] font-mono text-text-secondary">
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="p-3 bg-surface/30 rounded-xl hairline-border space-y-1.5">
            {HOURS.map((hour) => {
              const matchedTask = getTaskForHour(hour);
              const isDone = matchedTask?.status === 'completed';

              return (
                <div
                  key={hour}
                  className="flex items-center gap-3 py-1 border-b border-border-main/15 last:border-0"
                >
                  <span className="w-10 text-[10px] font-mono text-text-secondary text-right shrink-0">
                    {String(hour).padStart(2, '0')}:00
                  </span>
                  {matchedTask ? (
                    <div
                      className={`flex-1 min-h-[24px] rounded px-2 py-0.5 flex items-center gap-1.5 text-xs font-mono truncate hairline-border ${
                        isDone
                          ? 'bg-surface/40 text-text-secondary line-through'
                          : 'bg-red-main/15 border-red-main/30 text-text-main font-medium'
                      }`}
                    >
                      {isDone && <Check className="w-3 h-3 text-red-main shrink-0" />}
                      <span className="truncate">{matchedTask.title}</span>
                      <span className="text-[10px] text-text-secondary/70 ml-auto shrink-0">
                        {matchedTask.startTime}
                      </span>
                    </div>
                  ) : (
                    <div className="flex-1 h-5 rounded bg-surface/20 border border-dashed border-border-main/20 flex items-center px-2">
                      <span className="text-[10px] text-text-secondary/40 font-mono">Free</span>
                    </div>
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
