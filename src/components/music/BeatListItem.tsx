import React from 'react';
import {
  Play,
  Pause,
  Heart,
  MoreVertical,
  Music2,
  Clock,
  Radio,
  Flame,
} from 'lucide-react';
import { Beat, BeatStatus } from '../../types';
import { useMusic } from '../../context/MusicContext';

interface BeatListItemProps {
  beat: Beat;
  onOpenDetail: (beat: Beat) => void;
  onAddToPlaylist: (beat: Beat) => void;
}

export const BeatListItem: React.FC<BeatListItemProps> = ({
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
      id={`beat-row-${beat.id}`}
      onClick={() => onOpenDetail(beat)}
      className={`group flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
        isCurrent
          ? 'border-emerald-500/60 bg-[#141820] shadow-md shadow-emerald-500/10'
          : 'border-[#1E2430] bg-[#0F1218] hover:border-slate-700 hover:bg-[#121620]'
      }`}
    >
      {/* Left: Play button, Cover/Icon, Title & Genre */}
      <div className="flex items-center space-x-3.5">
        <button
          onClick={handlePlayToggle}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
            isCurrentlyPlaying
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
              : 'border border-[#1E2430] bg-[#141820] text-slate-200 hover:border-emerald-500/40 hover:text-emerald-400'
          }`}
        >
          {isCurrentlyPlaying ? (
            <Pause className="h-4 w-4 fill-black" />
          ) : (
            <Play className="ml-0.5 h-4 w-4 fill-slate-200" />
          )}
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <h4
              className={`text-sm font-bold tracking-tight ${
                isCurrent
                  ? 'text-emerald-400'
                  : 'text-slate-100'
              }`}
            >
              {beat.title}
            </h4>
            <span
              className={`rounded-md px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(
                beat.status
              )}`}
            >
              {beat.status}
            </span>
          </div>

          <div className="mt-0.5 flex items-center space-x-2 text-xs text-slate-400">
            <span className="font-medium text-slate-300">{beat.genre}</span>
            <span>·</span>
            <span className="font-mono text-emerald-400 font-bold">{beat.bpm} BPM</span>
            <span>·</span>
            <span className="font-mono">{beat.key}</span>
          </div>
        </div>
      </div>

      {/* Right side: Duration, Tags, Session trigger, Heart, More */}
      <div className="flex items-center space-x-3">
        {/* Tags preview on medium+ screens */}
        <div className="hidden space-x-1 md:flex">
          {beat.tags?.slice(0, 2).map((t) => (
            <span key={t} className="rounded-md border border-[#1E2430] bg-[#141820] px-1.5 py-0.5 font-mono text-[9px] text-slate-400">
              #{t}
            </span>
          ))}
        </div>

        <span className="font-mono text-xs text-slate-400">
          {formatDuration(beat.duration)}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            startSession(beat.id, beat.title);
          }}
          className="hidden items-center space-x-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 sm:flex"
          title="Launch focused session"
        >
          <Flame className="h-3 w-3" />
          <span>Session</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(beat.id);
          }}
          className="p-1 text-slate-500 hover:text-rose-500"
          title="Favorite"
        >
          <Heart
            className={`h-4 w-4 ${
              beat.isFavorite ? 'fill-rose-500 text-rose-500' : ''
            }`}
          />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToPlaylist(beat);
          }}
          className="rounded-lg p-1 text-slate-400 hover:bg-[#141820] hover:text-slate-200"
          title="Add to playlist"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
