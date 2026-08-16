import React, { useState } from 'react';
import { X, FolderPlus, Check } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createPlaylist } = useMusic();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createPlaylist(name.trim(), description.trim());
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div
        id="modal-create-playlist"
        className="relative z-10 w-full max-w-md rounded-2xl border border-[#1E2430] bg-[#0F1218] p-6 shadow-2xl transition-all"
      >
        <div className="flex items-center justify-between border-b border-[#1E2430] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FolderPlus className="h-4 w-4 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              Create New Playlist
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#141820] hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Playlist Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Liquid Vibes 2026 / EP Master Candidates"
              className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3.5 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Curated beats for studying, mixing, or album tracklist."
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
              className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
            >
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Create Playlist</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
