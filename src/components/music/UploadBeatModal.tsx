import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Music2,
  FileAudio,
  Check,
  Sparkles,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { BeatStatus } from '../../types';
import { saveAudioToIndexedDB } from '../../services/indexedDbStorage';

interface UploadBeatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadBeatModal: React.FC<UploadBeatModalProps> = ({ isOpen, onClose }) => {
  const { addBeat } = useMusic();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [title, setTitle] = useState('');
  const [bpm, setBpm] = useState<number>(120);
  const [key, setKey] = useState('C minor');
  const [genre, setGenre] = useState('Trap / Beats');
  const [tagsString, setTagsString] = useState('custom, 808, demo');
  const [status, setStatus] = useState<BeatStatus>('wip');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState<number>(120);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processAudioFile = async (file: File) => {
    setIsProcessing(true);
    setSelectedFile(file);

    // Auto title from filename without extension
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    if (!title) {
      setTitle(baseName.replace(/[_-]/g, ' '));
    }

    try {
      // Create local object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setAudioUrl(objectUrl);

      // Analyze audio duration with AudioContext
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const calcDuration = Math.round(decodedBuffer.duration);
      setDuration(calcDuration || 120);
    } catch (err) {
      console.warn('Could not decode audio metadata, using defaults:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAudioFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAudioFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsProcessing(true);
    let blobId: string | undefined = undefined;

    if (selectedFile) {
      try {
        const id = `beat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await saveAudioToIndexedDB(id, selectedFile);
        blobId = id;
      } catch (err) {
        console.warn('Error caching audio to IndexedDB:', err);
      }
    }

    const tagsArray = tagsString
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    await addBeat({
      title: title.trim(),
      audioUrl: audioUrl || '',
      audioBlobId: blobId,
      duration: duration || 120,
      bpm: Number(bpm) || 120,
      key: key.trim() || 'C minor',
      genre: genre.trim() || 'Beats',
      tags: tagsArray,
      status,
      notes: notes.trim(),
      fileFormat: selectedFile ? selectedFile.type : 'audio/wav',
      fileSize: selectedFile ? selectedFile.size : undefined,
    });

    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div
        id="modal-upload-beat"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#1E2430] bg-[#0F1218] p-6 shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2430] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Upload className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Upload Beat to Vault
              </h3>
              <p className="text-xs text-slate-400">
                Upload audio files with instant browser caching & metadata.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#141820] hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition text-center ${
            dragActive
              ? 'border-emerald-500 bg-emerald-500/10'
              : selectedFile
              ? 'border-emerald-500/40 bg-[#141820]'
              : 'border-[#1E2430] bg-[#0A0C10] hover:border-slate-700 hover:bg-[#141820]/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.wav,.mp3,.aac,.ogg,.flac,.m4a"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex items-center space-x-3 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-black">
                <FileAudio className="h-5 w-5" />
              </div>
              <div className="truncate">
                <div className="truncate text-xs font-bold text-slate-100">
                  {selectedFile.name}
                </div>
                <div className="font-mono text-[11px] text-emerald-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · {duration}s
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1E2430] bg-[#141820] text-emerald-400 shadow-sm">
                <Music2 className="h-6 w-6 stroke-[2.5]" />
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-200">
                Click or drag & drop audio track here
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Supports WAV, MP3, AAC, FLAC (Cached safely in local IndexedDB)
              </p>
            </>
          )}
        </div>

        {/* Metadata Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Beat Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midnight Mirage"
              className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3.5 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                BPM (Tempo)
              </label>
              <input
                type="number"
                min="40"
                max="260"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-2 font-mono text-xs text-slate-100 outline-none focus:border-emerald-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Musical Key
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="e.g. F# minor"
                className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-2 font-mono text-xs text-slate-100 outline-none focus:border-emerald-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Genre
              </label>
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
              <label className="block text-xs font-semibold text-slate-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BeatStatus)}
                className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-2 text-xs text-slate-200 outline-none"
              >
                <option value="wip">Work in Progress (WIP)</option>
                <option value="finished">Finished Master</option>
                <option value="released">Released</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                placeholder="808, trap, dark, sample"
                className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Notes & Arrangement Log
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Track structure, vst instruments used, sample credits..."
              className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 border-t border-[#1E2430] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-[#141820]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !title.trim()}
              className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-50"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              <span>{isProcessing ? 'Processing Audio...' : 'Save to Beat Vault'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
