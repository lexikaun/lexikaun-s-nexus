import React, { useState, useRef, useEffect } from 'react';
import {
  Clock,
  Target,
  Hash,
  X,
  Plus,
  Check,
  ChevronDown,
  FileText,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { FloatingPanel } from '../ui/FloatingPanel';
import { Reveal } from '../ui/Reveal';
import { Goal, Channel, Priority, TaskSubtask } from '../../types';

export interface AddTaskWindowProps {
  isOpen?: boolean;
  dateStr: string;
  goals?: Goal[];
  channels?: Channel[];
  onCreateGoal?: (title: string) => Promise<string>;
  onCreateChannel?: (name: string, color?: string) => Promise<string>;
  onSave: (taskData: {
    title: string;
    date: string;
    startTime?: string;
    endTime?: string;
    durationMinutes?: number;
    priority?: Priority;
    goalId?: string;
    channelId?: string;
    subtasks?: TaskSubtask[];
    notes?: string;
  }) => Promise<void> | void;
  onClose: () => void;
}

export const AddTaskWindow: React.FC<AddTaskWindowProps> = ({
  isOpen = true,
  dateStr,
  goals = [],
  channels = [],
  onCreateGoal,
  onCreateChannel,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [channelId, setChannelId] = useState<string>('');
  const [goalId, setGoalId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const calculateEndTime = (start: string, durationMins: number): string => {
    if (!start) return '';
    const [h, m] = start.split(':').map(Number);
    const totalMinutes = (h * 60 + (m || 0) + durationMins) % (24 * 60);
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !isCreatingChannel &&
      !isCreatingGoal &&
      document.activeElement !== document.querySelector('textarea')
    ) {
      e.preventDefault();
      await handleSubmit();
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: TaskSubtask = {
      id: 'sub_' + Date.now(),
      title: newSubtaskTitle.trim(),
      done: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (idx: number) => {
    setSubtasks(
      subtasks.map((s, i) => (i === idx ? { ...s, done: !s.done } : s))
    );
  };

  const handleDeleteSubtask = (idx: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== idx));
  };

  const handleCreateChannelSubmit = async () => {
    if (!newChannelName.trim() || !onCreateChannel) return;
    const createdId = await onCreateChannel(newChannelName.trim());
    setChannelId(createdId);
    setNewChannelName('');
    setIsCreatingChannel(false);
  };

  const handleCreateGoalSubmit = async () => {
    if (!newGoalTitle.trim() || !onCreateGoal) return;
    const createdId = await onCreateGoal(newGoalTitle.trim());
    setGoalId(createdId);
    setNewGoalTitle('');
    setIsCreatingGoal(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const computedEndTime = startTime
        ? endTime || calculateEndTime(startTime, duration)
        : '';

      await onSave({
        title: title.trim(),
        date: dateStr,
        startTime: startTime || '',
        endTime: computedEndTime || '',
        durationMinutes: duration,
        priority: 'medium',
        channelId: channelId || undefined,
        goalId: goalId || undefined,
        subtasks: subtasks.length > 0 ? subtasks : undefined,
        notes: notes.trim() || undefined,
      });

      // Clear title and subtasks for rapid continuous entry
      setTitle('');
      setSubtasks([]);
      setNotes('');
      setStartTime('');
      setEndTime('');
      titleInputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg transition-all duration-200 ease-out transform animate-in fade-in zoom-in-95"
      >
        <FloatingPanel className="p-5 space-y-4">
          {/* Header row: Context label + Escape close icon */}
          <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted">
            <span className="tracking-tight">Notecard • {dateStr}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] opacity-60">esc to close</span>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-md hover:bg-surface-hover text-ink-muted hover:text-ink transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Prominent Title Input in Fraunces (20px) */}
          <div className="space-y-1">
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind?"
              className="w-full font-display text-xl text-ink placeholder:text-ink-muted/40 font-normal bg-transparent focus:outline-none border-b border-hairline focus:border-accent/60 pb-2 transition-colors"
            />
          </div>

          {/* Quick Duration Chips (15m, 30m, 1h, 2h) */}
          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
            <div className="flex items-center gap-1.5 font-mono text-xs text-ink-muted">
              <span className="text-[10px] tracking-tight">Duration:</span>
              {[15, 30, 60, 120].map((mins) => {
                const label = mins < 60 ? `${mins}m` : `${mins / 60}h`;
                const isSelected = duration === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      setDuration(mins);
                      if (startTime) {
                        setEndTime(calculateEndTime(startTime, mins));
                      }
                    }}
                    className={`px-2.5 py-1 rounded-[10px] text-xs font-mono transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-accent/20 text-accent border border-accent/40 font-medium'
                        : 'bg-canvas/60 border border-hairline text-ink-muted hover:text-ink hover:bg-canvas'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Quick Submit Indicator */}
            {title.trim() && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-1 px-3 py-1 rounded-[10px] bg-accent hover:bg-accent/90 text-canvas text-xs font-sans font-medium transition-all shadow-sm cursor-pointer"
              >
                <span>Save</span>
                <span className="font-mono text-[10px] opacity-70">↵</span>
              </button>
            )}
          </div>

          {/* Progressive Disclosure Trigger ("+ add details") */}
          <div className="pt-2 border-t border-hairline">
            <button
              type="button"
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="text-xs font-sans text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors cursor-pointer group"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isDetailsOpen ? 'rotate-180 text-accent' : 'group-hover:text-accent'
                }`}
              />
              <span>
                {isDetailsOpen
                  ? 'Hide extra details'
                  : '+ add time, tag, subtasks, or notes'}
              </span>
            </button>

            {/* Progressive Disclosure Accordion Content wrapped in Reveal */}
            <Reveal isOpen={isDetailsOpen} className="pt-3">
              <div className="p-3.5 rounded-xl bg-canvas/50 border border-hairline space-y-3.5 text-xs">
                {/* 1. Time Picker (Start & End Time) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-ink-muted flex items-center gap-1">
                    <Clock className="w-3 h-3 text-accent" />
                    <span>Scheduled Time (optional)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-1.5 bg-surface px-2.5 py-1.5 rounded-lg border border-hairline font-mono text-xs">
                      <span className="text-[10px] text-ink-muted">Start:</span>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => {
                          setStartTime(e.target.value);
                          if (e.target.value) {
                            setEndTime(calculateEndTime(e.target.value, duration));
                          }
                        }}
                        className="bg-transparent text-ink focus:outline-none w-full cursor-pointer"
                      />
                    </div>
                    <span className="text-ink-muted font-mono">→</span>
                    <div className="flex-1 flex items-center gap-1.5 bg-surface px-2.5 py-1.5 rounded-lg border border-hairline font-mono text-xs">
                      <span className="text-[10px] text-ink-muted">End:</span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="bg-transparent text-ink focus:outline-none w-full cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Channel & Goal Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Channel Tag Selector */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-ink-muted flex items-center gap-1">
                        <Hash className="w-3 h-3 text-accent" />
                        <span>Channel</span>
                      </label>
                      {onCreateChannel && !isCreatingChannel && (
                        <button
                          type="button"
                          onClick={() => setIsCreatingChannel(true)}
                          className="text-[10px] text-accent hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>New</span>
                        </button>
                      )}
                    </div>

                    {isCreatingChannel ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={newChannelName}
                          onChange={(e) => setNewChannelName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateChannelSubmit();
                            if (e.key === 'Escape') setIsCreatingChannel(false);
                          }}
                          placeholder="Channel name..."
                          className="flex-1 bg-surface text-ink text-xs rounded-lg px-2 py-1 border border-accent/50 focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleCreateChannelSubmit}
                          disabled={!newChannelName.trim()}
                          className="px-2 py-1 rounded bg-accent text-canvas text-xs font-medium disabled:opacity-40"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <select
                        value={channelId}
                        onChange={(e) => setChannelId(e.target.value)}
                        className="w-full bg-surface text-ink text-xs rounded-lg px-2.5 py-1.5 border border-hairline focus:outline-none cursor-pointer font-mono"
                      >
                        <option value="">No Channel</option>
                        {channels.map((c) => (
                          <option key={c.id} value={c.id}>
                            #{c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Goal Selector */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-ink-muted flex items-center gap-1">
                        <Target className="w-3 h-3 text-accent" />
                        <span>Linked Goal</span>
                      </label>
                      {onCreateGoal && !isCreatingGoal && (
                        <button
                          type="button"
                          onClick={() => setIsCreatingGoal(true)}
                          className="text-[10px] text-accent hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>New</span>
                        </button>
                      )}
                    </div>

                    {isCreatingGoal ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={newGoalTitle}
                          onChange={(e) => setNewGoalTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateGoalSubmit();
                            if (e.key === 'Escape') setIsCreatingGoal(false);
                          }}
                          placeholder="Goal title..."
                          className="flex-1 bg-surface text-ink text-xs rounded-lg px-2 py-1 border border-accent/50 focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleCreateGoalSubmit}
                          disabled={!newGoalTitle.trim()}
                          className="px-2 py-1 rounded bg-accent text-canvas text-xs font-medium disabled:opacity-40"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <select
                        value={goalId}
                        onChange={(e) => setGoalId(e.target.value)}
                        className="w-full bg-surface text-ink text-xs rounded-lg px-2.5 py-1.5 border border-hairline focus:outline-none cursor-pointer"
                      >
                        <option value="">None (Stand-alone)</option>
                        {goals.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* 3. Subtasks Checklist */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-ink-muted flex items-center gap-1">
                    <CheckSquare className="w-3 h-3 text-accent" />
                    <span>Subtasks ({subtasks.filter((s) => s.done).length}/{subtasks.length})</span>
                  </label>

                  {subtasks.length > 0 && (
                    <div className="space-y-1 max-h-28 overflow-y-auto">
                      {subtasks.map((sub, idx) => (
                        <div
                          key={sub.id || idx}
                          className="flex items-center gap-2 p-1.5 rounded-lg bg-surface border border-hairline text-xs"
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleSubtask(idx)}
                            className="text-ink-muted hover:text-accent cursor-pointer"
                          >
                            {sub.done ? (
                              <CheckSquare className="w-3 h-3 text-accent" />
                            ) : (
                              <Square className="w-3 h-3" />
                            )}
                          </button>
                          <span
                            className={`flex-1 truncate ${
                              sub.done ? 'line-through text-ink-muted' : 'text-ink'
                            }`}
                          >
                            {sub.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubtask(idx)}
                            className="text-ink-muted hover:text-red-400 p-0.5 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubtask();
                        }
                      }}
                      placeholder="Add subtask item..."
                      className="flex-1 bg-surface text-ink text-xs rounded-lg px-2.5 py-1.5 border border-hairline focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubtask}
                      disabled={!newSubtaskTitle.trim()}
                      className="px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-hairline text-ink-muted hover:text-ink text-xs disabled:opacity-40 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 4. Notes Textarea */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-ink-muted flex items-center gap-1">
                    <FileText className="w-3 h-3 text-accent" />
                    <span>Notes & Context</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Jot down quick thoughts, links, or sub-bullets..."
                    rows={2}
                    className="w-full bg-surface text-ink text-xs rounded-lg px-3 py-2 border border-hairline focus:border-accent/60 focus:outline-none placeholder:text-ink-muted/40 resize-none font-sans"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </FloatingPanel>
      </div>
    </div>
  );
};
