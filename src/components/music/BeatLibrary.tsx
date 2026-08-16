import React, { useState, useMemo } from 'react';
import { Search, Upload, Plus, Filter, Music2, FolderPlus, Radio, Flame, Heart, X, Play } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { Beat } from '../../types';
import { BeatCard } from './BeatCard';
import { BeatListItem } from './BeatListItem';

interface BeatLibraryProps {
  onSelectBeat: (beat: Beat) => void;
  onOpenUpload: () => void;
  onOpenCreatePlaylist: () => void;
  onOpenAddToPlaylist: (beat: Beat) => void;
  onOpenStudioSession: () => void;
}

export const BeatLibrary: React.FC<BeatLibraryProps> = ({
  onSelectBeat,
  onOpenUpload,
  onOpenCreatePlaylist,
  onOpenAddToPlaylist,
  onOpenStudioSession,
}) => {
  const { beats, playlists, playBeat } = useMusic();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('all');

  const filteredBeats = useMemo(() => {
    return beats.filter((beat) => {
      if (selectedPlaylistId !== 'all') {
        const pl = playlists.find((p) => p.id === selectedPlaylistId);
        if (!pl || !pl.beatIds.includes(beat.id)) return false;
      }
      if (selectedStatus !== 'all' && beat.status !== selectedStatus) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          beat.title.toLowerCase().includes(query) ||
          beat.genre?.toLowerCase().includes(query) ||
          beat.tags?.some((t) => t.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [beats, playlists, selectedPlaylistId, selectedStatus, searchQuery]);

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-slate-100">My Music</h1>
          <p className="mt-2 text-sm text-slate-400">Your personal beat library and studio.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenCreatePlaylist}
            className="flex items-center space-x-2 rounded-xl border border-[#27272a] bg-[#121214] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-[#18181b]"
          >
            <FolderPlus className="h-4 w-4" />
            <span>New Playlist</span>
          </button>
          
          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-[#27272a] bg-[#121214] p-2">
        <div className="flex flex-col md:flex-row items-center gap-4 p-2">
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, genre, tags..."
              className="w-full rounded-xl bg-[#09090b] py-2.5 pl-11 pr-4 text-sm text-slate-100 outline-none border border-[#27272a] focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex items-center space-x-1 w-full md:w-auto overflow-x-auto scrollbar-none bg-[#09090b] rounded-xl border border-[#27272a] p-1">
            {(['all', 'wip', 'finished', 'released'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  selectedStatus === st
                    ? 'bg-[#18181b] text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Beat Grid */}
      <div className="space-y-4">
        {filteredBeats.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#27272a] py-24 text-slate-500">
            <Music2 className="h-10 w-10 stroke-1 text-slate-600" />
            <p className="mt-4 text-sm">No beats found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBeats.map((beat) => (
              <div
                key={beat.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#27272a] bg-[#121214] p-5 transition hover:border-[#3f3f46] hover:bg-[#18181b]"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-slate-100 truncate pr-2">{beat.title}</h3>
                    {beat.isFavorite && <Heart className="h-4 w-4 fill-emerald-500 text-emerald-500 shrink-0" />}
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-2 text-xs text-slate-400">
                    {beat.genre && <span>{beat.genre}</span>}
                    {beat.genre && <span>•</span>}
                    <span>{beat.bpm} BPM</span>
                    {beat.key && <span>•</span>}
                    {beat.key && <span>{beat.key}</span>}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex space-x-2">
                    {beat.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded bg-[#09090b] px-2 py-1 text-[10px] font-medium text-slate-500 border border-[#27272a]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBeat(beat);
                      }}
                      className="rounded-full bg-[#09090b] p-2 text-slate-400 hover:text-emerald-400 border border-[#27272a] hover:border-emerald-500/50 transition"
                      title="Details"
                    >
                      <Filter className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playBeat(beat);
                      }}
                      className="rounded-full bg-emerald-500/10 p-2 text-emerald-400 hover:bg-emerald-500 hover:text-black transition"
                      title="Play"
                    >
                      <Play className="h-3.5 w-3.5 ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
