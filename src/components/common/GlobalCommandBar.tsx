import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Calendar,
  Target,
  Sparkles,
  Command,
  Plus
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { useMusic } from '../../context/MusicContext';
import { Task, Goal, Beat } from '../../types';

interface GlobalCommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (task: Task) => void;
  onSelectGoal: (goal: Goal) => void;
  onSelectBeat: (beat: Beat) => void;
  onActionCreateTask: () => void;
  onActionCreateGoal: () => void;
  onActionAskLexikaun: () => void;
}

export const GlobalCommandBar: React.FC<GlobalCommandBarProps> = ({
  isOpen,
  onClose,
  onSelectTask,
  onSelectGoal,
  onSelectBeat,
  onActionCreateTask,
  onActionCreateGoal,
  onActionAskLexikaun,
}) => {
  const { tasks, goals } = usePlanner();
  const { beats } = useMusic();
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingTasks = q ? tasks.filter(t => t.title.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q)) : [];
  const matchingGoals = q ? goals.filter(g => g.title.toLowerCase().includes(q)) : [];
  const matchingBeats = q ? beats.filter(b => b.title.toLowerCase().includes(q) || b.genre?.toLowerCase().includes(q) || b.tags?.some(tag => tag.toLowerCase().includes(q))) : [];

  const hasSearchQuery = q.length > 0;
  const noResults = hasSearchQuery && matchingTasks.length === 0 && matchingGoals.length === 0 && matchingBeats.length === 0;

  const handleAction = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-32">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#27272a] bg-[#09090b] shadow-2xl">
        
        {/* Search Input */}
        <div className="flex items-center border-b border-[#27272a] px-4 py-4">
          <Search className="h-5 w-5 text-slate-500" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent px-4 text-lg text-slate-100 outline-none placeholder:text-slate-500"
          />
          <div className="flex items-center space-x-1">
            <kbd className="rounded border border-[#27272a] bg-[#121214] px-1.5 py-1 text-[10px] font-medium text-slate-500">ESC</kbd>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-none">
          {!hasSearchQuery && (
            <div className="px-2 py-4">
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Quick Actions</h3>
              <div className="space-y-1">
                
                <button
                  onClick={() => handleAction(onActionAskLexikaun)}
                  className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-[#121214]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-slate-200">Ask Lexikaun</span>
                  </div>
                  <span className="text-xs text-slate-500 opacity-0 transition group-hover:opacity-100">AI Assistant</span>
                </button>

                <button
                  onClick={() => handleAction(onActionCreateTask)}
                  className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-[#121214]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#18181b] text-slate-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-slate-200">Schedule Task</span>
                  </div>
                  <Plus className="h-4 w-4 text-slate-500 opacity-0 transition group-hover:opacity-100" />
                </button>

                <button
                  onClick={() => handleAction(onActionCreateGoal)}
                  className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-[#121214]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#18181b] text-slate-400">
                      <Target className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-slate-200">Create Goal</span>
                  </div>
                  <Plus className="h-4 w-4 text-slate-500 opacity-0 transition group-hover:opacity-100" />
                </button>

              </div>
            </div>
          )}

          {hasSearchQuery && (
            <div className="py-2">
              {matchingTasks.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Tasks</h3>
                  {matchingTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => handleAction(() => onSelectTask(task))}
                      className="flex w-full items-center space-x-3 px-4 py-3 text-left transition hover:bg-[#121214]"
                    >
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <div>
                        <div className="text-sm font-medium text-slate-200">{task.title}</div>
                        <div className="text-xs text-slate-500">{task.date} · {task.status}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {matchingGoals.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Goals</h3>
                  {matchingGoals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => handleAction(() => onSelectGoal(goal))}
                      className="flex w-full items-center space-x-3 px-4 py-3 text-left transition hover:bg-[#121214]"
                    >
                      <Target className="h-4 w-4 text-slate-500" />
                      <div>
                        <div className="text-sm font-medium text-slate-200">{goal.title}</div>
                        <div className="text-xs text-slate-500">{goal.category}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {noResults && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                  <Command className="mb-2 h-8 w-8 stroke-1" />
                  <p className="text-sm">No results found for "{query}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
