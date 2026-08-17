import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Play, Disc } from 'lucide-react';

export const Playlists: React.FC = () => {
  const playlists = [
    {
      id: '1',
      name: 'Autumn Debut EP 2026',
      description: 'Core 5 tracks in release sequence + 2 bonus B-sides',
      trackCount: 7,
      updatedAt: 'Aug 15, 2026',
    },
    {
      id: '2',
      name: 'Drill & Hard 808s',
      description: 'High energy aggressive beat sketches ready for artist pitching',
      trackCount: 12,
      updatedAt: 'Aug 10, 2026',
    },
    {
      id: '3',
      name: 'Late Night Ambient Sessions',
      description: 'Lofi, synthwave, and chill melodies for focus & background',
      trackCount: 8,
      updatedAt: 'Jul 28, 2026',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-normal tracking-tight text-ink">
            Playlists
          </h1>
          <p className="text-xs text-ink-muted mt-1 font-sans">
            Curated collections composed purely from your self-produced catalog.
          </p>
        </div>
        <Button size="sm" className="bg-accent hover:bg-accent/90 text-canvas font-sans font-medium gap-1.5 rounded-[10px] shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          <span>New Playlist</span>
        </Button>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playlists.map((pl) => (
          <Card
            key={pl.id}
            className="p-5 flex flex-col justify-between group bg-surface border border-hairline rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.35)] hover:border-accent/40 transition-all duration-150"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-accent flex items-center gap-1.5">
                  <Disc className="w-3.5 h-3.5" />
                  {pl.trackCount} Tracks
                </span>
                <span className="text-xs font-mono text-ink-muted">{pl.updatedAt}</span>
              </div>
              <h2 className="font-display text-base font-normal text-ink mb-1 group-hover:text-accent transition-colors">
                {pl.name}
              </h2>
              <p className="text-xs text-ink-muted line-clamp-2 font-sans">{pl.description}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-hairline flex items-center justify-between">
              <span className="text-[11px] font-mono text-ink-muted">Catalog linked</span>
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs font-sans font-medium text-ink hover:text-accent transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-accent" />
                <span>Play All</span>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
