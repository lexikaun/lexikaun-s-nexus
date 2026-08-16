import React, { useState, useMemo } from 'react';
import {
  Search,
  Upload,
  Plus,
  Grid,
  List,
  Filter,
  Music2,
  SlidersHorizontal,
  FolderPlus,
  Radio,
  Sparkles,
  Heart,
  X,
  Flame,
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { BeatCard } from './BeatCard';
import { BeatListItem } from './BeatListItem';
import { Beat, BeatStatus, Playlist } from '../../types';

interface BeatLibraryProps {
  onOpenUpload: () => void;
  onOpenCreatePlaylist: () => void;
  onOpenBeatDetail: (beat: Beat) => void;
  onAddToPlaylist: (beat: Beat) => void;
  onOpenSessionModal: () => void;
}

export const BeatLibrary: React.FC<BeatLibraryProps> = ({
  onOpenUpload,
  onOpenCreatePlaylist,
  onOpenBeatDetail,
  onAddToPlaylist,
  onOpenSessionModal,
}) => {
  const { beats, playlists, playBeat } = useMusic();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [minBpm, setMinBpm] = useState<number>(60);
  const [maxBpm, setMaxBpm] = useState<number>(200);
  const [selectedKey, setSelectedKey] = useState<string>('all');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Extract unique genres and keys
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    beats.forEach((b) => {
      if (b.genre) set.add(b.genre);
    });
    return Array.from(set);
  }, [beats]);

  const availableKeys = useMemo(() => {
    const set = new Set<string>();
    beats.forEach((b) => {
      if (b.key) set.add(b.key);
    });
    return Array.from(set);
  }, [beats]);

  // Filtering logic
  const filteredBeats = useMemo(() => {
    return beats.filter((beat) => {
      // Playlist filter
      if (selectedPlaylistId !== 'all') {
        const pl = playlists.find((p) => p.id === selectedPlaylistId);
        if (!pl || !pl.beatIds.includes(beat.id)) return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && beat.status !== selectedStatus) {
        return false;
      }

      // Favorites filter
      if (onlyFavorites && !beat.isFavorite) {
        return false;
      }

      // Genre filter
      if (selectedGenre !== 'all' && beat.genre !== selectedGenre) {
        return false;
      }

      // Key filter
      if (selectedKey !== 'all' && beat.key !== selectedKey) {
        return false;
      }

      // BPM Range filter
      if (beat.bpm < minBpm || beat.bpm > maxBpm) {
        return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = beat.title.toLowerCase().includes(q);
        const matchGenre = beat.genre?.toLowerCase().includes(q);
        const matchKey = beat.key?.toLowerCase().includes(q);
        const matchTags = beat.tags?.some((t) => t.toLowerCase().includes(q));
        const matchBpm = beat.bpm.toString().includes(q);
        if (!matchTitle && !matchGenre && !matchKey && !matchTags && !matchBpm) {
          return false;
        }
      }

      return true;
    });
  }, [
    beats,
    playlists,
    selectedPlaylistId,
    selectedStatus,
    onlyFavorites,
    selectedGenre,
    selectedKey,
    minBpm,
    maxBpm,
    searchQuery,
  ]);

  const handlePlayAll = () => {
    if (filteredBeats.length > 0) {
      playBeat(filteredBeats[0], filteredBeats);
    }
  };

  return (
    <div id="music-library-container" className="space-y-4">
      {/* Top Banner & Main Actions */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#1E2430] bg-[#0F1218] p-5 shadow-sm md:flex-row md:items-center">
        <div className="flex items-center space-x-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-black shadow-lg shadow-emerald-500/20">
            <Music2 className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100">
              Private Beat Vault & Studio
            </h2>
            <p className="text-xs text-slate-400">
              High-resolution audio repository, stems, BPM/key metadata, and production tracking.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-upload-beat-main"
            onClick={onOpenUpload}
            className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
          >
            <Upload className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Upload Audio (WAV/MP3)</span>
          </button>

          <button
            id="btn-create-playlist-main"
            onClick={onOpenCreatePlaylist}
            className="flex items-center space-x-1.5 rounded-xl border border-[#1E2430] bg-[#141820] px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-700 hover:text-slate-100"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            <span>New Playlist</span>
          </button>

          <button
            id="btn-start-session-main"
            onClick={onOpenSessionModal}
            className="flex items-center space-x-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
          >
            <Flame className="h-3.5 w-3.5 text-emerald-400" />
            <span>Session Mode</span>
          </button>
        </div>
      </div>

      {/* Playlist Chips Row */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        <button
          onClick={() => setSelectedPlaylistId('all')}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 font-semibold transition ${
            selectedPlaylistId === 'all'
              ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
              : 'border border-[#1E2430] bg-[#0F1218] text-slate-400 hover:text-slate-200'
          }`}
        >
          All Beats ({beats.length})
        </button>

        {playlists.map((pl) => (
          <button
            key={pl.id}
            onClick={() => setSelectedPlaylistId(pl.id)}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 font-semibold transition ${
              selectedPlaylistId === pl.id
                ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                : 'border border-[#1E2430] bg-[#0F1218] text-slate-400 hover:text-slate-200'
            }`}
          >
            📁 {pl.name} ({pl.beatIds?.length || 0})
          </button>
        ))}

        <button
          onClick={onOpenCreatePlaylist}
          className="flex shrink-0 items-center space-x-1 rounded-xl border border-dashed border-[#1E2430] px-3 py-1.5 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400"
        >
          <Plus className="h-3 w-3" />
          <span>Add Playlist</span>
        </button>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#1E2430] bg-[#0F1218] p-4 shadow-sm md:flex-row md:items-center">
        {/* Search input */}
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, genre, BPM, key, tags..."
            className="w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] py-2 pl-9 pr-8 text-xs text-slate-100 outline-none transition focus:border-emerald-500/60 focus:bg-[#141820]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex items-center space-x-1 rounded-xl border border-[#1E2430] bg-[#0A0C10] p-1 text-xs font-semibold text-slate-400">
          {(['all', 'wip', 'finished', 'released'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-lg px-3 py-1 uppercase tracking-wider transition ${
                selectedStatus === st
                  ? 'bg-[#141820] text-emerald-400 border border-slate-700 shadow-sm'
                  : 'hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Filter Toggle & View Switcher */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center space-x-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              onlyFavorites
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                : 'border-[#1E2430] bg-[#141820] text-slate-400 hover:text-slate-200'
            }`}
            title="Show only favorites"
          >
            <Heart className={`h-3.5 w-3.5 ${onlyFavorites ? 'fill-rose-500' : ''}`} />
            <span className="hidden sm:inline">Favorites</span>
          </button>

          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`flex items-center space-x-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              isFilterPanelOpen
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                : 'border-[#1E2430] bg-[#141820] text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>

          {/* Grid vs List toggle */}
          <div className="flex items-center rounded-xl border border-[#1E2430] bg-[#0A0C10] p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-[#141820] text-emerald-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Grid View"
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'list'
                  ? 'bg-[#141820] text-emerald-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="List View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Advanced Filter Panel */}
      {isFilterPanelOpen && (
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#1E2430] bg-[#0F1218] p-4 sm:grid-cols-3">
          {/* Genre select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">All Genres</option>
              {availableGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Musical Key */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Musical Key
            </label>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">All Keys</option>
              {availableKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* BPM Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>BPM Range</span>
              <span className="font-mono text-emerald-400 font-bold">
                {minBpm} - {maxBpm} BPM
              </span>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <input
                type="range"
                min="60"
                max="200"
                value={maxBpm}
                onChange={(e) => setMaxBpm(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Beats Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <span>
          Showing <strong className="text-slate-100 font-mono font-bold">{filteredBeats.length}</strong>{' '}
          beats
        </span>
        {filteredBeats.length > 0 && (
          <button
            onClick={handlePlayAll}
            className="font-semibold text-emerald-400 hover:underline"
          >
            ▶ Play All Filtered
          </button>
        )}
      </div>

      {/* Grid or List of Beats */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBeats.map((beat) => (
            <BeatCard
              key={beat.id}
              beat={beat}
              onOpenDetail={onOpenBeatDetail}
              onAddToPlaylist={onAddToPlaylist}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredBeats.map((beat) => (
            <BeatListItem
              key={beat.id}
              beat={beat}
              onOpenDetail={onOpenBeatDetail}
              onAddToPlaylist={onAddToPlaylist}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredBeats.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#1E2430] py-16 text-center">
          <Music2 className="h-10 w-10 text-slate-600" />
          <h4 className="mt-3 text-base font-semibold text-slate-200">
            No beats match your search
          </h4>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            Try adjusting your filters, searching for another keyword, or upload a new beat.
          </p>
          <button
            onClick={onOpenUpload}
            className="mt-4 flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
          >
            <Upload className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Upload New Beat</span>
          </button>
        </div>
      )}
    </div>
  );
};
