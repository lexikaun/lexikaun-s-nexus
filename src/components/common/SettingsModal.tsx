import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Database,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  Check,
  Volume2,
  Sliders,
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { useMusic } from '../../context/MusicContext';
import { useAuth } from '../../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { tasks, goals, reviews } = usePlanner();
  const { beats, playlists } = useMusic();
  const { resetUserToDefaults } = useAuth();

  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExportData = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      tasks,
      goals,
      beats,
      playlists,
      reviews,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lexikauns-nexus-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div
        id="modal-settings"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-[#1E2430] bg-[#0F1218] p-6 shadow-2xl transition-all"
      >
        <div className="flex items-center justify-between border-b border-[#1E2430] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Settings className="h-4 w-4 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              System Settings & Data
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#141820] hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Data Storage & Backup */}
          <div className="rounded-xl border border-[#1E2430] bg-[#141820] p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
              <Database className="h-4 w-4 text-emerald-400" />
              <span>Storage & Data Management</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Your tasks, goals, and beats are persisted in local browser storage and cloud database.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-[#0A0C10] p-2.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Tasks & Goals</span>
                <div className="font-mono font-bold text-slate-200">{tasks.length} tasks · {goals.length} goals</div>
              </div>
              <div className="rounded-lg bg-[#0A0C10] p-2.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Beats & Playlists</span>
                <div className="font-mono font-bold text-slate-200">{beats.length} beats · {playlists.length} playlists</div>
              </div>
            </div>

            <div className="mt-3 flex items-center space-x-2">
              <button
                onClick={handleExportData}
                className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-black shadow-md shadow-emerald-500/20 hover:bg-emerald-400"
              >
                {exportSuccess ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <Download className="h-3.5 w-3.5" />}
                <span>{exportSuccess ? 'Exported Backup!' : 'Export JSON Backup'}</span>
              </button>

              <button
                onClick={async () => {
                  if (window.confirm('Reset all tasks, goals, and beats to default state?')) {
                    await resetUserToDefaults();
                    onClose();
                  }
                }}
                className="flex items-center space-x-1.5 rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset Demo State</span>
              </button>
            </div>
          </div>

          {/* Audio Engine Info */}
          <div className="rounded-xl border border-[#1E2430] bg-[#141820] p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
              <Volume2 className="h-4 w-4 text-emerald-400" />
              <span>Web Audio Synthesizer Engine</span>
            </div>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              When audio files are offline or loading, the built-in multi-oscillator Web Audio engine procedural synth plays tempo-synchronized stems and metronome pulses.
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end border-t border-[#1E2430] pt-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black shadow-md shadow-emerald-500/20 hover:bg-emerald-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
