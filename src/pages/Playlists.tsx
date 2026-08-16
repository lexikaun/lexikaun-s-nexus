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
      updatedAt: 'Aug 15, 2026'
    },
    {
      id: '2',
      name: 'Drill & Hard 808s',
      description: 'High energy aggressive beat sketches ready for artist pitching',
      trackCount: 12,
      updatedAt: 'Aug 10, 2026'
    },
    {
      id: '3',
      name: 'Late Night Ambient Sessions',
      description: 'Lofi, synthwave, and chill melodies for focus & background',
      trackCount: 8,
      updatedAt: 'Jul 28, 2026'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-text-main">Playlists</h1>
          <p className="text-xs text-text-secondary mt-1">
            Curated collections composed purely from your self-produced catalog.
          </p>
        </div>
        <Button size="sm" variant="secondary" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>New Playlist</span>
        </Button>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playlists.map((pl) => (
          <Card key={pl.id} className="p-4 flex flex-col justify-between group hover:border-border-main transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-music-accent flex items-center gap-1.5">
                  <Disc className="w-3.5 h-3.5" />
                  {pl.trackCount} Tracks
                </span>
                <span className="text-xs text-text-secondary">{pl.updatedAt}</span>
              </div>
              <h2 className="text-sm font-normal text-text-main mb-1 group-hover:text-music-accent transition-colors">
                {pl.name}
              </h2>
              <p className="text-xs text-text-secondary line-clamp-2">{pl.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-border-main/50 flex items-center justify-between">
              <span className="text-xs text-text-secondary">Catalog linked</span>
              <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-text-main hover:text-music-accent">
                <Play className="w-3.5 h-3.5" />
                <span>Play All</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
