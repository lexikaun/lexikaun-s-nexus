import React, { useState } from 'react';
import {
  Clock,
  Calendar as CalendarIcon,
  Tag,
  Target,
  FileText,
  X,
  Check,
  Trash2,
  ChevronRight,
  RotateCw,
  FastForward,
  Sparkles,
} from 'lucide-react';
import { Task, Goal, Priority } from '../../types';
import { generateSmartRescheduleSuggestion } from '../../utils/smartReschedule';

export interface TaskScheduleModalProps {
  task: Task | null;
  goals?: Goal[];
  onClose: () => void;
  onSave: (updatedTask: Task) => Promise<void> | void;
  onDelete: (taskId: string) => Promise<void> | void;
}

export const TaskScheduleModal: React.FC<TaskScheduleModalProps> = ({
  task,
  goals = [],
  onClose,
  onSave,
  onDelete,
}) => {
  if (!task) return null;

  const [title, setTitle] = useState(task.title);
  const [date, setDate] = useState(task.date || new Date().toISOString().split('T')[0]);
  const [isScheduled, setIsScheduled] = useState(Boolean(task.startTime && task.startTime.trim() !== ''));
  const [startTime, setStartTime] = useState(task.startTime || '09:00');
  const [endTime, setEndTime] = useState(task.endTime || '10:00');
  const [priority, setPriority] = useState<Priority>(task.priority || 'medium');
  const [goalId, setGoalId] = useState<string>(task.goalId || '');
  const [notes, setNotes] = useState(task.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  // Quick date shift helpers
  const handleShiftDate = (days: number) => {
    const base = new Date(date + 'T00:00:00');
    base.setDate(base.getDate() + days);
    setDate(base.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleSetTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
  };

  // Quick time presets
  const handleSetTimeSlot = (start: string, end: string) => {
    setIsScheduled(true);
    setStartTime(start);
    setEndTime(end);
  };

  const handleDurationPreset = (minutes: number) => {
    setIsScheduled(true);
    const [h, m] = (startTime || '09:00').split(':').map(Number);
    const totalMinutes = (h * 60 + (m || 0) + minutes) % (24 * 60);
    const newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    setEndTime(`${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const updated: Task = {
        ...task,
        title: title.trim(),
        date,
        startTime: isScheduled ? startTime : '',
        endTime: isScheduled ? endTime : '',
        priority,
        goalId: goalId || undefined,
        notes: notes.trim() || undefined,
        updatedAt: Date.now(),
      };
      await onSave(updated);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div
        className="w-full max-w-lg bg-surface hairline-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-12 px-4 border-b border-border-main/50 flex items-center justify-between bg-bg-main shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-text-main">
            <CalendarIcon className="w-4 h-4 text-red-main" />
            <span>Task Scheduling & Details</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-surface text-text-secondary hover:text-text-main transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-mono tracking-wider text-text-secondary">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task name"
              className="w-full bg-bg-main text-text-main text-xs rounded-lg px-3 py-2 border border-border-main/60 focus:border-red-main focus:outline-none font-medium"
              required
            />
          </div>

          {/* Date & Quick Reschedule Shortcuts */}
          <div className="space-y-2 p-3 bg-bg-main/50 rounded-lg hairline-border">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase font-mono tracking-wider text-text-secondary flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-text-secondary" />
                Scheduled Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-bg-main text-text-main px-2 py-1 rounded border border-border-main/40 text-xs font-mono focus:outline-none cursor-pointer"
              />
            </div>

            {/* Date quick shift chips */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-text-secondary">Quick Shift:</span>
              <button
                type="button"
                onClick={handleSetToday}
                className="px-2 py-0.5 rounded bg-surface hover:bg-surface/80 hairline-border text-[10px] font-mono text-text-secondary hover:text-text-main transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleSetTomorrow}
                className="px-2 py-0.5 rounded bg-surface hover:bg-surface/80 hairline-border text-[10px] font-mono text-text-secondary hover:text-text-main transition-colors cursor-pointer"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleShiftDate(2)}
                className="px-2 py-0.5 rounded bg-surface hover:bg-surface/80 hairline-border text-[10px] font-mono text-text-secondary hover:text-text-main transition-colors cursor-pointer"
              >
                +2 Days
              </button>
              <button
                type="button"
                onClick={() => handleShiftDate(7)}
                className="px-2 py-0.5 rounded bg-surface hover:bg-surface/80 hairline-border text-[10px] font-mono text-text-secondary hover:text-text-main transition-colors cursor-pointer"
              >
                +1 Week
              </button>
            </div>
          </div>

          {/* Time Scheduling Controls */}
          <div className="space-y-2.5 p-3 bg-bg-main/50 rounded-lg hairline-border">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase font-mono tracking-wider text-text-secondary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-text-secondary" />
                Time Block
              </label>
              <button
                type="button"
                onClick={() => setIsScheduled(!isScheduled)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  isScheduled
                    ? 'bg-red-main/15 border border-red-main/30 text-text-main font-medium'
                    : 'bg-surface border border-border-main/40 text-text-secondary hover:text-text-main'
                }`}
              >
                {isScheduled ? 'Scheduled Slot' : 'Unscheduled Task'}
              </button>
            </div>

            {isScheduled && (
              <>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-1.5 bg-bg-main px-2.5 py-1.5 rounded border border-border-main/50 font-mono">
                    <span className="text-[10px] text-text-secondary">Start:</span>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-transparent text-text-main focus:outline-none cursor-pointer w-full"
                    />
                  </div>
                  <span className="text-text-secondary">→</span>
                  <div className="flex-1 flex items-center gap-1.5 bg-bg-main px-2.5 py-1.5 rounded border border-border-main/50 font-mono">
                    <span className="text-[10px] text-text-secondary">End:</span>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="bg-transparent text-text-main focus:outline-none cursor-pointer w-full"
                    />
                  </div>
                </div>

                {/* Common slot presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-mono text-text-secondary">Slots:</span>
                  <button
                    type="button"
                    onClick={() => handleSetTimeSlot('09:00', '10:00')}
                    className="px-2 py-0.5 rounded bg-surface hover:bg-surface/80 hairline-border text-[10px] font-mono text-text-secondary hover:text-text-main cursor-pointer"
                  >
                    09:00 - 10:00
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetTimeSlot('11:00', '12:30')}
                    className="px-2 py-0.5 rounded bg-surface hover:bg-surface/80 hairline-border text-[10px] font-mono text-text-secondary hover:text-text-main cursor-pointer"
                  >
                    11:00 - 12:30
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetTimeSlot('14:00', '16:00')}
                    className="px-2 py-0.5 rounded bg-surface hover:bg-surface/80 hairline-border text-[10px] font-mono text-text-secondary hover:text-text-main cursor-pointer"
                  >
                    14:00 - 16:00
                  </button>
                </div>

                {/* Duration presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-text-secondary">Duration:</span>
                  {[15, 30, 45, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleDurationPreset(mins)}
                      className="px-1.5 py-0.5 rounded bg-surface hover:bg-surface/80 hairline-border text-[10px] font-mono text-text-secondary hover:text-text-main cursor-pointer"
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Priority & Goal Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] uppercase font-mono tracking-wider text-text-secondary">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-bg-main text-text-main px-2.5 py-2 rounded-lg border border-border-main/50 focus:outline-none cursor-pointer font-mono"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical Priority</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase font-mono tracking-wider text-text-secondary flex items-center gap-1">
                <Target className="w-3 h-3" />
                Linked Goal
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full bg-bg-main text-text-main px-2.5 py-2 rounded-lg border border-border-main/50 focus:outline-none cursor-pointer"
              >
                <option value="">None (Stand-alone)</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[11px] uppercase font-mono tracking-wider text-text-secondary flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Notes & Sub-tasks
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add details, links, or bullet points..."
              rows={3}
              className="w-full bg-bg-main text-text-main text-xs rounded-lg px-3 py-2 border border-border-main/50 focus:border-red-main focus:outline-none placeholder:text-text-secondary/40 resize-none font-sans"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border-main/50">
            <button
              type="button"
              onClick={() => {
                onDelete(task.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-red-main hover:bg-red-main/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Task</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded text-xs text-text-secondary hover:text-text-main hover:bg-surface transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || isSaving}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-red-main hover:bg-red-hover text-white text-xs font-medium transition-all disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
