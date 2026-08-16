import React, { useState } from 'react';
import { X, FolderPlus, Check, Plus } from 'lucide-react';
import { Beat } from '../../types';
import { useMusic } from '../../context/MusicContext';

interface AddToPlaylistModalProps {
  beat: Beat | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCreatePlaylist: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  beat,
  isOpen,
  onClose,
  onOpenCreatePlaylist,
}) => {
  const { playlists, addBeatToPlaylist, removeBeatFromPlaylist } = useMusic();

  if (!isOpen || !beat) return null;

  const handleToggle = async (playlistId: string, isIncluded: boolean) => {
    if (isIncluded) {
      await removeBeatFromPlaylist(playlistId, beat.id);
    } else {
      await addBeatToPlaylist(playlistId, beat.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div
        id="modal-add-to-playlist"
        className="relative z-10 w-full max-w-md rounded-2xl border border-[#1E2430] bg-[#0F1218] p-6 shadow-2xl transition-all"
      >
        <div className="flex items-center justify-between border-b border-[#1E2430] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FolderPlus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Add to Playlist
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">
                {beat.title}
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

        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
          {playlists.map((pl) => {
            const isIncluded = pl.beatIds.includes(beat.id);
            return (
              <div
                key={pl.id}
                onClick={() => handleToggle(pl.id, isIncluded)}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                  isIncluded
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-[#1E2430] bg-[#0A0C10] hover:border-slate-700 hover:bg-[#141820]'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-200">{pl.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {pl.beatIds.length} tracks
                  </div>
                </div>

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-lg border transition ${
                    isIncluded
                      ? 'border-emerald-500 bg-emerald-500 text-black'
                      : 'border-slate-700 bg-[#141820] text-transparent'
                  }`}
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              </div>
            );
          })}

          {playlists.length === 0 && (
            <p className="py-4 text-center text-xs text-slate-500">
              No playlists found. Create one below!
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#1E2430] pt-4">
          <button
            onClick={() => {
              onClose();
              onOpenCreatePlaylist();
            }}
            className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Playlist</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black shadow-md shadow-emerald-500/20 hover:bg-emerald-400"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
