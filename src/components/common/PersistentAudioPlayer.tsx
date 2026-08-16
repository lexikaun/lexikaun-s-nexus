import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Music2,
  Maximize2,
  Flame,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

interface PersistentAudioPlayerProps {
  onOpenBeatDetail: (beatId: string) => void;
  onOpenSession: () => void;
}

export const PersistentAudioPlayer: React.FC<PersistentAudioPlayerProps> = ({
  onOpenBeatDetail,
  onOpenSession,
}) => {
  const {
    currentBeat,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isLooping,
    isShuffle,
    pause,
    resume,
    seek,
    setVolume,
    setPlaybackRate,
    toggleLoop,
    toggleShuffle,
    playNext,
    playPrevious,
    startSession,
  } = useMusic();

  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const progressBarRef = useRef<HTMLDivElement>(null);

  if (!currentBeat) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * duration);
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(prevVolume || 0.8);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div
      id="persistent-audio-player"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1E2430] bg-[#0A0C10]/95 px-4 py-2.5 backdrop-blur-2xl shadow-2xl transition-all sm:px-6"
    >
      {/* Top Thin Progress Scrub Bar */}
      <div
        ref={progressBarRef}
        onClick={handleSeek}
        className="group relative -mt-3.5 mb-2 h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-[#1E2430] transition-all hover:h-2.5"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-400/50 transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Left: Beat Information */}
        <div className="flex min-w-[160px] items-center space-x-3 sm:min-w-[220px]">
          <div
            onClick={() => onOpenBeatDetail(currentBeat.id)}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-black shadow-md shadow-emerald-500/20 transition hover:scale-105"
          >
            <Music2 className="h-5 w-5 stroke-[2.5]" />
          </div>

          <div className="truncate">
            <h4
              onClick={() => onOpenBeatDetail(currentBeat.id)}
              className="cursor-pointer truncate text-xs font-bold text-slate-100 transition hover:text-emerald-400 sm:text-sm"
            >
              {currentBeat.title}
            </h4>
            <div className="flex items-center space-x-1.5 font-mono text-[10px] text-slate-400">
              <span className="text-emerald-400 font-bold">{currentBeat.bpm} BPM</span>
              <span>·</span>
              <span>{currentBeat.key}</span>
              <span className="hidden sm:inline">· {currentBeat.genre}</span>
            </div>
          </div>
        </div>

        {/* Center: Playback Transport Controls */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={toggleShuffle}
              className={`hidden p-1.5 sm:block transition ${
                isShuffle ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Shuffle"
            >
              <Shuffle className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={playPrevious}
              className="p-1 text-slate-400 transition hover:text-slate-100"
              title="Previous Track"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              onClick={isPlaying ? pause : resume}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 transition hover:scale-105 active:scale-95 sm:h-10 sm:w-10"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-black" />
              ) : (
                <Play className="ml-0.5 h-4 w-4 fill-black" />
              )}
            </button>

            <button
              onClick={playNext}
              className="p-1 text-slate-400 transition hover:text-slate-100"
              title="Next Track"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            <button
              onClick={toggleLoop}
              className={`hidden p-1.5 sm:block transition ${
                isLooping ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Loop track"
            >
              <Repeat className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Time tracker */}
          <div className="hidden items-center space-x-1.5 font-mono text-[10px] text-slate-400 sm:flex">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & Quick Modes */}
        <div className="flex items-center space-x-3">
          {/* Speed Toggle */}
          <button
            onClick={() => {
              const rates = [1, 1.25, 1.5, 0.75];
              const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
              setPlaybackRate(rates[nextIdx]);
            }}
            className="hidden rounded-lg border border-[#1E2430] bg-[#141820] px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-300 hover:text-emerald-400 sm:block"
            title="Playback speed"
          >
            {playbackRate}x
          </button>

          {/* Volume Control */}
          <div className="hidden items-center space-x-2 md:flex">
            <button
              onClick={handleMuteToggle}
              className="text-slate-400 hover:text-slate-200"
            >
              {volume === 0 || isMuted ? (
                <VolumeX className="h-4 w-4 text-rose-400" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setIsMuted(false);
              }}
              className="h-1 w-16 accent-emerald-500"
            />
          </div>

          {/* Studio Session Mode trigger */}
          <button
            onClick={() => {
              startSession(currentBeat.id, currentBeat.title);
              onOpenSession();
            }}
            className="flex items-center space-x-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/25"
            title="Open Studio Session"
          >
            <Flame className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
