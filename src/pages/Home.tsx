import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  PanelRight,
  PanelRightClose,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { DayColumn } from '../components/home/DayColumn';
import { CalendarPanel } from '../components/home/CalendarPanel';

export const Home: React.FC = () => {
  // State for start date (defaults to today)
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Number of visible days (3, 4, 5, or 7)
  const [visibleDaysCount, setVisibleDaysCount] = useState<number>(4);

  // Calendar Panel collapsible toggle
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(true);

  // Helper to shift start date
  const handleShiftDays = (days: number) => {
    const next = new Date(startDate);
    next.setDate(next.getDate() + days);
    setStartDate(next);
  };

  const handleGoToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setStartDate(today);
  };

  // Generate array of visible Date objects
  const visibleDates: Date[] = [];
  for (let i = 0; i < visibleDaysCount; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    visibleDates.push(d);
  }

  // Check if a date is today
  const isToday = (d: Date) => {
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  // Date range title for header
  const firstDate = visibleDates[0];
  const lastDate = visibleDates[visibleDates.length - 1];
  const dateRangeLabel = firstDate && lastDate
    ? `${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : '';

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-bg-main overflow-hidden select-none">
      {/* Top Workspace Action & Navigation Bar */}
      <header className="h-12 border-b border-border-main/50 px-4 flex items-center justify-between shrink-0 bg-bg-main">
        {/* Left: Navigation Controls & Date Range */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-surface/50 p-0.5 rounded-lg hairline-border">
            <button
              onClick={() => handleShiftDays(-1)}
              title="Previous day"
              className="p-1.5 rounded-md hover:bg-surface text-text-secondary hover:text-text-main transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoToToday}
              className="px-2.5 py-1 rounded-md text-xs font-mono font-medium hover:bg-surface text-text-main transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => handleShiftDays(1)}
              title="Next day"
              className="p-1.5 rounded-md hover:bg-surface text-text-secondary hover:text-text-main transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs font-mono font-medium text-text-secondary hidden sm:inline-block">
            {dateRangeLabel}
          </span>
        </div>

        {/* Center/Right: View Options & Calendar Toggle */}
        <div className="flex items-center gap-2">
          {/* Days visible dropdown/toggle */}
          <div className="flex items-center gap-1 bg-surface/40 p-0.5 rounded-lg hairline-border text-[11px] font-mono">
            {[3, 4, 5, 7].map((num) => (
              <button
                key={num}
                onClick={() => setVisibleDaysCount(num)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  visibleDaysCount === num
                    ? 'bg-surface hairline-border text-text-main font-medium'
                    : 'text-text-secondary hover:text-text-main'
                }`}
              >
                {num}d
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-border-main/50" />

          {/* Quick Add Task affordance */}
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5 text-xs bg-red-main hover:bg-red-hover text-white cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>

          {/* Collapsible Calendar Panel Toggle */}
          <button
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            title={isCalendarOpen ? 'Hide calendar panel' : 'Show calendar panel'}
            className={`p-2 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 text-xs ${
              isCalendarOpen
                ? 'bg-surface hairline-border text-text-main font-medium'
                : 'hover:bg-surface text-text-secondary hover:text-text-main'
            }`}
          >
            {isCalendarOpen ? (
              <PanelRightClose className="w-4 h-4 text-red-main" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            <span className="hidden md:inline text-xs font-mono">
              {isCalendarOpen ? 'Hide Panel' : 'Calendar'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Multi-Region Body: Day Columns + Collapsible Calendar Panel */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Central Multi-Day Horizontal Columns */}
        <main className="flex-1 flex overflow-x-auto overflow-y-hidden min-h-0 divide-x divide-border-main/30">
          {visibleDates.map((date) => (
            <DayColumn
              key={date.toISOString()}
              date={date}
              isToday={isToday(date)}
            />
          ))}
        </main>

        {/* Right Collapsible Calendar & Timeline Panel */}
        <CalendarPanel
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          selectedDate={startDate}
          onSelectDate={(date) => {
            setStartDate(date);
          }}
        />
      </div>
    </div>
  );
};
