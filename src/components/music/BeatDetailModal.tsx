import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Music2,
  Clock,
  Heart,
  Edit2,
  Trash2,
  Save,
  Check,
  Flame,
  Radio,
  Sliders,
  Share2,
  FolderPlus,
  Volume2,
} from 'lucide-react';
import { Beat, BeatStatus } from '../../types';
import { useMusic } from '../../context/MusicContext';
import { usePlanner } from '../../context/PlannerContext';

interface BeatDetailModalProps {
  beat: Beat | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPlaylistModal: (beat: Beat) => void;
}

export const BeatDetailModal: React.FC<BeatDetailModalProps> = ({
  beat,
  isOpen,
  onClose,
  onOpenPlaylistModal,
}) => {
  const {
    currentBeat,
    isPlaying,
    currentTime,
    duration,
    playBeat,
    pause,
    resume,
    seek,
    toggleFavorite,
    updateBeat,
    deleteBeat,
    startSession,
  } = useMusic();

  const { tasks, addTask } = usePlanner();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [bpm, setBpm] = useState(120);
  const [key, setKey] = useState('C minor');
  const [genre, setGenre] = useState('');
  const [tagsString, setTagsString] = useState('');
  const [status, setStatus] = useState<BeatStatus>('wip');
  const [notes, setNotes] = useState('');

  const waveformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (beat) {
      setTitle(beat.title);
      setBpm(beat.bpm);
      setKey(beat.key);
      setGenre(beat.genre);
      setTagsString(beat.tags ? beat.tags.join(', ') : '');
      setStatus(beat.status);
      setNotes(beat.notes || '');
      setIsEditing(false);
    }
  }, [beat, isOpen]);

  if (!isOpen || !beat) return null;

  const isCurrent = currentBeat?.id === beat.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const activeDuration = isCurrent && duration > 0 ? duration : beat.duration;
  const activeCurrentTime = isCurrent ? currentTime : 0;
  const progressPercent = activeDuration > 0 ? (activeCurrentTime / activeDuration) * 100 : 0;

  const handlePlayToggle = () => {
    if (isCurrentlyPlaying) {
      pause();
    } else if (isCurrent) {
      resume();
    } else {
      playBeat(beat);
    }
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = ratio * activeDuration;

    if (!isCurrent) {
      playBeat(beat);
      setTimeout(() => seek(targetSeconds), 50);
    } else {
      seek(targetSeconds);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = tagsString
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    await updateBeat({
      ...beat,
      title: title.trim() || beat.title,
      bpm: Number(bpm) || beat.bpm,
      key: key.trim() || beat.key,
      genre: genre.trim() || beat.genre,
      tags: tagsArray,
      status,
      notes: notes.trim(),
    });

    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${beat.title}" from your library?`)) {
      await deleteBeat(beat.id);
      onClose();
    }
  };

  const handleQuickLinkTask = async () => {
    const today = new Date().toISOString().split('T')[0];
    await addTask({
      title: `Produce & Polish: ${beat.title}`,
      date: today,
      startTime: '16:00',
      endTime: '17:30',
      durationMinutes: 90,
      priority: 'high',
      status: 'planned',
      associatedBeatId: beat.id,
      notes: `Studio focus block for ${beat.title} (${beat.bpm} BPM ${beat.key}).`,
    });
    alert(`Created a scheduled task for "${beat.title}" today!`);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const linkedTasks = tasks.filter((t) => t.associatedBeatId === beat.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div
        id="modal-beat-detail"
        className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#1E2430] bg-[#0F1218] p-6 shadow-2xl transition-all"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#1E2430] pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-black shadow-lg shadow-emerald-500/20">
              <Music2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-100">{beat.title}</h3>
                <button
                  onClick={() => toggleFavorite(beat.id)}
                  className="p-1 text-slate-400 hover:text-rose-500"
                >
                  <Heart
                    className={`h-4 w-4 ${beat.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
                  />
                </button>
              </div>
              <p className="font-mono text-xs text-slate-400">
                {beat.genre} · {beat.bpm} BPM · {beat.key}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-1 rounded-xl border border-[#1E2430] bg-[#141820] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-slate-700 hover:text-slate-100"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>{isEditing ? 'Cancel' : 'Edit'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-[#141820] hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Interactive Waveform & Player Area */}
        <div className="mt-5 rounded-2xl border border-[#1E2430] bg-[#0A0C10] p-4.5 shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-emerald-400 font-bold">
              {formatTime(activeCurrentTime)}
            </span>
            <span className="font-mono">{formatTime(activeDuration)}</span>
          </div>

          {/* Waveform Visualization & Scrubber */}
          <div
            ref={waveformRef}
            onClick={handleWaveformClick}
            className="group relative my-3 flex h-16 cursor-pointer items-center space-x-1 overflow-hidden rounded-xl bg-[#0F1218]/90 px-3 transition hover:bg-[#141820]"
          >
            {/* Generated Peak Bars */}
            {[
              30, 60, 45, 90, 75, 40, 85, 95, 60, 40, 80, 100, 50, 70, 85, 30, 95, 60, 45, 80,
              100, 70, 50, 90, 65, 40, 85, 95, 55, 35, 75, 90, 60, 80, 100, 45, 65, 85, 50, 70,
            ].map((peak, idx) => {
              const barPercent = (idx / 40) * 100;
              const isPassed = barPercent <= progressPercent;

              return (
                <div
                  key={idx}
                  className="flex-1 flex items-center justify-center h-full"
                >
                  <div
                    className={`w-full rounded-full transition-all duration-150 ${
                      isPassed
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400/40'
                        : 'bg-slate-700 group-hover:bg-slate-600'
                    }`}
                    style={{
                      height: `${peak}%`,
                      transform: isCurrentlyPlaying && isPassed ? 'scaleY(1.1)' : 'scaleY(1)',
                    }}
                  />
                </div>
              );
            })}

            {/* Playhead Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-emerald-300 shadow-lg shadow-emerald-400"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          {/* Main Playback Controls in Modal */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePlayToggle}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 transition hover:scale-105 active:scale-95"
              >
                {isCurrentlyPlaying ? (
                  <Pause className="h-5 w-5 fill-black" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5 fill-black" />
                )}
              </button>

              <div>
                <div className="text-xs font-bold text-slate-200">
                  {isCurrentlyPlaying ? 'Now Playing Synth & Stems' : 'Audio Engine Ready'}
                </div>
                <div className="text-[11px] text-slate-400">
                  High-fidelity procedural Web Audio engine & audio cache
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  startSession(beat.id, beat.title);
                  onClose();
                }}
                className="flex items-center space-x-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/25"
              >
                <Flame className="h-3.5 w-3.5 text-emerald-400" />
                <span>Launch Studio Session</span>
              </button>

              <button
                onClick={() => onOpenPlaylistModal(beat)}
                className="flex items-center space-x-1.5 rounded-xl border border-[#1E2430] bg-[#141820] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-700 hover:text-slate-100"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add to Playlist</span>
              </button>
            </div>
          </div>
        </div>

        {/* Edit or View Details Form */}
        {isEditing ? (
          <form onSubmit={handleSave} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Beat Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3.5 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300">Tempo (BPM)</label>
                <input
                  type="number"
                  min="40"
                  max="260"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500/60 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Musical Key</label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="e.g. F# minor"
                  className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500/60 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Genre</label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g. Drum & Bass"
                  className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BeatStatus)}
                  className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="wip">Work In Progress (WIP)</option>
                  <option value="finished">Finished Master</option>
                  <option value="released">Released</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tagsString}
                  onChange={(e) => setTagsString(e.target.value)}
                  placeholder="dnb, liquid, dark, 808"
                  className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Arrangement & Mixing Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Sub-bass frequencies, vocal automation notes, mixing chain..."
                className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
              />
            </div>

            <div className="flex items-center justify-between border-t border-[#1E2430] pt-4">
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center space-x-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Beat</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-[#141820]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Updates</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="mt-5 space-y-4">
            {/* Notes Section */}
            {beat.notes && (
              <div className="rounded-xl border border-[#1E2430] bg-[#141820] p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Production Notes
                </span>
                <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                  {beat.notes}
                </p>
              </div>
            )}

            {/* Tags display */}
            {beat.tags && beat.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {beat.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-[#1E2430] bg-[#0A0C10] px-2.5 py-1 font-mono text-xs text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Daily Planner Integration Section */}
            <div className="rounded-xl border border-[#1E2430] bg-[#141820] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    Day Planner Integration
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Schedule dedicated production blocks directly linked to this beat.
                  </p>
                </div>

                <button
                  onClick={handleQuickLinkTask}
                  className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black shadow-md shadow-emerald-500/20 hover:bg-emerald-400"
                >
                  <Clock className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Schedule Task</span>
                </button>
              </div>

              {linkedTasks.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-[#1E2430] pt-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Linked Scheduled Tasks ({linkedTasks.length})
                  </span>
                  {linkedTasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-lg bg-[#0A0C10] p-2 text-xs"
                    >
                      <span className="text-slate-200 font-medium">{t.title}</span>
                      <span className="font-mono text-slate-400">{t.startTime} - {t.endTime}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
