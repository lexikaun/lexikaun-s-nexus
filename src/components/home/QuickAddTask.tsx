import React, { useState, useRef, useEffect } from 'react';
import { Clock, Target, X, Plus, Check, Hash } from 'lucide-react';
import { Priority, Goal, Channel } from '../../types';

export interface QuickAddTaskProps {
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
    notes?: string;
  }) => Promise<void> | void;
  onCancel: () => void;
}

export const QuickAddTask: React.FC<QuickAddTaskProps> = ({
  dateStr,
  goals = [],
  channels = [],
  onCreateGoal,
  onCreateChannel,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [startTime, setStartTime] = useState<string>('');
  const [goalId, setGoalId] = useState<string>('');
  const [channelId, setChannelId] = useState<string>('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showChannelPicker, setShowChannelPicker] = useState(false);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
      if (showTimePicker) {
        setShowTimePicker(false);
      } else if (showGoalPicker) {
        setShowGoalPicker(false);
      } else if (showChannelPicker) {
        setShowChannelPicker(false);
      } else {
        onCancel();
      }
    } else if (e.key === 'Enter' && !e.shiftKey && !isCreatingGoal && !isCreatingChannel) {
      e.preventDefault();
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const endTime = startTime ? calculateEndTime(startTime, duration) : '';
      await onSave({
        title: title.trim(),
        date: dateStr,
        startTime: startTime || '',
        endTime: endTime || '',
        durationMinutes: duration,
        priority: 'medium',
        goalId: goalId || undefined,
        channelId: channelId || undefined,
      });

      // Clear input and keep focused for frictionless Sunsama continuous entry
      setTitle('');
      inputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNewGoalSubmit = async () => {
    if (!newGoalTitle.trim() || !onCreateGoal) return;
    const createdId = await onCreateGoal(newGoalTitle.trim());
    setGoalId(createdId);
    setNewGoalTitle('');
    setIsCreatingGoal(false);
    setShowGoalPicker(false);
    inputRef.current?.focus();
  };

  const handleCreateNewChannelSubmit = async () => {
    if (!newChannelName.trim() || !onCreateChannel) return;
    const createdId = await onCreateChannel(newChannelName.trim());
    setChannelId(createdId);
    setNewChannelName('');
    setIsCreatingChannel(false);
    setShowChannelPicker(false);
    inputRef.current?.focus();
  };

  const selectedGoal = goals.find((g) => g.id === goalId);
  const selectedChannel = channels.find((c) => c.id === channelId);

  return (
    <div
      ref={containerRef}
      className="p-2.5 bg-surface/90 border border-red-main/40 rounded-xl shadow-lg transition-all duration-150 animate-in fade-in zoom-in-95 space-y-2 select-none"
    >
      {/* 1. Sunsama Minimalist Title Input */}
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded border border-border-main/60 shrink-0 opacity-40" />
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done? (Enter to save)"
          className="w-full bg-transparent text-xs text-text-main placeholder:text-text-secondary/50 font-normal focus:outline-none"
        />
        {title.trim() && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-1.5 py-0.5 rounded bg-red-main/20 hover:bg-red-main text-red-main hover:text-white text-[10px] font-mono font-medium transition-colors shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>↵</span>
          </button>
        )}
      </div>

      {/* 2. Quiet Inline Attribute Chips */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-border-main/30 text-[11px] font-mono">
        {/* Quick Duration Chips */}
        <div className="flex items-center gap-1">
          {[15, 30, 60, 120].map((mins) => {
            const label = mins < 60 ? `${mins}m` : `${mins / 60}h`;
            const isSelected = duration === mins;
            return (
              <button
                key={mins}
                type="button"
                onClick={() => setDuration(mins)}
                className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer text-[10px] ${
                  isSelected
                    ? 'bg-red-main/20 text-red-main border border-red-main/40 font-medium'
                    : 'bg-surface/50 border border-border-main/40 text-text-secondary hover:text-text-main'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Start Time Pill */}
        <div className="relative">
          {startTime ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface border border-border-main/60 text-text-main text-[10px]">
              <Clock className="w-2.5 h-2.5 text-red-main" />
              <span>{startTime}</span>
              <button
                type="button"
                onClick={() => setStartTime('')}
                className="text-text-secondary hover:text-text-main ml-0.5"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowTimePicker(!showTimePicker);
                setShowGoalPicker(false);
                setShowChannelPicker(false);
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface/50 border border-border-main/40 text-text-secondary hover:text-text-main transition-colors cursor-pointer text-[10px]"
            >
              <Clock className="w-2.5 h-2.5" />
              <span>+ Time</span>
            </button>
          )}

          {showTimePicker && (
            <div className="absolute left-0 top-full mt-1 z-30 p-2 bg-surface border border-border-main/60 rounded-lg shadow-xl flex items-center gap-1">
              <input
                type="time"
                value={startTime || '09:00'}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setShowTimePicker(false);
                  inputRef.current?.focus();
                }}
                className="bg-bg-main text-text-main text-xs px-1.5 py-1 rounded border border-border-main/50 focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowTimePicker(false)}
                className="p-1 text-text-secondary hover:text-text-main"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Channel Pill */}
        <div className="relative">
          {selectedChannel ? (
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px]"
              style={{
                backgroundColor: `${selectedChannel.color}15`,
                borderColor: `${selectedChannel.color}40`,
                color: selectedChannel.color,
              }}
            >
              <Hash className="w-2.5 h-2.5 shrink-0" />
              <span className="max-w-[80px] truncate">{selectedChannel.name}</span>
              <button
                type="button"
                onClick={() => setChannelId('')}
                className="text-text-secondary hover:text-text-main ml-0.5"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowChannelPicker(!showChannelPicker);
                setShowGoalPicker(false);
                setShowTimePicker(false);
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface/50 border border-border-main/40 text-text-secondary hover:text-text-main transition-colors cursor-pointer text-[10px]"
            >
              <Hash className="w-2.5 h-2.5" />
              <span>+ Channel</span>
            </button>
          )}

          {showChannelPicker && (
            <div className="absolute left-0 top-full mt-1 z-30 w-48 p-1.5 bg-surface border border-border-main/60 rounded-lg shadow-xl space-y-1">
              <div className="text-[9px] uppercase font-mono text-text-secondary px-1 py-0.5">
                Select Channel
              </div>

              {channels.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setChannelId(c.id);
                    setShowChannelPicker(false);
                    inputRef.current?.focus();
                  }}
                  className="w-full text-left px-2 py-1 rounded text-xs text-text-main hover:bg-bg-main flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="truncate">{c.name}</span>
                  </span>
                  {channelId === c.id && <Check className="w-3 h-3 text-red-main" />}
                </button>
              ))}

              {isCreatingChannel ? (
                <div className="flex items-center gap-1 pt-1 border-t border-border-main/40">
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateNewChannelSubmit();
                      if (e.key === 'Escape') setIsCreatingChannel(false);
                    }}
                    placeholder="New channel name..."
                    className="flex-1 bg-bg-main text-text-main text-[11px] rounded px-1.5 py-1 border border-border-main/50 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewChannelSubmit}
                    disabled={!newChannelName.trim()}
                    className="px-1.5 py-1 rounded bg-red-main text-white text-[10px] disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              ) : (
                onCreateChannel && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingChannel(true)}
                    className="w-full text-left px-2 py-1 rounded text-[11px] text-red-main hover:bg-red-main/10 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create Channel...</span>
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Goal Tag Pill */}
        <div className="relative">
          {selectedGoal ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-main/10 border border-red-main/30 text-text-main text-[10px]">
              <Target className="w-2.5 h-2.5 text-red-main" />
              <span className="max-w-[80px] truncate">{selectedGoal.title}</span>
              <button
                type="button"
                onClick={() => setGoalId('')}
                className="text-text-secondary hover:text-text-main ml-0.5"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowGoalPicker(!showGoalPicker);
                setShowTimePicker(false);
                setShowChannelPicker(false);
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface/50 border border-border-main/40 text-text-secondary hover:text-text-main transition-colors cursor-pointer text-[10px]"
            >
              <Target className="w-2.5 h-2.5" />
              <span>+ Goal</span>
            </button>
          )}

          {showGoalPicker && (
            <div className="absolute left-0 top-full mt-1 z-30 w-48 p-1.5 bg-surface border border-border-main/60 rounded-lg shadow-xl space-y-1">
              <div className="text-[9px] uppercase font-mono text-text-secondary px-1 py-0.5">
                Link to Goal
              </div>

              {goals.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setGoalId(g.id);
                    setShowGoalPicker(false);
                    inputRef.current?.focus();
                  }}
                  className="w-full text-left px-2 py-1 rounded text-xs text-text-main hover:bg-bg-main flex items-center justify-between transition-colors"
                >
                  <span className="truncate">{g.title}</span>
                  {goalId === g.id && <Check className="w-3 h-3 text-red-main" />}
                </button>
              ))}

              {isCreatingGoal ? (
                <div className="flex items-center gap-1 pt-1 border-t border-border-main/40">
                  <input
                    type="text"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateNewGoalSubmit();
                      if (e.key === 'Escape') setIsCreatingGoal(false);
                    }}
                    placeholder="New goal title..."
                    className="flex-1 bg-bg-main text-text-main text-[11px] rounded px-1.5 py-1 border border-border-main/50 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewGoalSubmit}
                    disabled={!newGoalTitle.trim()}
                    className="px-1.5 py-1 rounded bg-red-main text-white text-[10px] disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              ) : (
                onCreateGoal && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingGoal(true)}
                    className="w-full text-left px-2 py-1 rounded text-[11px] text-red-main hover:bg-red-main/10 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create Goal...</span>
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Escape Hint / Close Button */}
        <div className="ml-auto flex items-center gap-1 text-[9px] text-text-secondary">
          <span className="opacity-60">esc to close</span>
          <button
            type="button"
            onClick={onCancel}
            className="p-0.5 rounded hover:bg-surface text-text-secondary hover:text-text-main cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
