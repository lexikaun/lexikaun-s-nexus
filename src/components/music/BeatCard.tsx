import React from 'react';
import {
  Play,
  Pause,
  Heart,
  MoreVertical,
  Music2,
  Clock,
  Sparkles,
  Radio,
  Tag,
  Flame,
} from 'lucide-react';
import { Beat, BeatStatus } from '../../types';
import { useMusic } from '../../context/MusicContext';

interface BeatCardProps {
  beat: Beat;
  onOpenDetail: (beat: Beat) => void;
  onAddToPlaylist: (beat: Beat) => void;
}

export const BeatCard: React.FC<BeatCardProps> = ({
  beat,
  onOpenDetail,
  onAddToPlaylist,
}) => {
  const { currentBeat, isPlaying, playBeat, pause, resume, toggleFavorite, startSession } =
    useMusic();

  const isCurrent = currentBeat?.id === beat.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentlyPlaying) {
      pause();
    } else if (isCurrent) {
      resume();
    } else {
      playBeat(beat);
    }
  };

  const getStatusBadge = (status: BeatStatus) => {
    switch (status) {
      case 'finished':
        return 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
      case 'wip':
        return 'border border-amber-500/30 bg-amber-500/10 text-amber-400';
      case 'released':
        return 'border border-indigo-500/30 bg-indigo-500/10 text-indigo-400';
      default:
        return 'border border-slate-700 bg-slate-800 text-slate-400';
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div
      id={`beat-card-${beat.id}`}
      onClick={() => onOpenDetail(beat)}
      className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isCurrent
          ? 'border-emerald-500/60 bg-[#141820] ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
          : 'border-[#1E2430] bg-[#0F1218] hover:border-slate-700 hover:bg-[#121620]'
      }`}
    >
      {/* Top Cover / Waveform Art Banner */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#0A0C10] shadow-inner border border-[#1E2430]">
        {beat.coverUrl ? (
          <img
            src={beat.coverUrl}
            alt={beat.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0A0C10] via-[#0F1218] to-[#141820] p-4"
            style={{
              backgroundImage: beat.color
                ? `linear-gradient(135deg, ${beat.color}25 0%, #0A0C10 100%)`
                : undefined,
            }}
          >
            {/* Generative synth waveform bars */}
            <div className="flex h-12 items-end space-x-1 opacity-70">
              {[40, 75, 55, 95, 30, 85, 60, 100, 45, 70, 90, 35, 65, 80, 50, 85].map(
                (height, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      isCurrentlyPlaying
                        ? 'animate-pulse bg-emerald-400 shadow-sm shadow-emerald-400/50'
                        : 'bg-slate-700 group-hover:bg-emerald-500/60'
                    }`}
                    style={{
                      height: isCurrentlyPlaying ? `${(height * (1 + (i % 3) * 0.2)) % 100}%` : `${height}%`,
                      backgroundColor: beat.color || undefined,
                    }}
                  />
                )
              )}
            </div>
          </div>
        )}

        {/* Status Tag Overlay */}
        <div className="absolute left-2.5 top-2.5">
          <span
            className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${getStatusBadge(
              beat.status
            )}`}
          >
            {beat.status}
          </span>
        </div>

        {/* Favorite Heart button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(beat.id);
          }}
          className="absolute right-2.5 top-2.5 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-md transition hover:bg-black/80"
          title="Favorite beat"
        >
          <Heart
            className={`h-3.5 w-3.5 ${
              beat.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
            }`}
          />
        </button>

        {/* Big Center Play Overlay Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
          <button
            onClick={handlePlayToggle}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-black shadow-xl shadow-emerald-500/30 transition-transform hover:scale-110 active:scale-95"
          >
            {isCurrentlyPlaying ? (
              <Pause className="h-5 w-5 fill-black" />
            ) : (
              <Play className="ml-0.5 h-5 w-5 fill-black" />
            )}
          </button>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2.5 right-2.5 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-slate-300 backdrop-blur-sm border border-slate-800">
          {formatDuration(beat.duration)}
        </div>
      </div>

      {/* Metadata Bottom Section */}
      <div className="mt-3.5 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h4 className="truncate text-base font-bold text-slate-100 transition group-hover:text-emerald-400">
              {beat.title}
            </h4>
          </div>

          {/* BPM & Key badges */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-lg border border-[#1E2430] bg-[#141820] px-2 py-0.5 font-mono text-xs font-bold text-emerald-400">
              {beat.bpm} BPM
            </span>
            <span className="rounded-lg border border-[#1E2430] bg-[#141820] px-2 py-0.5 font-mono text-xs font-semibold text-slate-300">
              {beat.key}
            </span>
            <span className="rounded-lg border border-[#1E2430] bg-[#141820] px-2 py-0.5 text-xs text-slate-400">
              {beat.genre}
            </span>
          </div>

          {/* Tags */}
          {beat.tags && beat.tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {beat.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-slate-500 font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Quick Actions */}
        <div className="mt-3.5 flex items-center justify-between border-t border-[#1E2430] pt-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              startSession(beat.id, beat.title);
            }}
            className="flex items-center space-x-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
            title="Start focused production session on this beat"
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Studio Session</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylist(beat);
            }}
            className="rounded-lg p-1 text-slate-400 hover:bg-[#141820] hover:text-slate-200"
            title="Add to playlist"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
