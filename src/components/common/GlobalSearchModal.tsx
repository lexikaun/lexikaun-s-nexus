import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Calendar,
  Music2,
  Target,
  Play,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { useMusic } from '../../context/MusicContext';
import { Task, Goal, Beat } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (task: Task) => void;
  onSelectGoal: (goal: Goal) => void;
  onSelectBeat: (beat: Beat) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTask,
  onSelectGoal,
  onSelectBeat,
}) => {
  const { tasks, goals } = usePlanner();
  const { beats, playBeat } = useMusic();
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

  const matchingTasks = q
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q)
      )
    : [];

  const matchingGoals = q
    ? goals.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q)
      )
    : [];

  const matchingBeats = q
    ? beats.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.genre?.toLowerCase().includes(q) ||
          b.key?.toLowerCase().includes(q) ||
          b.notes?.toLowerCase().includes(q) ||
          b.tags?.some((tag) => tag.toLowerCase().includes(q))
      )
    : [];

  const totalResults = matchingTasks.length + matchingGoals.length + matchingBeats.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div
        id="modal-global-search"
        className="relative z-10 w-full max-w-xl rounded-2xl border border-[#1E2430] bg-[#0F1218] shadow-2xl overflow-hidden transition-all"
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-[#1E2430] px-4 py-3.5">
          <Search className="h-4 w-4 text-emerald-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, daily goals, beats, stems, tags..."
            className="ml-3 flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
          />
          <kbd className="rounded border border-[#1E2430] bg-[#0A0C10] px-2 py-0.5 font-mono text-[10px] text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Type to search across your whole life operating system & beat repository.
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching tasks, goals, or beats found for "{query}".
            </div>
          ) : (
            <>
              {/* Beats matches */}
              {matchingBeats.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                    Beats & Productions ({matchingBeats.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingBeats.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          onSelectBeat(b);
                          onClose();
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-xl border border-[#1E2430] bg-[#0A0C10] p-2.5 transition hover:border-emerald-500/50 hover:bg-[#141820]"
                      >
                        <div className="flex items-center space-x-2.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playBeat(b);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-black shadow-sm"
                          >
                            <Play className="h-3.5 w-3.5 fill-black ml-0.5" />
                          </button>
                          <div>
                            <div className="text-xs font-bold text-slate-200">{b.title}</div>
                            <div className="font-mono text-[10px] text-slate-400">
                              {b.bpm} BPM · {b.key} · {b.genre}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks matches */}
              {matchingTasks.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-2">
                    Tasks ({matchingTasks.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onSelectTask(t);
                          onClose();
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-xl border border-[#1E2430] bg-[#0A0C10] p-2.5 transition hover:border-indigo-500/50 hover:bg-[#141820]"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <div>
                            <div className="text-xs font-semibold text-slate-200">{t.title}</div>
                            <div className="font-mono text-[10px] text-slate-400">
                              {t.startTime} - {t.endTime} ({t.durationMinutes}m) · {t.priority}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals matches */}
              {matchingGoals.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-2">
                    Goals ({matchingGoals.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingGoals.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => {
                          onSelectGoal(g);
                          onClose();
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-xl border border-[#1E2430] bg-[#0A0C10] p-2.5 transition hover:border-amber-500/50 hover:bg-[#141820]"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Target className="h-4 w-4 text-amber-400" />
                          <div>
                            <div className="text-xs font-semibold text-slate-200">{g.title}</div>
                            {g.description && (
                              <div className="text-[10px] text-slate-400 line-clamp-1">
                                {g.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
