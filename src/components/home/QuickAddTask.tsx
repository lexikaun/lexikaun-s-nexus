import React, { useState, useRef, useEffect } from 'react';
import { Clock, Tag, Target, FileText, X, Check, Plus, ChevronDown } from 'lucide-react';
import { Priority, Goal, Task } from '../../types';

export interface QuickAddTaskProps {
  dateStr: string;
  goals?: Goal[];
  onCreateGoal?: (title: string) => Promise<string>;
  onSave: (taskData: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    durationMinutes?: number;
    priority: Priority;
    goalId?: string;
    notes?: string;
  }) => Promise<void> | void;
  onCancel: () => void;
}

export const QuickAddTask: React.FC<QuickAddTaskProps> = ({
  dateStr,
  goals = [],
  onCreateGoal,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [isScheduled, setIsScheduled] = useState(true);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [priority, setPriority] = useState<Priority>('medium');
  const [goalId, setGoalId] = useState<string>('');
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && !e.shiftKey && !isCreatingGoal) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDurationPreset = (minutes: number) => {
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = (h * 60 + (m || 0) + minutes) % (24 * 60);
    const newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    setEndTime(`${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`);
  };

  const handleCreateNewGoalSubmit = async () => {
    if (!newGoalTitle.trim() || !onCreateGoal) return;
    const createdId = await onCreateGoal(newGoalTitle.trim());
    setGoalId(createdId);
    setNewGoalTitle('');
    setIsCreatingGoal(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        date: dateStr,
        startTime: isScheduled ? startTime : '',
        endTime: isScheduled ? endTime : '',
        priority,
        goalId: goalId || undefined,
        notes: notes.trim() || undefined,
      });
      setTitle('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-3 bg-surface hairline-border rounded-xl shadow-xl space-y-2.5 animate-in fade-in zoom-in-95 duration-150 select-none">
      {/* Title Input */}
      <div className="relative">
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Task title... (Enter to save)"
          className="w-full bg-bg-main/80 text-text-main text-xs rounded-md px-2.5 py-2 border border-border-main/60 focus:border-red-main focus:outline-none placeholder:text-text-secondary/50 font-medium"
        />
      </div>

      {/* Primary Timing Controls */}
      <div className="flex items-center justify-between text-xs gap-1.5 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsScheduled(!isScheduled)}
            className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
              isScheduled
                ? 'bg-red-main/15 border border-red-main/30 text-text-main font-medium'
                : 'bg-surface/60 border border-border-main/40 text-text-secondary hover:text-text-main'
            }`}
          >
            {isScheduled ? 'Scheduled' : 'Unscheduled'}
          </button>

          {isScheduled && (
            <div className="flex items-center gap-1 bg-bg-main/60 px-1.5 py-0.5 rounded border border-border-main/40 font-mono text-[11px]">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-transparent text-text-main focus:outline-none cursor-pointer w-16"
              />
              <span className="text-text-secondary/60">-</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-transparent text-text-main focus:outline-none cursor-pointer w-16"
              />
            </div>
          )}
        </div>

        {/* Priority Selector */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="bg-bg-main/60 text-text-main text-[11px] font-mono px-2 py-1 rounded border border-border-main/40 focus:outline-none cursor-pointer"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Duration shortcut chips if scheduled */}
      {isScheduled && (
        <div className="flex items-center gap-1 text-[10px] font-mono text-text-secondary">
          <span>Duration:</span>
          {[15, 30, 45, 60, 90].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => handleDurationPreset(mins)}
              className="px-1.5 py-0.5 rounded bg-surface hover:bg-surface/80 border border-border-main/40 hover:border-text-secondary/40 text-text-secondary hover:text-text-main transition-colors cursor-pointer"
            >
              {mins}m
            </button>
          ))}
        </div>
      )}

      {/* Toggle Details (Goal & Notes) */}
      <div>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-[11px] text-text-secondary hover:text-text-main flex items-center gap-1 transition-colors cursor-pointer"
        >
          <ChevronDown
            className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`}
          />
          <span>{showDetails ? 'Hide Goal & Notes' : '+ Goal & Notes'}</span>
        </button>

        {showDetails && (
          <div className="mt-2 space-y-2 pt-2 border-t border-border-main/30 text-xs">
            {/* Goal Link with Inline Creation */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-mono text-text-secondary flex items-center gap-1">
                  <Target className="w-2.5 h-2.5 text-red-main" />
                  Link to Goal
                </label>
                {onCreateGoal && !isCreatingGoal && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingGoal(true)}
                    className="text-[10px] text-red-main hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    New
                  </button>
                )}
              </div>

              {isCreatingGoal ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    placeholder="Goal title..."
                    className="flex-1 bg-bg-main/90 text-text-main text-xs rounded px-2 py-1 border border-red-main/50 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewGoalSubmit}
                    disabled={!newGoalTitle.trim()}
                    className="px-2 py-1 rounded bg-red-main text-white text-xs disabled:opacity-40"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingGoal(false)}
                    className="px-1.5 py-1 text-text-secondary hover:text-text-main"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <select
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="w-full bg-bg-main/80 text-text-main text-xs rounded px-2 py-1.5 border border-border-main/40 focus:outline-none cursor-pointer"
                >
                  <option value="">None (Stand-alone task)</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-text-secondary flex items-center gap-1">
                <FileText className="w-2.5 h-2.5" />
                Notes / Sub-tasks
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional context, checklist items, or links..."
                rows={2}
                className="w-full bg-bg-main/80 text-text-main text-xs rounded px-2 py-1.5 border border-border-main/40 focus:border-red-main focus:outline-none placeholder:text-text-secondary/40 resize-none font-sans"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-border-main/40">
        <button
          type="button"
          onClick={onCancel}
          className="px-2.5 py-1 rounded text-xs text-text-secondary hover:text-text-main hover:bg-surface/80 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!title.trim() || isSubmitting}
          className="flex items-center gap-1 px-3 py-1 rounded bg-red-main hover:bg-red-hover text-white text-xs font-medium transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-sm"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Save Task</span>
        </button>
      </div>
    </div>
  );
};
