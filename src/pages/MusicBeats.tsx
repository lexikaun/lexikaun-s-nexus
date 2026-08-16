import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Play, Pause, Trash2, Upload } from 'lucide-react';

export const MusicBeats: React.FC = () => {
  const [playingId, setPlayingId] = useState<string | null>('1');

  const beats = [
    {
      id: '1',
      title: 'Nightfall Drift',
      bpm: 140,
      key: 'D# Min',
      genre: 'Trap / Ambient',
      tags: ['Dark', '808 Heavy', 'Melodic'],
      status: 'Ready for Master',
      duration: '2:45',
      createdAt: 'Aug 14, 2026'
    },
    {
      id: '2',
      title: 'Solar Flare Bounce',
      bpm: 128,
      key: 'A Min',
      genre: 'Afro-fusion',
      tags: ['Uptempo', 'Percussive', 'Club'],
      status: 'In Progress',
      duration: '3:12',
      createdAt: 'Aug 12, 2026'
    },
    {
      id: '3',
      title: 'Autumn Rain Lofi',
      bpm: 85,
      key: 'F Maj',
      genre: 'Lofi Hip Hop',
      tags: ['Chill', 'Vintage Piano', 'Vinyl'],
      status: 'Idea / Loop',
      duration: '1:58',
      createdAt: 'Aug 08, 2026'
    },
    {
      id: '4',
      title: 'Neon Skyline Synthwave',
      bpm: 110,
      key: 'C Min',
      genre: 'Synthwave',
      tags: ['80s', 'Analog Arp', 'Driving'],
      status: 'Completed',
      duration: '3:30',
      createdAt: 'Jul 29, 2026'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium tracking-tight text-text-main">Beats Catalog</h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-surface border border-music-accent/30 text-music-accent font-medium">
              Self-Produced Only
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Personal production vault. BPM and Key are strictly author-specified values.
          </p>
        </div>

        <Button size="sm" className="bg-music-accent hover:bg-opacity-90 text-white gap-2">
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Beat</span>
        </Button>
      </div>

      {/* Global Mini Player Widget (Option E Music Accent Styled) */}
      <div className="p-4 rounded-lg bg-surface hairline-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-music-accent animate-ping" />
            <div>
              <span className="text-xs font-medium text-text-main">Now Playing: Nightfall Drift</span>
              <span className="text-xs text-text-secondary ml-2 font-mono text-music-accent">140 BPM · D# Min</span>
            </div>
          </div>
          <span className="text-xs font-mono text-text-secondary">01:14 / 02:45</span>
        </div>
        {/* Progress Bar with Music Accent */}
        <div className="w-full bg-bg-main h-1.5 rounded-full overflow-hidden">
          <div className="bg-music-accent h-full w-[45%] rounded-full" />
        </div>
      </div>

      {/* Beat Rows with lightweight monospace text columns & py-3 px-3 padding */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-text-secondary font-medium">
            Catalog Entries (4 tracks)
          </span>
          <span className="text-xs text-text-secondary font-mono">11:25 Total</span>
        </div>

        <div className="divide-y divide-border-main hairline-border rounded-lg bg-bg-main">
          {beats.map((beat) => (
            <div
              key={beat.id}
              className="py-3 px-3 flex items-center justify-between hover:bg-surface/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPlayingId(playingId === beat.id ? null : beat.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    playingId === beat.id
                      ? 'bg-music-accent text-white'
                      : 'bg-surface hairline-border text-text-main hover:border-music-accent'
                  }`}
                >
                  {playingId === beat.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                </button>

                <div>
                  <h3 className="text-sm font-normal text-text-main group-hover:text-music-accent transition-colors">
                    {beat.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                    <span>{beat.genre}</span>
                    <span>•</span>
                    <span>{beat.createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5">
                {/* Studio Readout: Lightweight Monospace Text Columns (140 BPM | D# Min) */}
                <div className="text-xs font-mono text-text-secondary flex items-center gap-2">
                  <span className="text-music-accent">{beat.bpm} BPM</span>
                  <span className="opacity-40">|</span>
                  <span className="text-text-main">{beat.key}</span>
                </div>

                <div className="text-xs font-mono text-text-secondary w-10 text-right">
                  {beat.duration}
                </div>

                <button
                  title="Batched Delete (Storage + Firestore + Playlists)"
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-surface text-text-secondary hover:text-red-main transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
