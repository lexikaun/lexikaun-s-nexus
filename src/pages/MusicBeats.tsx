import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Play, Pause, Trash2, Upload, Disc, Radio } from 'lucide-react';

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
      createdAt: 'Aug 14, 2026',
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
      createdAt: 'Aug 12, 2026',
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
      createdAt: 'Aug 08, 2026',
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
      createdAt: 'Jul 29, 2026',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-normal tracking-tight text-ink">
              Beats Catalog
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-[6px] bg-surface border border-accent/30 text-accent font-mono">
              Self-Produced Only
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1 font-sans">
            Personal production vault. BPM and Key are strictly author-specified metadata.
          </p>
        </div>

        <Button size="sm" className="bg-accent hover:bg-accent/90 text-canvas font-sans font-medium gap-2 shadow-sm rounded-[10px]">
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Beat</span>
        </Button>
      </div>

      {/* Global Mini Player Widget */}
      <Card className="p-4 bg-surface border border-hairline rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(217,142,74,0.6)]" />
            <div>
              <span className="text-xs font-display font-medium text-ink">
                Now Playing: Nightfall Drift
              </span>
              <span className="text-xs ml-2.5 font-mono text-accent">
                140 BPM · D# Min
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-ink-muted">01:14 / 02:45</span>
        </div>
        {/* Progress Bar with Warm Accent */}
        <div className="w-full bg-canvas h-1.5 rounded-full overflow-hidden">
          <div className="bg-accent h-full w-[45%] rounded-full shadow-sm" />
        </div>
      </Card>

      {/* Beat Rows with lightweight monospace studio readout */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs uppercase tracking-wider text-ink-muted font-mono">
            Catalog Entries (4 tracks)
          </span>
          <span className="text-xs text-ink-muted font-mono">11:25 Total</span>
        </div>

        <div className="divide-y divide-hairline border border-hairline rounded-2xl bg-surface/40 overflow-hidden">
          {beats.map((beat) => (
            <div
              key={beat.id}
              className="py-3 px-4 flex items-center justify-between hover:bg-surface-hover/80 transition-all duration-150 group"
            >
              <div className="flex items-center gap-3.5">
                <button
                  onClick={() => setPlayingId(playingId === beat.id ? null : beat.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 ${
                    playingId === beat.id
                      ? 'bg-accent text-canvas shadow-[0_0_8px_rgba(217,142,74,0.5)]'
                      : 'bg-surface border border-hairline text-ink hover:border-accent'
                  }`}
                >
                  {playingId === beat.id ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5 ml-0.5" />
                  )}
                </button>

                <div>
                  <h3 className="font-display text-sm font-normal text-ink group-hover:text-accent transition-colors">
                    {beat.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-ink-muted mt-0.5 font-sans">
                    <span>{beat.genre}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">{beat.createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5">
                {/* Studio Readout: Monospace Columns */}
                <div className="text-xs font-mono text-ink-muted flex items-center gap-2">
                  <span className="text-accent font-medium">{beat.bpm} BPM</span>
                  <span className="opacity-30">|</span>
                  <span className="text-ink">{beat.key}</span>
                </div>

                <div className="text-xs font-mono text-ink-muted w-12 text-right">
                  {beat.duration}
                </div>

                <button
                  title="Delete Beat"
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-surface text-ink-muted hover:text-red-400 transition-all cursor-pointer"
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
