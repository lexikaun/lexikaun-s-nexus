import React, { useState } from 'react';
import { Search as SearchIcon, Briefcase, Music, User, ArrowRight } from 'lucide-react';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');

  const mockResults = [
    { type: 'Task', title: 'Vocal Layering & Comping for EP Track 2', meta: 'Today 10:30 AM' },
    { type: 'Music Beat', title: 'Nightfall Drift', meta: '140 BPM | D# Min' },
    { type: 'Habit', title: 'Morning Meditation (15 min)', meta: '5-day streak' },
    { type: 'Goal', title: 'Release 5-Track Debut EP', meta: '60% completed' },
  ];

  const filtered = query
    ? mockResults.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.type.toLowerCase().includes(query.toLowerCase())
      )
    : mockResults;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-normal tracking-tight text-ink">
          Search
        </h1>
        <p className="text-xs text-ink-muted mt-1 font-sans">
          Search across Tasks, Beats, Goals, and Habits.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative flex items-center">
        <SearchIcon className="w-4 h-4 text-ink-muted absolute left-3.5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, BPM, goal, or tags..."
          className="w-full bg-surface border border-hairline rounded-2xl pl-10 pr-4 py-3 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-accent/60 transition-all font-sans shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
          autoFocus
        />
      </div>

      {/* Results List */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-mono tracking-wider text-ink-muted block px-1">
          Results ({filtered.length})
        </span>

        <div className="divide-y divide-hairline border border-hairline rounded-2xl bg-surface/40 overflow-hidden shadow-sm">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="py-3 px-4 flex items-center justify-between hover:bg-surface-hover/80 transition-all duration-150 group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2 rounded-[8px] bg-surface border border-hairline text-ink-muted shrink-0 shadow-sm">
                  {item.type.includes('Music') || item.type.includes('Beat') ? (
                    <Music className="w-3.5 h-3.5 text-accent" />
                  ) : item.type.includes('Task') ? (
                    <Briefcase className="w-3.5 h-3.5 text-ink" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-ink" />
                  )}
                </div>
                <div>
                  <h3 className="font-display text-sm font-normal text-ink group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-ink-muted mt-0.5 font-sans">
                    <span>{item.type}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">{item.meta}</span>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-ink-muted opacity-0 group-hover:opacity-100 group-hover:text-accent transition-all duration-150" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
