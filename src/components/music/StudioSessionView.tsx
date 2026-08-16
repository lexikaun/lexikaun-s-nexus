import React, { useState, useEffect } from 'react';
import {
  Flame,
  Play,
  Pause,
  RotateCcw,
  Square,
  Music2,
  Clock,
  Volume2,
  Sliders,
  CheckCircle2,
  FileText,
  Activity,
  Radio,
  Zap,
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { audioEngine } from '../../services/audioEngine';

interface StudioSessionViewProps {
  onOpenBeatDetail: (beatId: string) => void;
}

export const StudioSessionView: React.FC<StudioSessionViewProps> = ({
  onOpenBeatDetail,
}) => {
  const {
    activeSession,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    updateSessionNotes,
    beats,
    currentBeat,
    playBeat,
    isPlaying,
    pause,
    resume,
  } = useMusic();

  const [sessionTime, setSessionTime] = useState<number>(0);
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [metronomeBpm, setMetronomeBpm] = useState(120);
  const [metronomeInterval, setMetronomeInterval] = useState<any>(null);
  const [synthPreset, setSynthPreset] = useState<'liquid' | 'trap' | 'lofi' | 'retro'>('liquid');
  const [sessionNotes, setSessionNotes] = useState('');

  // Sync active session time
  useEffect(() => {
    let timer: any = null;
    if (activeSession && activeSession.isRunning) {
      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - activeSession.startTime) / 1000);
        setSessionTime(elapsed);
      }, 1000);
    } else if (!activeSession) {
      setSessionTime(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeSession]);

  useEffect(() => {
    if (activeSession) {
      setSessionNotes(activeSession.notes || '');
    }
  }, [activeSession]);

  // Metronome tick logic using Web Audio
  const toggleMetronome = () => {
    if (metronomeActive) {
      if (metronomeInterval) clearInterval(metronomeInterval);
      setMetronomeActive(false);
    } else {
      setMetronomeActive(true);
      const intervalMs = (60 / metronomeBpm) * 1000;
      let beatCount = 0;
      const intId = setInterval(() => {
        const freq = beatCount % 4 === 0 ? 1000 : 800;
        audioEngine.playSynthTone(freq, 0.05, 'sine');
        beatCount++;
      }, intervalMs);
      setMetronomeInterval(intId);
    }
  };

  useEffect(() => {
    return () => {
      if (metronomeInterval) clearInterval(metronomeInterval);
    };
  }, [metronomeInterval]);

  const handleNotesChange = (text: string) => {
    setSessionNotes(text);
    updateSessionNotes(text);
  };

  const formatSessionTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div id="studio-session-view" className="space-y-4">
      {/* Top Session Status Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-[#0F1218] via-[#141820] to-[#0F1218] p-6 shadow-xl shadow-emerald-500/5 md:flex-row md:items-center">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-black shadow-lg shadow-emerald-500/30">
            <Flame className={`h-6 w-6 stroke-[2.5] ${activeSession?.isRunning ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <h2 className="text-xl font-bold tracking-tight text-slate-100">
                Active Studio Session
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Focused beat making, stem listening, and deep creative flow.
            </p>
          </div>
        </div>

        {/* Big Digital Timer & Session Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-[#1E2430] bg-[#0A0C10] px-5 py-2 text-center">
            <div className="font-mono text-2xl font-bold tracking-wider text-emerald-400">
              {formatSessionTime(sessionTime)}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Elapsed Time
            </span>
          </div>

          {activeSession ? (
            <div className="flex items-center space-x-2">
              {activeSession.isRunning ? (
                <button
                  onClick={pauseSession}
                  className="flex items-center space-x-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-400 transition hover:bg-amber-500/20"
                >
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={resumeSession}
                  className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
                >
                  <Play className="h-4 w-4 fill-black" />
                  <span>Resume</span>
                </button>
              )}

              <button
                onClick={endSession}
                className="flex items-center space-x-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-400 transition hover:bg-rose-500/20"
              >
                <Square className="h-4 w-4 fill-rose-400" />
                <span>Finish Session</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => startSession()}
              className="flex items-center space-x-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
            >
              <Flame className="h-4 w-4" />
              <span>Start New Studio Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Console Split: Metronome & Audio Generator vs Scratchpad */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Metronome & Live Audio Controls (6 cols) */}
        <div className="space-y-4 lg:col-span-6">
          {/* Metronome Console */}
          <div className="rounded-2xl border border-[#1E2430] bg-[#0F1218] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Live Studio Metronome</h3>
              </div>
              <span className="font-mono text-sm font-bold text-emerald-400">
                {metronomeBpm} BPM
              </span>
            </div>

            <div className="mt-4 flex items-center space-x-3">
              <button
                onClick={toggleMetronome}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl font-bold transition ${
                  metronomeActive
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 animate-pulse'
                    : 'border border-[#1E2430] bg-[#141820] text-slate-300 hover:text-slate-100 hover:border-emerald-500/40'
                }`}
              >
                {metronomeActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-slate-300 ml-0.5" />}
              </button>

              <div className="flex-1">
                <input
                  type="range"
                  min="50"
                  max="220"
                  value={metronomeBpm}
                  onChange={(e) => setMetronomeBpm(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>50 BPM (Chill)</span>
                  <span>140 BPM (Trap)</span>
                  <span>174 BPM (D&B)</span>
                </div>
              </div>
            </div>

            {/* Quick BPM preset buttons */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[80, 92, 120, 140, 160, 174].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setMetronomeBpm(preset)}
                  className={`rounded-lg px-2.5 py-1 font-mono text-xs font-semibold transition ${
                    metronomeBpm === preset
                      ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                      : 'border border-[#1E2430] bg-[#0A0C10] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Beat Selector for Session */}
          <div className="rounded-2xl border border-[#1E2430] bg-[#0F1218] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Music2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Active Reference Beat</h3>
              </div>
              {currentBeat && (
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  {currentBeat.bpm} BPM · {currentBeat.key}
                </span>
              )}
            </div>

            <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
              {beats.map((b) => {
                const isSelected = currentBeat?.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => playBeat(b)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition ${
                      isSelected
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-[#1E2430] bg-[#0A0C10] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSelected && isPlaying) pause();
                          else playBeat(b);
                        }}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                          isSelected && isPlaying
                            ? 'bg-emerald-500 text-black'
                            : 'border border-slate-700 bg-[#141820] text-slate-300'
                        }`}
                      >
                        {isSelected && isPlaying ? (
                          <Pause className="h-3.5 w-3.5" />
                        ) : (
                          <Play className="h-3.5 w-3.5 fill-slate-300 ml-0.5" />
                        )}
                      </button>
                      <span className="text-xs font-semibold text-slate-200">
                        {b.title}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] text-slate-400">
                        {b.bpm} BPM
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenBeatDetail(b.id);
                        }}
                        className="rounded px-1.5 py-0.5 text-[10px] text-slate-500 hover:text-emerald-400"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Scratchpad & Production Log Notes (6 cols) */}
        <div className="space-y-4 lg:col-span-6">
          <div className="flex h-full flex-col justify-between rounded-2xl border border-[#1E2430] bg-[#0F1218] p-5 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100">
                    Live Session Scratchpad & Log
                  </h3>
                </div>
                <span className="rounded-md border border-[#1E2430] bg-[#0A0C10] px-2 py-0.5 text-[10px] font-mono text-slate-400">
                  Auto-saved
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Log melody notes, mixing ideas, plug-in chains, and arrangement tweaks in real time.
              </p>

              <textarea
                rows={12}
                value={sessionNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="• 00:15 - Tweaked cutoff filter on synth pad&#10;• 00:45 - Rendered vocal chops in D minor&#10;• Need to automate sidechain compression on sub bass..."
                className="mt-3.5 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] p-3.5 font-mono text-xs text-slate-100 outline-none transition focus:border-emerald-500/60 focus:bg-[#141820]"
              />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#1E2430] pt-3 text-xs text-slate-400">
              <span>{sessionNotes.length} characters logged</span>
              <button
                onClick={() => handleNotesChange(sessionNotes + '\n• ')}
                className="font-semibold text-emerald-400 hover:underline"
              >
                + Add Bullet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
