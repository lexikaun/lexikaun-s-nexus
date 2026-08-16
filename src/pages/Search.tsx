import React, { useState } from 'react';
import { Search as SearchIcon, Briefcase, Music, User, ArrowRight } from 'lucide-react';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');

  const mockResults = [
    { type: 'Professional Task', space: 'professional', title: 'Vocal Layering & Comping for EP Track 2', meta: 'Today 10:30 AM' },
    { type: 'Music Beat', space: 'music', title: 'Nightfall Drift', meta: '140 BPM | D# Min' },
    { type: 'Personal Habit', space: 'personal', title: 'Morning Meditation (15 min)', meta: '5-day streak' },
    { type: 'Professional Goal', space: 'professional', title: 'Release 5-Track Debut EP', meta: '60% completed' },
  ];

  const filtered = query
    ? mockResults.filter(r => r.title.toLowerCase().includes(query.toLowerCase()) || r.type.toLowerCase().includes(query.toLowerCase()))
    : mockResults;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium tracking-tight text-text-main">Search</h1>
        <p className="text-xs text-text-secondary mt-1">
          Instant cross-space index across Tasks, Beats, Goals, and Habits.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative flex items-center">
        <SearchIcon className="w-4 h-4 text-text-secondary absolute left-3.5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, BPM, goal, or space..."
          className="w-full bg-surface hairline-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-main placeholder:text-text-secondary focus:outline-none focus:border-text-secondary transition-colors"
          autoFocus
        />
      </div>

      {/* Results List (Plain rows with py-3 px-3 padding) */}
      <div>
        <span className="text-xs uppercase tracking-wider text-text-secondary font-medium block mb-2">
          Results ({filtered.length})
        </span>

        <div className="divide-y divide-border-main hairline-border rounded-lg bg-bg-main">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="py-3 px-3 flex items-center justify-between hover:bg-surface/40 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-surface hairline-border text-text-secondary shrink-0">
                  {item.space === 'music' ? (
                    <Music className="w-3.5 h-3.5 text-music-accent" />
                  ) : item.space === 'professional' ? (
                    <Briefcase className="w-3.5 h-3.5 text-text-main" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-text-main" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-normal text-text-main group-hover:text-red-main transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                    <span>{item.type}</span>
                    <span>•</span>
                    <span className="font-mono">{item.meta}</span>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
